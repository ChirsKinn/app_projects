/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { listings } from "../src/data/listings";
import {
  mergeImportedPrices,
  priceCheckedLabel,
  stockLabel,
} from "../src/services/importedPrices";
import { sortListings } from "../src/services/productService";

const row = {
  productId: "monster-12",
  retailer: "Walmart",
  storeId: "walmart-st-george-demo",
  productName: "Monster Energy 12 Pack",
  price: 20.12,
  url: "https://www.walmart.com/ip/581272641",
  inStock: null,
  updatedAt: "2025-09-19T12:00:00.000Z",
};
test("import updates only the matching product/store and keeps map coordinates and IDs", () => {
  const merged = mergeImportedPrices(listings, [row]);
  const base = listings.find((item) => item.id === "monster-12-0")!;
  const imported = merged.find((item) => item.id === base.id)!;
  assert.equal(imported.price, row.price);
  assert.equal(imported.latitude, base.latitude);
  assert.equal(imported.address, base.address);
  assert.equal(imported.website, row.url);
  assert.equal(imported.priceSource, "online");
  assert.equal(imported.inStock, null);
  assert.equal(stockLabel(imported), "Availability unknown");
  assert.equal(
    merged.find((item) => item.id === "coke-12-0")?.priceSource,
    "demo",
  );
  assert.equal(base.priceSource, "demo");
  assert.equal(sortListings([imported], "cheapest", true, base).length, 0);
});
test("invalid snapshots cannot replace demo prices; newest valid observation wins", () => {
  for (const bad of [
    { ...row, price: -1 },
    { ...row, price: "12" },
    { ...row, url: "https://example.com" },
    { ...row, updatedAt: "invalid" },
    { ...row, updatedAt: "2999-01-01" },
    { ...row, retailer: "Target" },
    { ...row, storeId: "unknown" },
  ]) {
    assert.equal(mergeImportedPrices(listings, [bad])[0].priceSource, "demo");
  }
  assert.deepEqual(mergeImportedPrices(listings, {}), listings);
  const newest = { ...row, price: 21, updatedAt: "2025-09-20T12:00:00.000Z" };
  assert.equal(
    mergeImportedPrices(listings, [newest, row]).find(
      (item) => item.id === "monster-12-0",
    )?.price,
    21,
  );
});
test("freshness labels use observation date, not app launch or import attempt time", () => {
  const listing = mergeImportedPrices(listings, [row]).find(
    (item) => item.id === "monster-12-0",
  )!;
  assert.equal(
    priceCheckedLabel(listing, new Date(row.updatedAt)),
    "Price checked today",
  );
  assert.notEqual(
    priceCheckedLabel(listing, new Date("2025-09-22T12:00:00Z")),
    "Price checked today",
  );
  assert.equal(
    priceCheckedLabel(listings[0]),
    "Demo price · not checked online",
  );
});
