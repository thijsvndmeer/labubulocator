//============================================================================================================================================================================================
// Database entity types
//============================================================================================================================================================================================

export interface Labubu {
  sku: string;
  name: string;
  series: string;
  rarity: string | null;
  image: string | null;
  description: string | null;
  msrp: number | null;
  lowestPrice: number | null;
}

export interface Listing {
  labubu_sku: string;
  vendorName: string;
  productUrl: string;
  listingTitle: string;
  currentPrice: number | null;
  inStock: boolean;
  lastCheckedAt: Date | null;
}

export interface PriceEntry {
  price: number;
  date: Date;
}

//============================================================================================================================================================================================
// Http parameter types
//============================================================================================================================================================================================

export type Range<T> =
  | { field: keyof T; min: number }
  | { field: keyof T; max: number }
  | { field: keyof T; min: number; max: number };

export type Sorting<T> = { by: keyof T } | { by: keyof T; direction: "ASC" | "DESC" };

export interface HttpOptions<T> {
  fields?: (keyof T)[];
  filter?: Partial<T>;
  ranges?: Range<T>[];
  order?: Sorting<T>[];
  limit?: number;
  offset?: number;
}
