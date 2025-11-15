import { z } from "zod";

export const collectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(), // New image field
  variantIds: z.array(z.string()),
  type: z.enum(['collection', 'category', 'tag']).default('collection'), // New type field
  status: z.enum(['draft', 'published', 'archived']).default('draft'), // New status field
  createdAt: z.string().datetime().optional(), // New timestamp field
  updatedAt: z.string().datetime().optional(), // New timestamp field
  metadata: z.record(z.string(), z.any()).optional(), // New metadata field
});

export type Collection = z.infer<typeof collectionSchema>;

