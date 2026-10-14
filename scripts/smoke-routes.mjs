import assert from "node:assert/strict";

const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:4173";
const routes = [
  "/",
  "/forum.html",
  "/stranice.html",
  "/dogadaji.html",
  "/vjera-hrvata.html",
  "/administracija.html",
  "/ai-centar.html",
  "/kviz/",
];

async function request(path) {
  const response = await fetch(new URL(path, base), { redirect: "follow" });
  assert.equal(response.status, 200, `${path} returned HTTP ${response.status}`);
  return response;
}

for (const route of routes) {
  const response = await request(route);
  const contentType = response.headers.get("content-type") || "";
  assert.match(contentType, /text\/html/i, `${route} should return HTML`);
  const html = await response.text();
  assert.ok(html.trim().length > 100, `${route} returned an empty HTML document`);
  console.log(`PASS route ${route}`);
}

const rootResponse = await request("/");
const rootHtml = await rootResponse.text();
assert.match(rootHtml, /<meta[^>]+name="viewport"/i, "The app must define a mobile viewport");
assert.match(rootHtml, /<div id="root"><\/div>/i, "The main React mount point is missing");

const requiredAssets = [
  "/manifest.webmanifest",
  "/sw.js",
  "/assets/images/logo%20Patriasoul.png",
  "/assets/images/1000000982.png",
  "/vjera-hrvata.css",
  "/vjera-hrvata.js",
];

for (const asset of requiredAssets) {
  const response = await request(asset);
  const bytes = await response.arrayBuffer();
  assert.ok(bytes.byteLength > 0, `${asset} is empty`);
  console.log(`PASS asset ${asset}`);
}

const assetPaths = [
  ...rootHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g),
].map((match) => match[1]).filter((path) => /\.(?:js|css)(?:\?|$)/i.test(path));

assert.ok(assetPaths.some((path) => /\.js(?:\?|$)/i.test(path)), "No compiled JavaScript bundle was found in index.html");
for (const asset of [...new Set(assetPaths)]) {
  const response = await request(asset);
  const bytes = await response.arrayBuffer();
  assert.ok(bytes.byteLength > 0, `Compiled asset ${asset} is empty`);
  console.log(`PASS bundle ${asset}`);
}

console.log(`Smoke test passed: ${routes.length} routes and ${requiredAssets.length + new Set(assetPaths).size} assets.`);
