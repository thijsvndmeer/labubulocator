/* eslint-disable @typescript-eslint/no-explicit-any */
import { z, ZodObject } from "zod";
import {
  HttpOptions,
  labubuSchema,
  listingSchema,
  makeHttpOptionsSchema,
  priceEntrySchema,
} from "@labubu/common";

//============================================================================================================================================================================================
// Database entity types
//============================================================================================================================================================================================

export const persistedLabubuSchema = labubuSchema.extend({
  id: z.coerce.number(),
});
export type PersistedLabubu = z.infer<typeof persistedLabubuSchema>;

export const priceEntryDataSchema = priceEntrySchema.extend({
  listingId: z.coerce.number(),
});
export type PriceEntryData = z.infer<typeof priceEntryDataSchema>;

export const persistedPriceEntrySchema = priceEntryDataSchema.extend({
  id: z.coerce.number(),
});
export type PersistedPriceEntry = z.infer<typeof persistedPriceEntrySchema>;

//============================================================================================================================================================================================
// Database Options
//============================================================================================================================================================================================

export const makeQueryCriteriaSchema = <T extends ZodObject<any>>(schema: T) => {
  return makeQueryOptionsSchema(schema).pick({ filter: true, ranges: true });
};
export type QueryCriteria<T> = Pick<QueryOptions<T>, "filter" | "ranges">;

export const makeQueryOptionsSchema = <T extends ZodObject<any>>(schema: T) => {
  return makeHttpOptionsSchema(schema).pick({ filter: true, ranges: true, order: true, limit: true, offset: true });
};
export type QueryOptions<T> = Pick<HttpOptions<T>, "filter" | "ranges" | "order" | "limit" | "offset">;
