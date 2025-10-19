import { Database } from "sqlite3";
import { Labubu } from "@labubu/common/src/types/labubu";
import { PersistedLabubu, QueryCriteria, QueryOptions } from "../types/labubu";
import { BaseRepository } from "./baseRepository";

export class LabubuRepository extends BaseRepository<PersistedLabubu> {
  //============================================================================================================================================================================================
  // Constructor
  //============================================================================================================================================================================================

  constructor(db: Database) {
    super(db, "labubus");
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
    const existing = await this.get({ filter: { sku: data.sku } }, ["id"]);
    if (existing.length > 0) {
      await super.update({ filter: { sku: data.sku } }, data);
      return existing[0].id;
    }
    return await super.create(data);
  }

  // read

  public async get<K extends keyof PersistedLabubu>(
    options: QueryOptions<PersistedLabubu> = {},
    fields?: K[]
  ): Promise<Pick<PersistedLabubu, K>[]> {
    return await super.get(options, fields);
  }

  // update

  public async update(criteria: QueryCriteria<PersistedLabubu> = {}, data: Partial<Labubu>): Promise<number> {
    return await super.update(criteria, data);
  }

  // delete

  public async delete(criteria: QueryCriteria<PersistedLabubu> = {}): Promise<number> {
    return await super.delete(criteria);
  }
}
