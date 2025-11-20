import { contentSchema } from "@labubu/common";
import { z } from "zod";

export const persistedContentSchema = contentSchema.extend({
  id: z.coerce.number(),
});

export type PersistedContent = z.infer<typeof persistedContentSchema>;
