import { load } from "cheerio";
import type { PriceTarget } from "./price-targets";

export class BlockedPage extends Error {}

export function matchesProduct(name: string, productId: string): boolean {
  const text = name.toLowerCase().replace(/[®™]/g, "");
  const pack = /\b12\s*(?:pk|pack|count|ct)\b/.test(text);
  if (
    !pack ||
    /\b(zero|ultra|diet|cherry|vanilla|variety|mini|locarb|rehab|bottles)\b/.test(
      text,
    )
  )
    return false;
  return productId === "monster-12"
    ? /monster/.test(text) &&
        /energy/.test(text) &&
        /\b16\s*(?:fl\s*)?oz\b/.test(text)
    : productId === "coke-12" &&
        /coca[ -]?cola/.test(text) &&
        /\b12\s*(?:fl\s*)?oz\b/.test(text);
}

function dollarPrice(text: string): number | undefined {
  const prices = [...text.matchAll(/\$\s*(\d+(?:\.\d{2})?)(?![\d.])/g)].map(
    (match) => Number(match[1]),
  );
  // Ambiguous sale/regular ranges are skipped rather than silently choosing one.
  return prices.length === 1 && prices[0] > 0 && prices[0] <= 1000
    ? prices[0]
    : undefined;
}

export function extractPrice(
  html: string,
  target: PriceTarget,
): { productName: string; price: number; inStock: boolean | null } | undefined {
  const $ = load(html);
  const title = $("title").text();
  if (
    /robot or human|access denied|verify you are human|just a moment|captcha/i.test(
      title,
    )
  )
    throw new BlockedPage("Retailer returned an access challenge");
  const heading = $("h1").first().text().trim();

  if (
    target.retailer === "Walmart" &&
    matchesProduct(heading, target.productId)
  ) {
    const price = dollarPrice($('[data-seo-id="hero-price"]').first().text());
    if (price !== undefined) {
      let inStock: boolean | null = null;
      try {
        // Only the main product's hydration data, never recommendations/variants.
        const product = JSON.parse($("#__NEXT_DATA__").text()).props.pageProps
          .initialData.data.product;
        if (
          matchesProduct(product.name ?? "", target.productId) &&
          product.priceInfo?.currentPrice?.price === price
        ) {
          inStock =
            product.availabilityStatus === "IN_STOCK"
              ? true
              : product.availabilityStatus === "OUT_OF_STOCK"
                ? false
                : null;
        }
      } catch {
        /* Stock is optional. */
      }
      return { productName: heading, price, inStock };
    }
  }
  if (
    target.retailer === "Target" &&
    matchesProduct(heading, target.productId)
  ) {
    const price = dollarPrice($('[data-test="product-price"]').first().text());
    if (price !== undefined)
      return { productName: heading, price, inStock: null };
  }

  // Standard Product JSON-LD is usable when the retailer includes it in the page.
  const products: Record<string, unknown>[] = [];
  function visit(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") return;
    const node = value as Record<string, unknown>;
    if (
      node["@type"] === "Product" ||
      (Array.isArray(node["@type"]) && node["@type"].includes("Product"))
    )
      products.push(node);
    if (node["@graph"]) visit(node["@graph"]);
    if (node.mainEntity) visit(node.mainEntity);
  }
  $('script[type="application/ld+json"]').each((_, script) => {
    try {
      visit(JSON.parse($(script).text()));
    } catch {
      /* Ignore unrelated broken metadata. */
    }
  });
  const matching = products.filter(
    (product) =>
      typeof product.name === "string" &&
      matchesProduct(product.name, target.productId),
  );
  if (matching.length !== 1) return undefined;
  const product = matching[0];
  const offers = Array.isArray(product.offers)
    ? product.offers
    : [product.offers];
  if (offers.length !== 1 || !offers[0] || typeof offers[0] !== "object")
    return undefined;
  const offer = offers[0] as Record<string, unknown>;
  const price =
    typeof offer.price === "number"
      ? offer.price
      : typeof offer.price === "string" && /^\d+(\.\d{1,2})?$/.test(offer.price)
        ? Number(offer.price)
        : NaN;
  if (
    offer.priceCurrency !== "USD" ||
    !Number.isFinite(price) ||
    price <= 0 ||
    price > 1000
  )
    return undefined;
  if (
    typeof offer.priceValidUntil === "string" &&
    Date.parse(offer.priceValidUntil) < Date.now()
  )
    return undefined;
  const availability = String(offer.availability).split("/").pop();
  return {
    productName: String(product.name),
    price,
    inStock:
      availability === "InStock"
        ? true
        : availability === "OutOfStock"
          ? false
          : null,
  };
}
