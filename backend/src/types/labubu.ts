import { Labubu, Listing, PriceEntry } from "@common/types/labubu";

export interface PersistedLabubu extends Labubu {
  id: number;
}

export interface ListingData extends Omit<Listing, "labubu_sku"> {
  labubu_id: number;
}

export interface PersistedListing extends ListingData {
  id: number;
}

export interface PriceEntryData extends PriceEntry {
  listing_id: number;
}

export interface PersistedPriceEntry extends PriceEntryData {
  id: number;
}
