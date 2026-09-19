/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { listings } from "../src/data/listings";
import {
  distanceMiles,
  getListingById,
  getListingsForProduct,
  getProductById,
  searchProducts,
  sortListings,
} from "../src/services/productService";
const DEMO_LOCATION = { latitude: 37.105, longitude: -113.574 };

test("search handles partial names, case, whitespace, exact ranking, and misses", async () => {
  assert.equal((await searchProducts("  MON  ")).length, 3);
  assert.equal(
    (await searchProducts("monster energy"))[0].id,
    "monster-original",
  );
  assert.deepEqual(await searchProducts("not a product"), []);
  assert.deepEqual(await searchProducts("   "), []);
});
test("listing IDs resolve consistently and product IDs stay separate", async () => {
  for (const product of await searchProducts("mon")) {
    assert.equal((await getProductById(product.id))?.name, product.name);
    for (const listing of await getListingsForProduct(product.id)) {
      assert.equal((await getListingById(listing.id))?.productId, product.id);
    }
  }
  assert.equal(await getListingById("missing"), undefined);
});
test("filters and sorting preserve source data and use the current origin", () => {
  // Fixed fixtures: a legitimate retailer price change must not break the test.
  const items = listings.filter(item => item.productId === "monster-12");
  const original = items.map((item) => item.id);
  const cheapest = sortListings(items, "cheapest", true, DEMO_LOCATION);
  assert.ok(cheapest.every((item) => item.inStock));
  assert.equal(cheapest[0].price, 17.99);
  assert.equal(
    sortListings(items, "closest", false, items[1])[0].id,
    items[1].id,
  );
  assert.deepEqual(
    items.map((item) => item.id),
    original,
  );
  assert.equal(distanceMiles(DEMO_LOCATION, DEMO_LOCATION), 0);
  assert.ok(
    Math.abs(
      distanceMiles(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
      ) - 69.1,
    ) < 0.1,
  );
});
