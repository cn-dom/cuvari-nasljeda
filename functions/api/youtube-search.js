const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
});

export async function onRequest({ request, env }) {
  if (request.method !== "GET") {
    return json({ error: "Dopuštena je samo GET metoda." }, 405, { allow: "GET" });
  }

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim().slice(0, 160);
  if (query.length < 2) return json({ error: "Upiši barem dva znaka za pretragu." }, 400);
  if (!env.YOUTUBE_API_KEY) {
    return json({ error: "YouTube pretraga još nije aktivirana. Administrator treba dodati YOUTUBE_API_KEY kao Cloudflare tajnu." }, 503);
  }

  const cacheUrl = new URL(url.origin + "/api/youtube-search-cache");
  cacheUrl.searchParams.set("q", query.toLocaleLowerCase("hr"));
  const cacheRequest = new Request(cacheUrl.toString(), { method: "GET" });
  const cache = typeof caches !== "undefined" ? caches.default : null;
  if (cache) {
    const cached = await cache.match(cacheRequest);
    if (cached) return cached;
  }

  const apiUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  apiUrl.searchParams.set("part", "snippet");
  apiUrl.searchParams.set("type", "video");
  apiUrl.searchParams.set("maxResults", "12");
  apiUrl.searchParams.set("safeSearch", "moderate");
  apiUrl.searchParams.set("relevanceLanguage", "hr");
  apiUrl.searchParams.set("regionCode", "HR");
  apiUrl.searchParams.set("q", query);
  apiUrl.searchParams.set("key", env.YOUTUBE_API_KEY);

  try {
    const upstream = await fetch(apiUrl.toString());
    const payload = await upstream.json();
    if (!upstream.ok) {
      const status = upstream.status === 403 ? 503 : upstream.status;
      return json({
        error: upstream.status === 403
          ? "YouTube API nije dostupan. Provjeri API ključ, uključeni YouTube Data API v3 i kvotu."
          : "YouTube trenutačno nije vratio rezultate. Pokušaj ponovno kasnije."
      }, status);
    }

    const items = (Array.isArray(payload.items) ? payload.items : []).map((item) => ({
      id: { videoId: item.id?.videoId || "" },
      snippet: {
        title: item.snippet?.title || "",
        description: item.snippet?.description || "",
        channelTitle: item.snippet?.channelTitle || "",
        publishedAt: item.snippet?.publishedAt || "",
        thumbnails: item.snippet?.thumbnails || {},
      },
    })).filter((item) => item.id.videoId);

    const response = json({ items }, 200, { "cache-control": "public, max-age=300, s-maxage=600" });
    if (cache) await cache.put(cacheRequest, response.clone());
    return response;
  } catch {
    return json({ error: "Povezivanje s YouTubeom trenutačno nije uspjelo." }, 502);
  }
}
