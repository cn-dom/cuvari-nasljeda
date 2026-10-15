import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:4173";
const routes = [
  "/", "/forum.html", "/stranice.html", "/dogadaji.html",
  "/vjera-hrvata.html", "/na-danasnji-dan.html", "/administracija.html",
  "/ai-centar.html", "/virtualni-muzej.html", "/vrijeme.html",
  "/kviz/", "/kviz/hrvatski-kviz/", "/kviz/dnevni-kviz/",
  "/kviz/gradovi-hrvatske/", "/kviz/brani-svoj-grad/",
];

const browser = await chromium.launch({ headless: true });
const failures = [];
try {
  for (const route of routes) {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    // External APIs are not part of this render smoke test; keep it deterministic.
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)(?!localhost)/, route => route.abort());
    try {
      const response = await page.goto(new URL(route, base).href, { waitUntil: "domcontentloaded", timeout: 20000 });
      assert.ok(response && response.status() === 200, `${route}: expected HTTP 200`);
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(300);
      const bodyText = (await page.locator("body").innerText().catch(() => "")).trim();
      assert.ok(bodyText.length >= 8, `${route}: page body is blank`);
      const root = page.locator("#root");
      if (await root.count()) {
        const rootText = (await root.innerText().catch(() => "")).trim();
        assert.ok(rootText.length >= 8, `${route}: React root is blank`);
      }
      assert.deepEqual(pageErrors, [], `${route}: uncaught browser runtime error(s): ${pageErrors.join("; ")}`);
      console.log(`PASS browser render ${route}`);
    } catch (error) {
      failures.push(`${route}: ${error.message}`);
      await page.screenshot({ path: `/tmp/browser-failure-${route.replace(/[^a-z0-9]+/gi, "_") || "home"}.png`, fullPage: true }).catch(() => {});
      console.error(`FAIL browser render ${route}: ${error.message}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error("\nBrowser smoke failures:\n" + failures.join("\n"));
  process.exit(1);
}
console.log(`Browser smoke passed: ${routes.length} routes rendered without blank content or uncaught page errors. Authenticated end-to-end flows still require dedicated test accounts.`);
