import { Database } from "sqlite3";
import { Labubu } from "@common/types/labubu";
import { PersistedLabubu } from "../types/labubu";
import { BaseRepository } from "./baseRepository";
import { QueryOptions } from "../utils/databaseUtils";

export class LabubuRepository extends BaseRepository<PersistedLabubu> {
  //============================================================================================================================================================================================
  // Constructor
  //============================================================================================================================================================================================

  constructor(db: Database) {
    super(db, "labubus", ["id", "sku", "name", "series", "rarity", "image", "description", "msrp", "lowestPrice"]);
  }

  //============================================================================================================================================================================================
  // CRUD methods
  //============================================================================================================================================================================================

  // create

  public async create(data: Labubu): Promise<number> {
    return await super.create(data);
  }

  public async getOrCreate(data: Labubu): Promise<number> {
    const existing = await this.get({ filter: { sku: data.sku } }, ["id"]);
    if (existing.length > 0) {
      return existing[0].id;
    }
    return await super.create(data);
  }

  public async updateOrCreate(data: Labubu): Promise<number> {
    const existing = await super.get({ filter: { sku: data.sku } }, ["id"]);
    if (existing.length > 0) {
      await super.update({ filter: { sku: data.sku }}, data);
      return existing[0].id;
    }
    return await super.create(data);
  }

  // read

  public async get<K extends keyof PersistedLabubu>(
    options: QueryOptions<PersistedLabubu> = {},
    fields: K[] = []
  ): Promise<Pick<PersistedLabubu, K>[]> {
    return await super.get(options, fields);
  }

  // update

  public async update(options: Pick<QueryOptions<PersistedLabubu>, "filter" | "ranges"> = {}, data: Partial<Labubu>): Promise<number> {
    return await super.update(options, data);
  }

  // delete

  public async delete(options: Pick<QueryOptions<PersistedLabubu>, "filter" | "ranges"> = {}): Promise<number> {
    return await super.delete(options);
  }
}
