import type { Variant } from "@/types/variant";

export type CatalogVariantFormState = Partial<Variant> & {
  kicksdevId?: string;
  ebaySearchOverride?: string;
  stockXUrl?: string;
  ebayUrl?: string;
  funkoId?: string;
  releasePrice?: number;
  releaseDate?: string;
  isRetired?: number;
};
