import { Database } from "sqlite3";
import { BaseRepository } from "./baseRepository";
import { getQuery } from "../utils/databaseUtils";

export interface EstimatedValueHistory {
  id: number;
  labubuSku: string;
  estimatedValue: number;
  date: string;
}

export class EstimatedValueHistoryRepository extends BaseRepository<EstimatedValueHistory> {
  constructor(db: Database) {
    super(db, "estimated_value_history");
  }

  public async create(data: Omit<EstimatedValueHistory, "id">): Promise<number> {
    return await super.create(data);
  }

  public async getLatestByLabubuSku(labubuSku: string): Promise<EstimatedValueHistory | null> {
    const sql = `
      SELECT *
      FROM estimated_value_history
      WHERE labubuSku = ?
      ORDER BY date DESC
      LIMIT 1
    `;
    const result = await getQuery<EstimatedValueHistory>(this.db, sql, [labubuSku]);
    return result && result.length > 0 ? result[0] : null;
  }

  public async getByLabubuSkuAndDate(labubuSku: string, date: string): Promise<EstimatedValueHistory | null> {
    const sql = `
      SELECT *
      FROM estimated_value_history
      WHERE labubuSku = ? AND date >= ?
      ORDER BY date ASC
      LIMIT 1
    `;
    const result = await getQuery<EstimatedValueHistory>(this.db, sql, [labubuSku, date]);
    return result && result.length > 0 ? result[0] : null;
  }
}
