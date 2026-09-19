export type Coordinates = { latitude: number; longitude: number };
export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  size: string;
  emoji: string;
};
export type Listing = Coordinates & {
  id: string;
  productId: string;
  storeId: string;
  storeName: string;
  price: number;
  address: string;
  website: string;
  inStock: boolean | null;
  priceSource: "demo" | "online";
  updatedAt?: string;
};
export type ScrapedPrice = {
  productId: string;
  retailer: string;
  storeId: string;
  productName: string;
  price: number;
  url: string;
  inStock: boolean | null;
  updatedAt: string;
};
export type SortOrder = "cheapest" | "closest";
