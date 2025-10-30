import { Database } from "sqlite3";
import { PersistedPriceEntry, PriceEntryData, QueryCriteria, QueryOptions } from "../types/labubu";
import { BaseRepository } from "./baseRepository";
import { getQuery } from "../utils/databaseUtils";

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

  public async getMinMaxPriceForLabubuLast24h(labubuSku: string): Promise<{ min: number; max: number } | null> {
    console.log(`REPOSITORY: Getting min/max price for labubu ${labubuSku} in the last 24h.`);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const oneDayAgoISO = oneDayAgo.toISOString();

    const sql = `
      SELECT MIN(ph.price) as minPrice, MAX(ph.price) as maxPrice
      FROM price_history ph
      JOIN listings l ON ph.listingId = l.id
      WHERE l.labubuSku = ? AND ph.date >= ?
    `;
    const result = await getQuery<{ minPrice: number; maxPrice: number }>(this.db, sql, [labubuSku, oneDayAgoISO]);

    if (result && result.length > 0 && result[0].minPrice !== null && result[0].maxPrice !== null) {
      console.log(`REPOSITORY: Found min/max price for labubu ${labubuSku}:`, result[0]);
      return { min: result[0].minPrice, max: result[0].maxPrice };
    }
    console.log(`REPOSITORY: No min/max price found for labubu ${labubuSku}.`);
    return null;
  }

  public async getAllByLabubuSku(labubuSku: string): Promise<{ price: number; date: string }[]> {
    console.log(`REPOSITORY: Getting all price history for labubu ${labubuSku}.`);
    const sql = `
      SELECT ph.price, ph.date
      FROM price_history ph
      JOIN listings l ON ph.listingId = l.id
      WHERE l.labubuSku = ?
    `;
    const result = await getQuery<{ price: number; date: string }>(this.db, sql, [labubuSku]);
    console.log(`REPOSITORY: Found ${result.length} price history records for labubu ${labubuSku}.`);
    return result || [];
  }
}
