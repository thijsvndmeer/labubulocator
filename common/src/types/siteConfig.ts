import { z } from "zod";

export const siteConfigSchema = z.object({
  id: z.string(), // e.g., 'main-config' or 'global-settings'
  siteTitle: z.string().min(1, "Site Title is required"),
  siteDescription: z.string().optional(),
  logoUrl: z.string().url("Must be a valid URL").optional(),
  faviconUrl: z.string().url("Must be a valid URL").optional(),
  apiBaseUrl: z.string().url("Must be a valid URL").optional(),
  contactEmail: z.string().email("Must be a valid email address").optional(),
  socialMediaLinks: z.record(z.string(), z.string().url("Must be a valid URL")).optional(),
  featureFlags: z.record(z.string(), z.boolean()).optional(), // e.g., { 'dark-mode': true, 'new-feature': false }
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.any()).optional(), // For any additional flexible data
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
