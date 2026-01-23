/* eslint-disable @typescript-eslint/no-explicit-any */
import { z, ZodObject } from "zod";

// --- Custom Types for Labubu ---
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'secret' | 'chase'; // Added 'chase'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order' | 'discontinued' | 'aftermarketorbb'; // Added 'aftermarketorbb'

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

export interface Labubu {
  sku: string;
  name: string;
  series: string;
  rarity?: string;
  description?: string;
  msrp?: number;
  lowestPrice?: number;
  stockxPrice?: number | null;
  ebayLowestPrice?: number | null;
  variant?: string;
  estimatedValue?: number;
  estimatedValueLastCalculated?: string;
  releaseDate?: string;
  kicksdevId?: string;
  priceChange24h?: number;
  priceRange?: { low: number; high: number };
  stockStatus?: string;
  volatility?: number;
  affiliateLinks?: { id: string; displayName: string; url: string }[];
  attributes?: Record<string, string>;
  recentSales?: { source: string; price: number; currency: string; date: string; url: string }[];
  stockxLastRefreshed?: string;
  ebayLastRefreshed?: string;
  ebaySearchOverride?: string;
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

export interface Listing {
  id: number;
  productUrl: string;
  labubuSku: string;
  vendorName: string;
  listingTitle: string;
  currentPrice?: number;
  inStock: boolean;
  lastCheckedAt?: Date;
}

export const priceEntrySchema = z.object({
  price: z.coerce.number(),
  date: z.coerce.date(),
});

export interface PriceEntry {
  price: number;
  date: Date;
}

export const roleSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string(),
});

export interface Role {
  id?: number;
  name: string;
}

export const userSchema = z.object({
  id: z.coerce.number().optional(),
  username: z.string(),
  password: z.string(),
  role_id: z.coerce.number().optional(),
});

export interface User {
  id?: number;
  username: string;
  password: string;
  role_id?: number;
}

export const contentSchema = z.object({
  id: z.coerce.number().optional(),
  key: z.string(),
  value: z.string().optional(),
  last_updated: z.string().optional(),
});

export interface Content {
  id?: number;
  key: string;
  value?: string;
  last_updated?: string;
}

export const navigationSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string(),
  structure: z.string(), // Storing as JSON string
  last_updated: z.string().optional(),
});

export interface Navigation {
  id?: number;
  name: string;
  structure: string;
  last_updated?: string;
}

export const settingsSchema = z.object({
  id: z.coerce.number().optional(),
  key: z.string(),
  value: z.string().optional(),
  last_updated: z.string().optional(),
});

export interface Settings {
  id?: number;
  key: string;
  value?: string;
  last_updated?: string;
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
export type QueryOptions<T> = HttpOptions<T>;
