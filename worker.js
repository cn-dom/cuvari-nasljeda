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

    if (url.pathname === "/api/liturgy") {
      if (request.method !== "GET") {
        return new Response("Method not allowed", { status: 405, headers: { Allow: "GET" } });
      }

      const slug = url.searchParams.get("slug") || "";
      if (!/^(ponedjeljak|utorak|srijeda|četvrtak|petak|subota|nedjelja)-\d{1,2}-\d{1,2}-\d{4}$/.test(slug)) {
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

    return env.ASSETS.fetch(request);
  }
};
