/// <reference types="node" />
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser } from "playwright";
import { listings, stores } from "../src/data/listings";
import { validImportedPrice } from "../src/services/importedPrices";
import type { ScrapedPrice } from "../src/types";
import { BlockedPage, extractPrice } from "./parse-price";
import { targets, type PriceTarget } from "./price-targets";

const output = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../data/scraped-prices.json",
);
const httpOnly = process.argv.includes("--http-only");
let browser: Browser | undefined;

function checkResponse(status: number, url: string, target: PriceTarget) {
  if ([401, 403, 429].includes(status))
    throw new BlockedPage(`HTTP ${status}; access blocked or rate limited`);
  if (status >= 400) throw new Error(`HTTP ${status}`);
  if (new URL(url).hostname !== new URL(target.url).hostname)
    throw new BlockedPage("Unexpected redirect away from retailer");
}

async function scrape(target: PriceTarget) {
  let result: ReturnType<typeof extractPrice>;
  let pageUrl = target.url as string;
  try {
    const response = await fetch(target.url, {
      signal: AbortSignal.timeout(20_000),
      headers: { Accept: "text/html", "Accept-Language": "en-US,en;q=0.9" },
    });
    checkResponse(response.status, response.url, target);
    result = extractPrice(await response.text(), target);
    pageUrl = response.url;
  } catch (error) {
    if (error instanceof BlockedPage || httpOnly) throw error;
    console.log(
      `  HTTP unavailable: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (!result && !httpOnly) {
    console.log("  Waiting for rendered product price with Playwright…");
    browser ??= await chromium.launch({ headless: true });
    // Isolated sessions: don't read personal browser profiles, log in, or select a fake store.
    const context = await browser.newContext({ locale: "en-US" });
    try {
      const page = await context.newPage();
      const response = await page.goto(target.url, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      if (!response) throw new Error("No page response");
      checkResponse(response.status(), page.url(), target);
      const deadline = Date.now() + 15_000;
      do {
        result = extractPrice(await page.content(), target);
        if (result) break;
        await page.waitForTimeout(1000);
      } while (Date.now() < deadline);
      pageUrl = page.url();
    } finally {
      await context.close();
    }
  }
  if (!result)
    throw new Error(
      "No unambiguous USD price for the exact 12-pack; may require store selection or a parser update",
    );
  const row: ScrapedPrice = {
    productId: target.productId,
    retailer: target.retailer,
    storeId: target.storeId,
    ...result,
    url: pageUrl,
    updatedAt: new Date().toISOString(),
  };
  if (!validImportedPrice(row, listings))
    throw new Error("Result failed validation");
  return row;
}

async function main() {
  if (process.argv.slice(2).some((arg) => arg !== "--http-only"))
    throw new Error("Usage: npm run scrape-prices -- [--http-only]");
  let existing: unknown = [];
  try {
    existing = JSON.parse(await readFile(output, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT")
      throw new Error(
        "Cannot read existing JSON. Fix it before running; the file was not overwritten.",
      );
  }
  if (!Array.isArray(existing))
    throw new Error(
      "Existing JSON must be an array; the file was not overwritten.",
    );
  const rows: ScrapedPrice[] = existing.filter((row) =>
    validImportedPrice(row, listings),
  );
  if (rows.length !== existing.length)
    throw new Error(
      "Existing JSON contains invalid rows. Fix them first; the file was not overwritten.",
    );
  let successes = 0;
  console.log(
    "PriceFinder local import: 2 products × 3 retailers. Online prices are not verified for the mapped branches.",
  );
  try {
    for (const target of targets) {
      console.log(`\n${target.retailer} / ${target.productId}`);
      try {
        if (
          !stores.some(
            (store) =>
              store.storeId === target.storeId &&
              store.storeName === target.retailer,
          )
        )
          throw new Error("Unknown store mapping");
        const row = await scrape(target);
        const previous = rows.findIndex(
          (item) =>
            item.productId === row.productId && item.storeId === row.storeId,
        );
        if (previous >= 0) rows[previous] = row;
        else rows.push(row);
        successes++;
        console.log(
          `  Saved $${row.price.toFixed(2)} · ${row.inStock === null ? "stock unknown" : row.inStock ? "in stock online" : "out of stock online"}`,
        );
      } catch (error) {
        console.warn(
          `  SKIPPED: ${error instanceof Error ? error.message : String(error)}. Previous result kept, if any.`,
        );
      }
    }
  } finally {
    await browser?.close();
  }
  // Stage beside the destination, then rename: an interrupted run can't truncate it.
  await mkdir(dirname(output), { recursive: true });
  await writeFile(
    `${output}.tmp`,
    `${JSON.stringify(rows, null, 2)}\n`,
    "utf8",
  );
  await rename(`${output}.tmp`, output);
  console.log(
    `\n${successes}/${targets.length} updated; ${rows.length} saved observations total.\n${output}\nStart/restart Expo to bundle this snapshot. Failed checks never advance updatedAt.`,
  );
  if (!successes) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
