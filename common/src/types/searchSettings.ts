import { z } from "zod";

export const facetSchema = z.object({
  key: z.string().min(1, "Facet key is required"),
  label: z.string().min(1, "Facet label is required"),
  type: z.enum(['text', 'number', 'range', 'boolean']).default('text'),
  options: z.array(z.string()).optional(), // For text facets with predefined options
});

export const searchSettingsSchema = z.object({
  id: z.string(), // e.g., 'main-search-config'
  enabledFilters: z.array(z.string()).optional(), // e.g., ['rarity', 'character', 'set']
  defaultSortBy: z.string().optional(), // e.g., 'name_asc', 'price_desc'
  autocompleteEnabled: z.boolean().default(true),
  autocompleteMinChars: z.number().int().min(1).default(3),
  facets: z.array(facetSchema).optional(),
  boostedFields: z.record(z.string(), z.number().min(0)).optional(), // e.g., { 'name': 2.0, 'description': 1.0 }
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Facet = z.infer<typeof facetSchema>;
export type SearchSettings = z.infer<typeof searchSettingsSchema>;
