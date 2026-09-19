// Exact product pages, not search results: don't mistake another pack/flavor for ours.
export const targets = [
  {
    productId: "monster-12",
    storeId: "walmart-st-george-demo",
    url: "https://www.walmart.com/ip/581272641",
    retailer: "Walmart",
  },
  {
    productId: "coke-12",
    storeId: "walmart-st-george-demo",
    url: "https://www.walmart.com/ip/12166733",
    retailer: "Walmart",
  },
  {
    productId: "monster-12",
    storeId: "target-st-george-demo",
    url: "https://www.target.com/p/monster-energy-original-12pk-16-fl-oz-cans/-/A-81782413",
    retailer: "Target",
  },
  {
    productId: "coke-12",
    storeId: "target-st-george-demo",
    url: "https://www.target.com/p/-/A-12953464",
    retailer: "Target",
  },
  {
    productId: "monster-12",
    storeId: "smiths-st-george-demo",
    url: "https://www.smithsfoodanddrug.com/p/monster-energy-drink-multipack-cans/0007084703756",
    retailer: "Smith’s",
  },
  {
    productId: "coke-12",
    storeId: "smiths-st-george-demo",
    url: "https://www.smithsfoodanddrug.com/p/coca-cola-soda-cans/0004900002890",
    retailer: "Smith’s",
  },
] as const;
export type PriceTarget = (typeof targets)[number];
