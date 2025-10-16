import { Database } from "sqlite3";
import { ListingData, PersistedListing } from "../types/labubu";
import { BaseRepository } from "./baseRepository";

export class ListingRepository extends BaseRepository<PersistedListing> {
  //============================================================================================================================================================================================
  // Constructor
  //============================================================================================================================================================================================

  constructor(db: Database) {
    super(db, "listings", [
      "id",
      "labubu_id",
      "vendor_name",
      "product_url",
      "listing_title",
      "last_checked_at",
      "in_stock",
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
    const existing = await this.get({ product_url: data.product_url }, ["id"]);
    if (existing.length > 0) {
      return existing[0].id;
    }
    return await super.create(data);
  }

  // read

  public async get<K extends keyof PersistedListing>(
    identifier: Partial<PersistedListing>,
    fields: K[] = []
  ): Promise<Pick<PersistedListing, K>[]> {
    return await super.get(identifier, fields);
  }

  public async getAll<K extends keyof PersistedListing>(
    fields: K[] = []
  ): Promise<Pick<PersistedListing, K>[]> {
    return await super.getAll(fields);
  }

  // update

  public async update(
    identifier: Partial<PersistedListing>,
    data: Partial<ListingData>
  ): Promise<number> {
    return await super.update(identifier, data);
  }

  public async updateAll(data: Partial<ListingData>): Promise<number> {
    return await super.updateAll(data);
  }

  // delete

  public async delete(identifier: Partial<PersistedListing>): Promise<number> {
    return await super.delete(identifier);
  }

  public async deleteAll(): Promise<number> {
    return await super.deleteAll();
  }
}
