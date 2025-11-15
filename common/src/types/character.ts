import { z } from "zod";

export const characterSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export type Character = z.infer<typeof characterSchema>;
