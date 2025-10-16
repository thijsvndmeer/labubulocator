import { Database } from "sqlite3";
import { PersistedPriceEntry, PriceEntryData } from "../types/labubu";
import { BaseRepository } from "./baseRepository";
import { WhereOptions } from "src/utils/databaseUtils";

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
    whereOptions: WhereOptions<PersistedPriceEntry> = {},
    fields: K[] = []
  ): Promise<Pick<PersistedPriceEntry, K>[]> {
    return await super.get(whereOptions, fields);
  }

  // update

  public async update(
    whereOptions: WhereOptions<PersistedPriceEntry> = {},
    data: Partial<PriceEntryData>
  ): Promise<number> {
    return await super.update(whereOptions, data);
  }

  // delete

  public async delete(whereOptions: WhereOptions<PersistedPriceEntry> = {}): Promise<number> {
    return await super.delete(whereOptions);
  }
}
