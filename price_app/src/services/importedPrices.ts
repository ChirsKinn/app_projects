import { Listing, ScrapedPrice } from "../types";

// Validate local JSON too: a bad row should never break the map or replace a price.
export function validImportedPrice(
  value: unknown,
  base: Listing[],
  now = Date.now(),
): value is ScrapedPrice {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<ScrapedPrice>;
  const listing = base.find(
    (item) =>
      item.productId === row.productId &&
      item.storeId === row.storeId &&
      item.storeName === row.retailer,
  );
  if (
    !listing ||
    typeof row.price !== "number" ||
    !Number.isFinite(row.price) ||
    row.price <= 0 ||
    row.price > 1000 ||
    typeof row.productName !== "string" ||
    !row.productName.trim() ||
    typeof row.url !== "string" ||
    typeof row.updatedAt !== "string" ||
    (row.inStock !== null && typeof row.inStock !== "boolean")
  )
    return false;
  const checked = Date.parse(row.updatedAt);
  if (!Number.isFinite(checked) || checked > now + 5 * 60_000) return false;
  try {
    const url = new URL(row.url);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      url.hostname === new URL(listing.website).hostname
    );
  } catch {
    return false;
  }
}

export function mergeImportedPrices(
  base: Listing[],
  input: unknown,
): Listing[] {
  const rows = Array.isArray(input)
    ? input.filter((row) => validImportedPrice(row, base))
    : [];
  return base.map((listing) => {
    const row = rows
      .filter(
        (row) =>
          row.storeId === listing.storeId &&
          row.productId === listing.productId,
      )
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
    return row
      ? {
          ...listing,
          price: row.price,
          website: row.url,
          inStock: row.inStock,
          updatedAt: row.updatedAt,
          priceSource: "online",
        }
      : listing;
  });
}

export function priceCheckedLabel(listing: Listing, now = new Date()): string {
  if (listing.priceSource !== "online" || !listing.updatedAt)
    return "Demo price · not checked online";
  const checked = new Date(listing.updatedAt);
  return checked.toDateString() === now.toDateString()
    ? "Price checked today"
    : `Price checked ${checked.toLocaleDateString()}`;
}

export function stockLabel(listing: Listing): string {
  if (listing.inStock === null) return "Availability unknown";
  const status = listing.inStock ? "In stock" : "Out of stock";
  return `${status} · ${listing.priceSource === "online" ? "online" : "demo"}`;
}
