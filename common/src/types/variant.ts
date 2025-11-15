import { z } from "zod";
import { Rarity, StockStatus } from "./shared";

export const variantSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  characterId: z.string(),
  setId: z.string(),
  rarity: z.custom<Rarity>(),
  description: z.string().optional(),
  images: z.string().optional(), // Changed to string for comma-separated URLs
  msrp: z.number().optional(),
  stockStatus: z.custom<StockStatus>(),
  attributes: z.record(z.string(), z.string()).optional(),
  estimatedValue: z.number().optional(),
  priceRange: z
    .object({
      low: z.number(),
      high: z.number(),
    })
    .optional(),
  confidenceScore: z.number().optional(),
  priceChange24h: z.number().optional(),
  ebaySearchOverride: z.string().optional(),
  series: z.string().optional(),
  stockxPrice: z.number().optional(),
  ebayLowestPrice: z.number().optional(),
  lowestPrice: z.number().optional(),
  ebayLastRefreshed: z.string().optional(),
  stockxLastRefreshed: z.string().optional(),
  kicksdevId: z.string().optional(),
  estimatedValueLastCalculated: z.string().optional(),
  volatility: z.number().optional(),
  // New fields for standardization
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Variant = z.infer<typeof variantSchema>;
