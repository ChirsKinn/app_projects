/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BlockedPage,
  extractPrice,
  matchesProduct,
} from "../scripts/parse-price";
import { targets } from "../scripts/price-targets";

const walmart = targets[0];
const target = targets[3];
test("Walmart uses hero price, not unit price, old price, or another variant", () => {
  const html =
    '<h1>Monster Energy Original 12 Pack 16 Fl Oz</h1><span>$2.68</span><del>$24.78</del><span data-seo-id="hero-price">Now $21.58</span><span>11.2 cents/fl oz</span>';
  assert.equal(extractPrice(html, walmart)?.price, 21.58);
  assert.equal(extractPrice(html, walmart)?.inStock, null);
  assert.equal(
    extractPrice(html.replace("12 Pack", "4 Pack"), walmart),
    undefined,
  );
  assert.equal(
    extractPrice(html.replace("Now $21.58", "$21.58 – $24.78"), walmart),
    undefined,
  );
});
test("Target requires the rendered main price and matching flavor/pack", () => {
  const html =
    '<h1>Coca-Cola Soda - 12pk/12 fl oz Cans</h1><span data-test="product-price">$8.89</span>';
  assert.equal(extractPrice(html, target)?.price, 8.89);
  assert.equal(
    extractPrice(html.replace("Coca-Cola", "Coca-Cola Zero"), target),
    undefined,
  );
  assert.equal(
    extractPrice(
      html.replace("product-price", "price-module-placeholder"),
      target,
    ),
    undefined,
  );
  assert.equal(
    matchesProduct("Monster Energy Ultra 12pk/16 fl oz", "monster-12"),
    false,
  );
});
test("structured offers require USD, an exact product, and no ambiguous price range", () => {
  const schema = (offers: unknown) =>
    `<script type="application/ld+json">${JSON.stringify({ "@graph": [{ "@type": "Product", name: "Monster Energy 12 pk / 16 fl oz", offers }] })}</script>`;
  const offer = {
    price: "22.49",
    priceCurrency: "USD",
    availability: "https://schema.org/OutOfStock",
  };
  assert.equal(extractPrice(schema(offer), walmart)?.inStock, false);
  assert.equal(
    extractPrice(schema({ ...offer, priceCurrency: "CAD" }), walmart),
    undefined,
  );
  assert.equal(
    extractPrice(schema([offer, { ...offer, price: 23 }]), walmart),
    undefined,
  );
  assert.throws(
    () => extractPrice("<title>Robot or human?</title>", walmart),
    BlockedPage,
  );
});
