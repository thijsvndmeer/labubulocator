import { Database } from "sqlite3";
import { Labubu } from "@common/types/labubu";
import { PersistedLabubu } from "../types/labubu";
import { BaseRepository } from "./baseRepository";

export class LabubuRepository extends BaseRepository<PersistedLabubu> {
  //============================================================================================================================================================================================
  // Constructor
  //============================================================================================================================================================================================

  constructor(db: Database) {
    super(db, "labubus", [
      "id",
      "sku",
      "name",
      "series",
      "rarity",
      "image",
      "description",
      "msrp",
    ]);
  }

  //============================================================================================================================================================================================
  // CRUD methods
  //============================================================================================================================================================================================

  // create

  public async create(data: Labubu): Promise<number> {
    return await super.create(data);
  }

  public async getOrCreate(data: Labubu): Promise<number> {
    const existing = await this.get({ sku: data.sku }, ["id"]);
    if (existing.length > 0) {
      return existing[0].id;
    }
    return await super.create(data);
  }

  public async updateOrCreate(data: Labubu): Promise<number> {
    const existing = await super.get({ sku: data.sku }, ["id"]);
    if (existing.length > 0) {
      await super.update({ sku: data.sku }, data);
      return existing[0].id;
    }
    return await super.create(data);
  }

  // read

  public async get<K extends keyof PersistedLabubu>(
    identifier: Partial<PersistedLabubu>,
    fields: K[] = []
  ): Promise<Pick<PersistedLabubu, K>[]> {
    return await super.get(identifier, fields);
  }

  public async getAll<K extends keyof PersistedLabubu>(
    fields: K[] = []
  ): Promise<Pick<PersistedLabubu, K>[]> {
    return await super.getAll(fields);
  }

  // update

  public async update(
    identifier: Partial<PersistedLabubu>,
    data: Partial<Labubu>
  ): Promise<number> {
    return await super.update(identifier, data);
  }

  public async updateAll(data: Partial<Labubu>): Promise<number> {
    return await super.updateAll(data);
  }

  // delete

  public async delete(identifier: Partial<PersistedLabubu>): Promise<number> {
    return await super.delete(identifier);
  }

  public async deleteAll(): Promise<number> {
    return await super.deleteAll();
  }
}
