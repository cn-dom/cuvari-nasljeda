import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:4173";
const routes = [
  "/", "/forum.html", "/stranice.html", "/dogadaji.html",
  "/vjera-hrvata.html", "/na-danasnji-dan.html", "/administracija.html",
  "/ai-centar.html", "/video-arhiva.html", "/hrvatski-val.html", "/vrijeme.html",
  "/kviz/", "/kviz/?mode=words", "/kviz/hrvatski-kviz/", "/kviz/dnevni-kviz/",
  "/kviz/gradovi-hrvatske/", "/kviz/brani-svoj-grad/",
];

const browser = await chromium.launch({ headless: true });
const failures = [];
try {
  for (const route of routes) {
    const page = await browser.newPage();
    const pageErrors = [];
    const consoleErrors = [];
    const failedRequests = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    page.on("console", message => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", request => failedRequests.push(
      `${request.url()}: ${request.failure()?.errorText || "request failed"}`
    ));
    // External APIs are not part of this render smoke test; keep it deterministic.
    await page.route("**/*", route => {
      const parsed = new URL(route.request().url());
      if (["http:", "https:"].includes(parsed.protocol) && !["127.0.0.1", "localhost"].includes(parsed.hostname)) {
        return route.abort();
      }
      return route.continue();
    });
    try {
      const response = await page.goto(new URL(route, base).href, { waitUntil: "domcontentloaded", timeout: 20000 });
      assert.ok(response && response.status() === 200, `${route}: expected HTTP 200`);
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
      const bodyText = (await page.locator("body").innerText().catch(() => "")).trim();
      if (bodyText.length < 8) {
        const details = [
          `body.innerText length=${bodyText.length}`,
          `root HTML=${(await page.locator("#root").innerHTML().catch(() => "")).slice(0, 500)}`,
          `page errors=${pageErrors.join(" | ") || "none"}`,
          `console errors=${consoleErrors.join(" | ") || "none"}`,
          `failed requests=${failedRequests.join(" | ") || "none"}`,
        ].join("; ");
        throw new Error(`${route}: page body is blank; ${details}`);
      }
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

  // Mobile interaction smoke for the supplied-letter word game.
  {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    await page.route("**/*", route => {
      const parsed = new URL(route.request().url());
      if (["http:", "https:"].includes(parsed.protocol) && !["127.0.0.1", "localhost"].includes(parsed.hostname)) {
        return route.abort();
      }
      return route.continue();
    });
    try {
      const response = await page.goto(new URL("/kviz/?mode=words", base).href, { waitUntil: "domcontentloaded", timeout: 20000 });
      assert.ok(response && response.status() === 200, "word games should return HTTP 200");
      await page.getByRole("button", { name: "Otvori igru: Složi riječ" }).tap();
      await page.getByText("SLOŽI RIJEČ DODIRIVANJEM SLOVA").waitFor({ state: "visible", timeout: 10000 });
      const offeredLetters = page.getByRole("button", { name: /^Odaberi slovo / });
      assert.ok(await offeredLetters.count() >= 4, "the game should offer its own shuffled letter tiles");
      assert.equal(await page.getByRole("button", { name: "A", exact: true }).count(), 0, "the scramble game must not display a separate alphabet keyboard");
      await offeredLetters.first().tap();
      assert.equal(await page.getByRole("button", { name: /^Ukloni slovo / }).count(), 1, "tapping a supplied tile should place one letter in the answer");
      await page.getByRole("button", { name: "Očisti odabir" }).tap();
      assert.equal(await page.getByRole("button", { name: /^Ukloni slovo / }).count(), 0, "the selection should be clearable by touch");
      const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      assert.equal(hasHorizontalOverflow, false, "the word game should fit a 390px mobile viewport without horizontal overflow");

      for (const title of ["Pronađi riječ", "Pogodi riječ", "Poveži pojmove", "Dnevni pojam", "Riječi domovine"]) {
        await page.getByRole("button", { name: "Sve igre" }).tap();
        await page.getByRole("button", { name: `Otvori igru: ${title}` }).tap();
        await page.waitForTimeout(150);
        const gameOverflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
        assert.equal(gameOverflows, false, `${title} should fit a 390px mobile viewport without horizontal overflow`);
        const backLabel = title === "Riječi domovine" ? "Natrag na kviz" : "Sve igre";
        await page.getByRole("button", { name: backLabel }).waitFor({ state: "visible", timeout: 5000 });
      }
      assert.deepEqual(pageErrors, [], `word game interaction produced browser errors: ${pageErrors.join("; ")}`);
      console.log("PASS word game supplied-letter tap and mobile layout");
    } catch (error) {
      failures.push(`/kviz/?mode=words interaction: ${error.message}`);
      console.error(`FAIL word game mobile interaction: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  // Desktop mouse interaction smoke for the same supplied-letter game.
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    await page.route("**/*", route => {
      const parsed = new URL(route.request().url());
      if (["http:", "https:"].includes(parsed.protocol) && !["127.0.0.1", "localhost"].includes(parsed.hostname)) {
        return route.abort();
      }
      return route.continue();
    });
    try {
      const response = await page.goto(new URL("/kviz/?mode=words", base).href, { waitUntil: "domcontentloaded", timeout: 20000 });
      assert.ok(response && response.status() === 200, "word games should return HTTP 200 on desktop");
      await page.getByRole("button", { name: "Otvori igru: Složi riječ" }).click();
      await page.getByText("SLOŽI RIJEČ DODIRIVANJEM SLOVA").waitFor({ state: "visible", timeout: 10000 });
      await page.getByRole("button", { name: /^Odaberi slovo / }).first().click();
      assert.equal(await page.getByRole("button", { name: /^Ukloni slovo / }).count(), 1, "mouse click should place one supplied letter in the answer");
      assert.deepEqual(pageErrors, [], `desktop word game interaction produced browser errors: ${pageErrors.join("; ")}`);
      console.log("PASS word game supplied-letter mouse interaction");
    } catch (error) {
      failures.push(`/kviz/?mode=words desktop interaction: ${error.message}`);
      console.error(`FAIL word game desktop interaction: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  // Dedicated smoke for the video archive: add a URL, render its card, and open the embedded player.
  {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    await page.route("**/*", route => {
      const parsed = new URL(route.request().url());
      if (["http:", "https:"].includes(parsed.protocol) && !["127.0.0.1", "localhost"].includes(parsed.hostname)) {
        return route.abort();
      }
      return route.continue();
    });
    try {
      const response = await page.goto(new URL("/video-arhiva.html", base).href, { waitUntil: "domcontentloaded", timeout: 20000 });
      assert.ok(response && response.status() === 200, "video archive should return HTTP 200");
      await page.getByRole("heading", { name: /Priče koje/ }).waitFor({ state: "visible", timeout: 10000 });
      await page.getByRole("button", { name: /Dodaj prvi video/ }).click();
      await page.locator('input[placeholder^="https://www.youtube.com/watch?v="]').fill("https://youtu.be/dQw4w9WgXcQ");
      await page.locator('input[placeholder="Npr. naslov dokumentarnog filma"]').fill("E2E test video");
      await page.getByRole("button", { name: /Spremi zapis/ }).click();
      await page.locator(".psv-card-title", { hasText: "E2E test video" }).waitFor({ state: "visible", timeout: 5000 });
      await page.getByRole("button", { name: /Pusti video: E2E test video/ }).click();
      await page.locator('iframe[title="E2E test video"]').waitFor({ state: "visible", timeout: 5000 });
      assert.match(await page.locator("iframe").getAttribute("src"), /dQw4w9WgXcQ/, "player should embed the submitted YouTube ID");
      assert.deepEqual(pageErrors, [], `video archive interaction produced browser errors: ${pageErrors.join("; ")}`);
      console.log("PASS video archive add-and-play interaction");
    } catch (error) {
      failures.push(`/video-arhiva.html interaction: ${error.message}`);
      console.error(`FAIL video archive interaction: ${error.message}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error("\\nBrowser smoke failures:\\n" + failures.join("\\n"));
  process.exit(1);
}
console.log(`Browser smoke passed: ${routes.length} routes rendered without blank content or uncaught page errors. Authenticated end-to-end flows still require dedicated test accounts.`);
