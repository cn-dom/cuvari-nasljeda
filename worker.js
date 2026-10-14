export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/liturgy") {
      const slug = url.searchParams.get("slug") || "";
      if (!/^(ponedjeljak|utorak|srijeda|četvrtak|petak|subota|nedjelja)-\d{1,2}-\d{1,2}-\d{4}$/.test(slug)) {
        return Response.json({ error: "Neispravan datum liturgije." }, { status: 400 });
      }

      const path = "liturgija-dana/" + slug + "/";
      const sources = [
        "https://r.jina.ai/http://hilp.hr/" + path,
        "https://r.jina.ai/https://hilp.hr/" + path
      ];

      for (const source of sources) {
        try {
          const upstream = await fetch(source, {
            headers: { "Accept": "text/plain", "User-Agent": "PatriaSoul/1.0 daily-liturgy" },
            cf: { cacheTtl: 1800, cacheEverything: true }
          });
          if (!upstream.ok) continue;
          const body = await upstream.text();
          if (body.length < 500 || !/Evanđelje/i.test(body)) continue;

          return new Response(body, {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "public, max-age=900, s-maxage=1800",
              "X-Content-Type-Options": "nosniff"
            }
          });
        } catch {
          // Try the alternate upstream URL before returning an error.
        }
      }

      return Response.json(
        { error: "Liturgijski izvor HILP trenutačno nije dostupan." },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
