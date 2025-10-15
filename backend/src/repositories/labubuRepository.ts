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

  public async findOrCreate(data: Labubu): Promise<number> {
    const existing = await this.find({ sku: data.sku }, ["id"]);
    if (existing.length > 0) {
      return existing[0].id;
    }
    return await super.create(data);
  }

  // read

  public async find(
    identifier: Partial<PersistedLabubu>
  ): Promise<PersistedLabubu[]>;

  public async find<K extends keyof PersistedLabubu>(
    identifier: Partial<PersistedLabubu>,
    fields: K[]
  ): Promise<Pick<PersistedLabubu, K>[]>;

  public async find<K extends keyof PersistedLabubu>(
    identifier: Partial<PersistedLabubu> = {},
    fields: K[] = []
  ): Promise<Pick<PersistedLabubu, K>[]> {
    return await super.find(identifier, fields);
  }

  public async findAll(): Promise<PersistedLabubu[]>;

  public async findAll<K extends keyof PersistedLabubu>(
    fields: K[] = []
  ): Promise<Pick<PersistedLabubu, K>[]> {
    return await super.find({}, fields);
  }

  // update

  public async update(
    identifier: Partial<PersistedLabubu> = {},
    data: Partial<Labubu>
  ): Promise<number> {
    return await super.update(identifier, data);
  }

  public async updateAll(data: Partial<Labubu>): Promise<number> {
    return await super.update({}, data);
  }

  // delete

  public async delete(
    identifier: Partial<PersistedLabubu> = {}
  ): Promise<number> {
    return await super.delete(identifier);
  }

  public async deleteAll(): Promise<number> {
    return await super.delete();
  }
}
