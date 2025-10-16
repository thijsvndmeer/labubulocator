import { Database } from "sqlite3";
import { ListingData, PersistedListing } from "../types/labubu";
import { BaseRepository } from "./baseRepository";
import { WhereOptions } from "../utils/databaseUtils";

export class ListingRepository extends BaseRepository<PersistedListing> {
  //============================================================================================================================================================================================
  // Constructor
  //============================================================================================================================================================================================

  constructor(db: Database) {
    super(db, "listings", [
      "id",
      "labubuId",
      "vendorName",
      "productUrl",
      "listingTitle",
      "currentPrice",
      "inStock",
      "lastCheckedAt",
    ]);
  }

  //============================================================================================================================================================================================
  // CRUD methods
  //============================================================================================================================================================================================

  // create

  public async create(data: ListingData): Promise<number> {
    return await super.create(data);
  }

  public async getOrCreate(data: ListingData): Promise<number> {
    const existing = await this.get({ filter: { productUrl: data.productUrl } }, ["id"]);
    if (existing.length > 0) {
      return existing[0].id;
    }
    return await super.create(data);
  }

  public async updateOrCreate(data: ListingData): Promise<number> {
    const existing = await super.get({ filter: { productUrl: data.productUrl } }, ["id"]);
    if (existing.length > 0) {
      await super.update({ filter: { productUrl: data.productUrl } }, data);
      return existing[0].id;
    }
    return await super.create(data);
  }

  // read

  public async get<K extends keyof PersistedListing>(
    whereOptions: WhereOptions<PersistedListing> = {},
    fields: K[] = []
  ): Promise<Pick<PersistedListing, K>[]> {
    return await super.get(whereOptions, fields);
  }

  // update

  public async update(whereOptions: WhereOptions<PersistedListing> = {}, data: Partial<ListingData>): Promise<number> {
    return await super.update(whereOptions, data);
  }

  // delete

  public async delete(whereOptions: WhereOptions<PersistedListing> = {}): Promise<number> {
    return await super.delete(whereOptions);
  }
}
