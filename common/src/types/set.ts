import { z } from "zod";

export const setSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  releaseDate: z.string().optional(),
});

export type Set = z.infer<typeof setSchema>;
