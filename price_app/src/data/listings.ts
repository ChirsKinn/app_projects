import { Listing } from "../types";

// Real branch addresses and coordinates checked 2026-09-19; sources in README.
// Keep legacy store IDs stable so saved price imports still match. Prices below are demo data.
export const stores = [
  {
    storeId: "walmart-st-george-demo",
    storeName: "Walmart",
    latitude: 37.063426,
    longitude: -113.587387,
    address: "2610 Pioneer Rd, St. George, UT 84790",
    website: "https://www.walmart.com",
  },
  {
    storeName: "Target",
    storeId: "target-st-george-demo",
    latitude: 37.102987,
    longitude: -113.554468,
    address: "275 S River Rd, St. George, UT 84790",
    website: "https://www.target.com",
  },
  {
    storeName: "Smith’s",
    storeId: "smiths-st-george-demo",
    latitude: 37.108826,
    longitude: -113.591472,
    address: "20 N Bluff St, St. George, UT 84770",
    website: "https://www.smithsfoodanddrug.com",
  },
  {
    storeName: "Albertsons",
    storeId: "albertsons-st-george-demo",
    latitude: 37.120872,
    longitude: -113.624581,
    address: "745 N Dixie Dr, St. George, UT 84770",
    website: "https://www.albertsons.com",
  },
  {
    storeName: "Costco",
    storeId: "costco-st-george-demo",
    latitude: 37.122303,
    longitude: -113.52249,
    address: "835 N 3050 E, St. George, UT 84790",
    website: "https://www.costco.com",
  },
  {
    storeName: "Walgreens",
    storeId: "walgreens-st-george-demo",
    latitude: 37.109579,
    longitude: -113.591421,
    address: "391 W Saint George Blvd, St. George, UT 84770",
    website: "https://www.walgreens.com",
  },
  {
    storeName: "Maverik",
    storeId: "maverik-st-george-demo",
    latitude: 37.110499,
    longitude: -113.562758,
    address: "995 E St George Blvd, St. George, UT 84770",
    website: "https://www.maverik.com",
  },
];
const prices: Record<string, (number | null)[]> = {
  bananas: [0.58, 0.65, 0.59, 0.69, null, null, null],
  "monster-12": [18.99, 21.49, 19.98, 22.49, 17.99, null, null],
  "monster-original": [2.28, 2.69, 2.49, 2.79, null, 3.19, 2.99],
  "monster-ultra": [2.48, 2.79, 2.59, 2.89, null, 3.29, 2.99],
  "coke-12": [7.48, 8.49, 7.99, 8.99, null, 9.49, null],
  "redbull-4": [7.98, 8.99, 8.49, 9.29, null, 9.99, 10.49],
  milk: [3.48, 3.89, 3.69, 4.19, null, 4.79, 4.49],
  eggs: [3.24, 3.99, 3.49, 4.29, null, 4.99, null],
};
export const listings: Listing[] = Object.entries(prices).flatMap(
  ([productId, values]) =>
    values.flatMap((price, index) =>
      price === null
        ? []
        : [
            {
              ...stores[index],
              id: `${productId}-${index}`,
              productId,
              price,
              inStock: index !== 3,
              priceSource: "demo" as const,
            },
          ],
    ),
);
