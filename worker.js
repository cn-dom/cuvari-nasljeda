const htmlToText = (html) => {
  return String(html || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<h[1-6][^>]*>/gi, "\n#### ")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|li|section|article|tr|blockquote)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/saint") {
      if (request.method !== "GET") {
        return new Response("Method not allowed", { status: 405, headers: { Allow: "GET" } });
      }

      const date = url.searchParams.get("date") || "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return Response.json({ error: "Neispravan datum sveca dana." }, { status: 400 });
      }

      try {
        const upstream = await fetch("https://katolicki-kalendar.verbum.hr/kalendar/" + date + "/", {
          headers: {
            "Accept": "text/html",
            "User-Agent": "Mozilla/5.0 (compatible; PatriaSoulCalendar/1.0)"
          },
          cf: { cacheTtl: 3600, cacheEverything: true }
        });
        if (!upstream.ok) throw new Error("Kalendar HTTP " + upstream.status);

        const body = htmlToText(await upstream.text());
        const sectionMatch = body.match(/Sveci i imendani\s*([\s\S]*?)(?=\n(?:####\s*)?Ukratko\b|$)/i);
        const section = sectionMatch?.[1]?.replace(/\s+/g, " ").trim() || "";
        const names = section.replace(/^(?:Koji se sveci slave i tko ima imendan[^?]*\?\s*)/i, "").replace(/\b(?:U kalendaru|Podijelite|Markdown)\b/gi, " ").replace(/\s+/g, " ").replace(/[|•·]+$/g, "").trim();
        if (names.length < 3 || names.length > 240) throw new Error("Kalendar ne sadrži očekivani popis svetaca.");

        return Response.json(
          { date, names, source: "Katolički kalendar Verbum", sourceUrl: "https://katolicki-kalendar.verbum.hr/kalendar/" + date + "/" },
          { headers: { "Cache-Control": "public, max-age=1800, s-maxage=3600", "X-Content-Type-Options": "nosniff" } }
        );
      } catch {
        return Response.json(
          { error: "Katolički kalendar trenutačno nije dostupan." },
          { status: 502, headers: { "Cache-Control": "no-store" } }
        );
      }
    }

    if (url.pathname === "/api/liturgy") {
      if (request.method !== "GET") {
        return new Response("Method not allowed", { status: 405, headers: { Allow: "GET" } });
      }

      const slug = url.searchParams.get("slug") || "";
      if (!/^(ponedjeljak|utorak|srijeda|četvrtak|cetvrtak|petak|subota|nedjelja)-\d{1,2}-\d{1,2}-\d{4}$/.test(slug)) {
        return Response.json({ error: "Neispravan datum liturgije." }, { status: 400 });
      }

      const page = "https://hilp.hr/liturgija-dana/" + slug + "/";
      const sources = [
        { url: page, html: true },
        { url: "https://r.jina.ai/https://hilp.hr/liturgija-dana/" + slug + "/", html: false },
        { url: "https://r.jina.ai/http://hilp.hr/liturgija-dana/" + slug + "/", html: false }
      ];

      for (const source of sources) {
        try {
          const upstream = await fetch(source.url, {
            headers: {
              "Accept": source.html ? "text/html, text/plain;q=0.9" : "text/plain",
              "User-Agent": "Mozilla/5.0 (compatible; PatriaSoulLiturgija/1.0)"
            },
            cf: { cacheTtl: 900, cacheEverything: true }
          });
          if (!upstream.ok) continue;

          const original = await upstream.text();
          const body = source.html ? htmlToText(original) : original;
          if (body.length < 500 || !/Evanđelje/i.test(body) || !/(Lk|Mt|Mk|Iv)\s*\d/i.test(body)) continue;

          return new Response(body, {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "public, max-age=900, s-maxage=900",
              "X-Content-Type-Options": "nosniff"
            }
          });
        } catch {
          // Pokušaj sljedeći izvor prije prikaza poruke o nedostupnosti.
        }
      }

      return Response.json(
        { error: "Liturgijski izvor HILP trenutačno nije dostupan." },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (url.pathname === "/api/youtube-search") {
      if (request.method !== "GET") {
        return Response.json({ error: "Dopuštena je samo GET metoda." }, { status: 405, headers: { Allow: "GET" } });
      }

      const query = (url.searchParams.get("q") || "").trim().slice(0, 160);
      const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers }
      });

      if (query.length < 2) return json({ error: "Upiši barem dva znaka za pretragu." }, 400);
      if (!env.YOUTUBE_API_KEY) return json({ error: "YouTube pretraga nije aktivirana: nedostaje Cloudflare tajna YOUTUBE_API_KEY." }, 503);

      const cache = typeof caches !== "undefined" ? caches.default : null;
      const cacheUrl = new URL("/api/youtube-search-cache", url.origin);
      cacheUrl.searchParams.set("q", query.toLocaleLowerCase("hr"));
      const cacheRequest = new Request(cacheUrl.toString(), { method: "GET" });
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
        let payload;
        try {
          payload = await upstream.json();
        } catch {
          return json({ error: "YouTube je vratio neispravan odgovor. Pokušaj ponovno kasnije." }, 502);
        }
        if (!upstream.ok) {
          return json({
            error: upstream.status === 403
              ? "YouTube API nije dostupan. Provjeri API ključ, uključen YouTube Data API v3 i kvotu."
              : "YouTube trenutačno nije vratio rezultate. Pokušaj ponovno kasnije."
          }, upstream.status === 403 ? 503 : upstream.status);
        }

        const items = (Array.isArray(payload.items) ? payload.items : []).map((item) => ({
          id: { videoId: item.id?.videoId || "" },
          snippet: {
            title: item.snippet?.title || "",
            description: item.snippet?.description || "",
            channelTitle: item.snippet?.channelTitle || "",
            publishedAt: item.snippet?.publishedAt || "",
            thumbnails: item.snippet?.thumbnails || {}
          }
        })).filter((item) => item.id.videoId);

        const response = json({ items }, 200, { "Cache-Control": "public, max-age=300, s-maxage=600" });
        if (cache) await cache.put(cacheRequest, response.clone());
        return response;
      } catch {
        return json({ error: "Povezivanje s YouTubeom trenutačno nije uspjelo." }, 502);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
