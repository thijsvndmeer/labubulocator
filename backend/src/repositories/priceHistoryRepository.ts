import { Database } from "sqlite3";
import { PersistedPriceEntry, PriceEntryData } from "../types/labubu";
import { BaseRepository } from "./baseRepository";

export class PriceHistoryRepository extends BaseRepository<PersistedPriceEntry> {
  //============================================================================================================================================================================================
  // Constructor
  //============================================================================================================================================================================================

  constructor(db: Database) {
    super(db, "price_history", ["id", "listing_id", "price", "date"]);
  }

  //============================================================================================================================================================================================
  // CRUD methods
  //============================================================================================================================================================================================

  // create

  public async create(data: PriceEntryData): Promise<number> {
    return await super.create(data);
  }

  // read

  public async find(
    identifier: Partial<PersistedPriceEntry>
  ): Promise<PersistedPriceEntry[]>;

  public async find<K extends keyof PersistedPriceEntry>(
    identifier: Partial<PersistedPriceEntry>,
    fields: K[]
  ): Promise<Pick<PersistedPriceEntry, K>[]>;

  public async find<K extends keyof PersistedPriceEntry>(
    identifier: Partial<PersistedPriceEntry> = {},
    fields: K[] = []
  ): Promise<Pick<PersistedPriceEntry, K>[]> {
    return await super.find(identifier, fields);
  }

  public async findAll(): Promise<PersistedPriceEntry[]>;

  public async findAll<K extends keyof PersistedPriceEntry>(
    fields: K[] = []
  ): Promise<Pick<PersistedPriceEntry, K>[]> {
    return await super.find({}, fields);
  }

  // update

  public async update(
    identifier: Partial<PersistedPriceEntry> = {},
    data: Partial<PriceEntryData>
  ): Promise<number> {
    return await super.update(identifier, data);
  }

  public async updateAll(data: Partial<PriceEntryData>): Promise<number> {
    return await super.update({}, data);
  }

  // delete

  public async delete(
    identifier: Partial<PersistedPriceEntry> = {}
  ): Promise<number> {
    return await super.delete(identifier);
  }

  public async deleteAll(): Promise<number> {
    return await super.delete();
  }
}
