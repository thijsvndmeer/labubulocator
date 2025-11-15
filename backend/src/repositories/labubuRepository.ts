import { Database } from "sqlite3";
import { Variant, QueryOptions, QueryCriteria } from "@labubu/common";
import { BaseRepository } from "./baseRepository";

export class LabubuRepository extends BaseRepository<Variant> {
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

  public async create(data: Variant): Promise<string | number> {
    return await super.create(data);
  }

  public async getOrCreate(data: Variant): Promise<string | number> {
    const existing = await this.get({ filter: { sku: data.sku } }, ["id"]);
    if (existing.length > 0) {
      return existing[0].id;
    }
    return await super.create(data);
  }

  public async updateOrCreate(data: Variant): Promise<string | number> {
    const existing = await this.get({ filter: { sku: data.sku } }, ["id"]);
    if (existing.length > 0) {
      await super.update({ filter: { sku: data.sku } }, data);
      return existing[0].id;
    }
    return await super.create(data);
  }

  // read

  public async get<K extends keyof Variant>(
    options: QueryOptions<Variant> = {},
    fields?: K[]
  ): Promise<Pick<Variant, K>[]> {
    return await super.get(options, fields);
  }

  // update

  public async update(criteria: QueryCriteria<Variant> = {}, data: Partial<Variant>): Promise<number> {
    return await super.update(criteria, data);
  }

  // delete

  public async delete(criteria: QueryCriteria<Variant> = {}): Promise<number> {
    return await super.delete(criteria);
  }
}
