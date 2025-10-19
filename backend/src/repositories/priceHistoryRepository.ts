import { Database } from "sqlite3";
import { PersistedPriceEntry, PriceEntryData, QueryCriteria, QueryOptions } from "../types/labubu";
import { BaseRepository } from "./baseRepository";

export class PriceHistoryRepository extends BaseRepository<PersistedPriceEntry> {
  //============================================================================================================================================================================================
  // Constructor
  //============================================================================================================================================================================================

  constructor(db: Database) {
    super(db, "price_history");
  }

  //============================================================================================================================================================================================
  // CRUD methods
  //============================================================================================================================================================================================

  // create

  public async create(data: PriceEntryData): Promise<number> {
    return await super.create(data);
  }

  // read

  public async get<K extends keyof PersistedPriceEntry>(
    options: QueryOptions<PersistedPriceEntry> = {},
    fields?: K[]
  ): Promise<Pick<PersistedPriceEntry, K>[]> {
    return await super.get(options, fields);
  }

  // update

  public async update(
    criteria: QueryCriteria<PersistedPriceEntry> = {},
    data: Partial<PriceEntryData>
  ): Promise<number> {
    return await super.update(criteria, data);
  }

  // delete

  public async delete(criteria: QueryCriteria<PersistedPriceEntry> = {}): Promise<number> {
    return await super.delete(criteria);
  }
}
