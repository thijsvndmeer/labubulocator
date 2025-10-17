import { HttpOptions, Labubu, Listing, PriceEntry } from "@common/types/labubu";

//============================================================================================================================================================================================
// Database entity types
//============================================================================================================================================================================================

export interface PersistedLabubu extends Labubu {
  id: number;
}

export interface ListingData extends Omit<Listing, "labubu_sku"> {
  labubuId: number;
}

export interface PersistedListing extends ListingData {
  id: number;
}

export interface PriceEntryData extends PriceEntry {
  listingId: number;
}

export interface PersistedPriceEntry extends PriceEntryData {
  id: number;
}

//============================================================================================================================================================================================
// Query parameter types
//============================================================================================================================================================================================

export type QueryOptions<T> = Omit<HttpOptions<T>, 'fields'>;
