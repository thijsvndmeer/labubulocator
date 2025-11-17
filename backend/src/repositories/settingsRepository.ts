import { Database } from "sqlite3";
import { BaseRepository } from "./baseRepository";
import { Settings, QueryOptions } from "../../../common/src/index";

export class SettingsRepository extends BaseRepository<Settings> {
  constructor(db: Database) {
    super(db, "settings");
  }

  async createSetting(setting: Omit<Settings, "id">): Promise<number> {
    return this.create(setting);
  }

  async getSettings(options?: QueryOptions<Settings>): Promise<Settings[]> {
    return this.get(options);
  }

  async updateSetting(criteria: QueryOptions<Settings>, data: Partial<Omit<Settings, "id">>): Promise<number> {
    return this.update(criteria, data);
  }

  async deleteSetting(criteria: QueryOptions<Settings>): Promise<number> {
    return this.delete(criteria);
  }
}
