import { Database } from "sqlite3";
import { SiteConfig } from "@labubu/common";
import { BaseRepository } from "./baseRepository";
import { runQuery } from "../utils/databaseUtils"; // Import runQuery

export class SiteConfigRepository extends BaseRepository<SiteConfig> {
  constructor(db: Database) {
    super(db, "site_config"); // Table name for site configuration
  }

  // Override create to handle the explicit ID for singleton
  public async create(data: SiteConfig): Promise<string | number> {
    const dataKeys = Object.keys(data);
    const sql = `INSERT INTO ${this.tableName} (${dataKeys.join(", ")}) VALUES (${dataKeys.map(() => "?").join(", ")})`;
    const result = await runQuery(this.db, sql, Object.values(data));
    return result.lastID || data.id; // Return new ID or the one provided
  }

  public async get<K extends keyof SiteConfig>(
    options: import("@labubu/common").QueryOptions<SiteConfig> = {},
    fields?: K[]
  ): Promise<Pick<SiteConfig, K>[]> {
    return await super.get(options, fields);
  }

  public async getById(id: string): Promise<SiteConfig | undefined> {
    const result = await this.get({ filter: { id } });
    return result[0];
  }

  public async updateById(id: string, data: Partial<Omit<SiteConfig, "id">>): Promise<number> {
    return await super.update({ filter: { id } }, data);
  }

  public async removeById(id: string): Promise<number> {
    // For a singleton, deletion might be restricted or re-creation auto-triggered
    return await super.delete({ filter: { id } });
  }
}
