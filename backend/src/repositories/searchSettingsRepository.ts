import { Database } from "sqlite3";
import { SearchSettings } from "@labubu/common";
import { BaseRepository } from "./baseRepository";
import { runQuery } from "../utils/databaseUtils"; // Import runQuery

export class SearchSettingsRepository extends BaseRepository<SearchSettings> {
  constructor(db: Database) {
    super(db, "search_settings"); // Table name for search settings
  }

  // Override create to handle the explicit ID for singleton
  public async create(data: SearchSettings): Promise<string | number> {
    const dataKeys = Object.keys(data);
    const sql = `INSERT INTO ${this.tableName} (${dataKeys.join(", ")}) VALUES (${dataKeys.map(() => "?").join(", ")})`;
    const result = await runQuery(this.db, sql, Object.values(data));
    return result.lastID || data.id; // Return new ID or the one provided
  }

  public async get<K extends keyof SearchSettings>(
    options: import("@labubu/common").QueryOptions<SearchSettings> = {},
    fields?: K[]
  ): Promise<Pick<SearchSettings, K>[]> {
    return await super.get(options, fields);
  }

  public async getById(id: string): Promise<SearchSettings | undefined> {
    const result = await this.get({ filter: { id } });
    return result[0];
  }

  public async updateById(id: string, data: Partial<Omit<SearchSettings, "id">>): Promise<number> {
    return await super.update({ filter: { id } }, data);
  }

  public async removeById(id: string): Promise<number> {
    return await super.delete({ filter: { id } });
  }
}
