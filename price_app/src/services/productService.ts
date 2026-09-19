import { products } from "../data/products";
import { listings } from "../data/listings";
import { Coordinates, Listing, SortOrder } from "../types";
import scrapedPrices from "../../data/scraped-prices.json";
import { mergeImportedPrices } from "./importedPrices";

const currentListings = mergeImportedPrices(listings, scrapedPrices);

const normalize = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ");
// Async repository boundary: swap these implementations for API calls later.
export async function searchProducts(query: string) {
  const term = normalize(query);
  if (!term) return [];
  return products
    .filter((product) => normalize(product.name).includes(term))
    .sort((a, b) => {
      const score = (name: string) =>
        normalize(name) === term ? 0 : normalize(name).startsWith(term) ? 1 : 2;
      return score(a.name) - score(b.name) || a.name.length - b.name.length;
    });
}
export async function getProductById(id: string) {
  return products.find((product) => product.id === id);
}
export async function getListingsForProduct(productId: string) {
  return currentListings.filter((listing) => listing.productId === productId);
}
export async function getListingById(id: string) {
  return currentListings.find((listing) => listing.id === id);
}
export function distanceMiles(from: Coordinates, to: Coordinates) {
  const rad = (degrees: number) => (degrees * Math.PI) / 180;
  const a =
    Math.sin(rad(to.latitude - from.latitude) / 2) ** 2 +
    Math.cos(rad(from.latitude)) *
      Math.cos(rad(to.latitude)) *
      Math.sin(rad(to.longitude - from.longitude) / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}
export function sortListings(
  items: Listing[],
  sort: SortOrder,
  inStockOnly: boolean,
  origin: Coordinates,
) {
  return items
    .filter((item) => !inStockOnly || item.inStock)
    .sort((a, b) =>
      sort === "cheapest"
        ? a.price - b.price
        : distanceMiles(origin, a) - distanceMiles(origin, b),
    );
}
export const money = (value: number) => `$${value.toFixed(2)}`;
