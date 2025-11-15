import { z } from "zod";

export const collectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  variantIds: z.array(z.string()),
});

export type Collection = z.infer<typeof collectionSchema>;
