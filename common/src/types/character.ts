import { z } from "zod";

export const characterSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  rarity: z.string().optional(),
  stats: z.record(z.string(), z.any()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Character = z.infer<typeof characterSchema>;
