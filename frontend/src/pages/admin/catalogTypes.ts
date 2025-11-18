import type { Variant } from "@/types/variant";

export type CatalogVariantFormState = Partial<Pick<
  Variant,
  "sku" | "name" | "series" | "rarity" | "description" | "msrp" | "variant" | "stockStatus"
>> & {
  kicksdevId?: string;
  ebaySearchOverride?: string;
};

const editableFields: (keyof CatalogVariantFormState)[] = [
  "sku",
  "name",
  "series",
  "rarity",
  "description",
  "msrp",
  "variant",
  "stockStatus",
  "kicksdevId",
  "ebaySearchOverride",
];

export const buildCatalogPayload = (state: CatalogVariantFormState) => {
  const payload: Record<string, unknown> = {};
  editableFields.forEach((field) => {
    const value = state[field];
    if (value !== undefined && value !== "") {
      payload[field] = value;
    }
  });
  return payload;
};
