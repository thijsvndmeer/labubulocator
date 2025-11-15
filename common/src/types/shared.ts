import { z, ZodObject } from "zod";

export const Rarity = {
  Common: "common",
  Uncommon: "uncommon",
  Rare: "rare",
  Epic: "epic",
  Legendary: "legendary",
  Secret: "secret",
} as const; // `as const` creates a literal type from the object, which is useful for type inference.

export type Rarity = (typeof Rarity)[keyof typeof Rarity];

export const StockStatus = {
  InStock: "in_stock",
  LowStock: "low_stock",
  OutOfStock: "out_of_stock",
  PreOrder: "pre_order",
  Discontinued: "discontinued",
  AftermarketOrBB: "aftermarketorbb",
  Unknown: "unknown", // Added Unknown for initialization safety
} as const;

export type StockStatus = (typeof StockStatus)[keyof typeof StockStatus];

export interface PriceSource {
  source: string;
  price: number;
  currency: string;
  timestamp: string;
  url: string;
  inStock: boolean;
}

export interface PriceData {
  site: string;
  price: number;
  url: string;
}

export interface AffiliateLink {
  network: string;
  url: string;
  id: string;
  displayName: string;
}

export interface Sale {
  source: string;
  price: number;
  currency: string;
  date: string;
  url: string;
}

export interface PriceSnapshot {
  date: string;
  median30d: number;
  median90d: number;
  median365d: number;
  volume: number;
}

//============================================================================================================================================================================================
// Http parameter types
//============================================================================================================================================================================================

export const makeRangeSchema = <T extends ZodObject<any>>(schema: T) => {
  const keys = Object.keys(schema.shape) as [string, ...string[]];
  return z
    .object({
      field: z.enum(keys),
      min: z.any().optional(),
      max: z.any().optional(),
    })
    .refine((data): data is { field: string, min?: any, max?: any } => { // Explicitly type data
      return data.min !== undefined || data.max !== undefined;
    }, "Range must contain min or max")
    .superRefine((data, ctx: z.RefinementCtx) => { // Explicitly type ctx
      const fieldSchema = schema.shape[data.field];

      if (data.min !== undefined) {
        const parse = fieldSchema.safeParse(data.min);
        if (parse.success === false) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Min must be the same type as the value stored under the field key",
            path: ["min"],
          });
        } else {
          data.min = parse.data;
        }
      }

      if (data.max !== undefined) {
        const parse = fieldSchema.safeParse(data.max);
        if (parse.success === false) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Max must be the same type as the value stored under the field key",
            path: ["max"],
          });
        } else {
          data.max = parse.data;
        }
      }
    });
};
export type Range<T> = {
  [K in keyof T]: {
    field: K;
  } & ({ min: T[K]; max?: T[K] } | { min?: T[K]; max: T[K] });
}[keyof T];

export const makeSortingSchema = <T extends ZodObject<any>>(schema: T) => {
  return z.object({
    by: z.enum(Object.keys(schema.shape) as [string, ...string[]]),
    direction: z.enum(["ASC", "DESC"]).optional(),
  });
};
export type Sorting<T> = { by: keyof T } | { by: keyof T; direction: "ASC" | "DESC" };

export const makeHttpOptionsSchema = <T extends ZodObject<any>>(schema: T) => {
  return z.object({
    fields: z.array(z.enum(Object.keys(schema.shape) as [string, ...string[]])).optional(),
    filter: schema.partial().optional(),
    ranges: z.array(makeRangeSchema(schema)).optional(),
    order: z.array(makeSortingSchema(schema)).optional(),
    limit: z.coerce.number().optional(),
    offset: z.coerce.number().optional(),
  });
};
export interface HttpOptions<T> {
  fields?: (keyof T)[];
  filter?: Partial<T>;
  ranges?: Range<T>[];
  order?: Sorting<T>[];
  limit?: number;
  offset?: number;
}

export const listingSchema = z.object({
  id: z.coerce.number(),
  productUrl: z.string(),
  labubuSku: z.string(),
  vendorName: z.string(),
  listingTitle: z.string(),
  currentPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean(),
  lastCheckedAt: z.coerce.date().optional(),
});
export type Listing = z.infer<typeof listingSchema>;

export type QueryOptions<T> = Pick<HttpOptions<T>, "filter" | "ranges" | "order" | "limit" | "offset">;
export type QueryCriteria<T> = Pick<HttpOptions<T>, "filter" | "ranges">;

export const priceEntrySchema = z.object({
  price: z.coerce.number(),
  date: z.coerce.date(),
});
export type PriceEntry = z.infer<typeof priceEntrySchema>;

export const priceEntryDataSchema = priceEntrySchema.extend({
  listingId: z.coerce.number(),
});
export type PriceEntryData = z.infer<typeof priceEntryDataSchema>;

export const persistedPriceEntrySchema = priceEntryDataSchema.extend({
  id: z.coerce.number(),
});
export type PersistedPriceEntry = z.infer<typeof persistedPriceEntrySchema>;
