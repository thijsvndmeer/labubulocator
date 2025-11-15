import { z } from "zod";

export const setSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  releaseDate: z.string().optional(),
  characters: z.array(z.string()).optional(), // Array of character IDs
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Set = z.infer<typeof setSchema>;

