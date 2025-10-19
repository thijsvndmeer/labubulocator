import { Database } from "sqlite3";
import { QueryCriteria, QueryOptions } from "../types/labubu";
import { BaseRepository } from "./baseRepository";
import { Listing } from "@labubu/common/src/types/labubu";

export class ListingRepository extends BaseRepository<Listing> {
  //============================================================================================================================================================================================
  // Constructor
  //============================================================================================================================================================================================

  constructor(db: Database) {
    super(db, "listings");
  }

  //============================================================================================================================================================================================
  // CRUD methods
  //============================================================================================================================================================================================

  // create

  public async create(data: Omit<Listing, "id">): Promise<number> {
    return await super.create(data);
  }

  public async getOrCreate(data: Omit<Listing, "id">): Promise<number> {
    const existing = await this.get({ filter: { productUrl: data.productUrl } }, ["id"]);
    if (existing.length > 0) {
      return existing[0].id;
    }
    return await super.create(data);
  }

  public async updateOrCreate(data: Omit<Listing, "id">): Promise<number> {
    const existing = await this.get({ filter: { productUrl: data.productUrl } }, ["id"]);
    if (existing.length > 0) {
      await super.update({ filter: { productUrl: data.productUrl } }, data);
      return existing[0].id;
    }
    return await super.create(data);
  }

  // read

  public async get<K extends keyof Listing>(
    options: QueryOptions<Listing> = {},
    fields?: K[]
  ): Promise<Pick<Listing, K>[]> {
    return await super.get(options, fields);
  }

  // update

  public async update(criteria: QueryCriteria<Listing> = {}, data: Partial<Omit<Listing, "id">>): Promise<number> {
    return await super.update(criteria, data);
  }

  // delete

  public async delete(criteria: QueryCriteria<Listing> = {}): Promise<number> {
    return await super.delete(criteria);
  }
}
