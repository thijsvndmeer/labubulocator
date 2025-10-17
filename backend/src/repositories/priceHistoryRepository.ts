import { Database } from "sqlite3";
import { PersistedPriceEntry, PriceEntryData } from "../types/labubu";
import { BaseRepository } from "./baseRepository";
import { QueryOptions } from "../types/labubu";

export class PriceHistoryRepository extends BaseRepository<PersistedPriceEntry> {
  //============================================================================================================================================================================================
  // Constructor
  //============================================================================================================================================================================================

  constructor(db: Database) {
    super(db, "price_history", ["id", "listingId", "price", "date"]);
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
    fields: K[] = []
  ): Promise<Pick<PersistedPriceEntry, K>[]> {
    return await super.get(options, fields);
  }

  // update

  public async update(
    options: Pick<QueryOptions<PersistedPriceEntry>, "filter" | "ranges"> = {},
    data: Partial<PriceEntryData>
  ): Promise<number> {
    return await super.update(options, data);
  }

  // delete

  public async delete(options: Pick<QueryOptions<PersistedPriceEntry>, "filter" | "ranges"> = {}): Promise<number> {
    return await super.delete(options);
  }
}
