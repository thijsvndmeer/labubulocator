/* eslint-disable @typescript-eslint/no-explicit-any */
import { z, ZodObject } from "zod";

//============================================================================================================================================================================================
// Database entity types
//============================================================================================================================================================================================

export const labubuSchema = z.object({
  sku: z.string(),
  name: z.string(),
  series: z.string(),
  rarity: z.string().optional(),
  description: z.string().optional(),
  msrp: z.coerce.number().optional(),
  lowestPrice: z.coerce.number().optional(),
  stockxPrice: z.coerce.number().optional().nullable(),
  ebayLowestPrice: z.coerce.number().optional().nullable(),
  variant: z.string().optional(),
  estimatedValue: z.coerce.number().optional(),
  estimatedValueLastCalculated: z.string().optional(),
  releaseDate: z.string().optional(),
  kicksdevId: z.string().optional(),


  priceChange24h: z.coerce.number().optional(),
  priceRange: z.object({ low: z.coerce.number(), high: z.coerce.number() }).optional(),
  stockStatus: z.string().optional(),
  volatility: z.coerce.number().optional(),
  affiliateLinks: z.array(z.object({ id: z.string(), displayName: z.string(), url: z.string() })).optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  recentSales: z.array(z.object({ source: z.string(), price: z.coerce.number(), currency: z.string(), date: z.string(), url: z.string() })).optional(),
  stockxLastRefreshed: z.string().optional(),
  ebayLastRefreshed: z.string().optional(),
  ebaySearchOverride: z.string().optional(),
});
export type Labubu = z.infer<typeof labubuSchema>;

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

export const priceEntrySchema = z.object({
  price: z.coerce.number(),
  date: z.coerce.date(),
});
export type PriceEntry = z.infer<typeof priceEntrySchema>;

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
    .refine(({ min, max }) => {
      return min !== undefined || max !== undefined;
    }, "Range must contain min or max")
    .superRefine((data, ctx) => {
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
