import { Variant, Rarity, StockStatus } from '@/types/variant';

export interface CatalogVariantFormState {
  sku: string;
  name: string;
  series: string;
  rarity: Rarity;
  description?: string;
  msrp?: number;
  variant?: string;
  stockStatus?: StockStatus;
  kicksdevId?: string;
  ebaySearchOverride?: string;
}

export const buildCatalogPayload = (formState: CatalogVariantFormState): Partial<Variant> => {
  return {
    sku: formState.sku,
    name: formState.name,
    series: formState.series,
    rarity: formState.rarity,
    description: formState.description || '',
    msrp: formState.msrp || undefined,
    variant: formState.variant || '',
    stockStatus: formState.stockStatus || undefined,
    kicksdevId: formState.kicksdevId || '',
    ebaySearchOverride: formState.ebaySearchOverride || '',
    // Default values for other Variant fields not in the form state
    images: [],
    retailUrl: '',
    affiliateLinks: [],
    attributes: {},
  };
};