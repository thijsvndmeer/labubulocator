import { BaseRepository } from "./baseRepository";
import { Settings } from "@labubu/common";
import { Database } from "sqlite3";

export class SettingsRepository extends BaseRepository<Settings> {
  constructor(db: Database) {
    super(db, "settings");
  }
}
