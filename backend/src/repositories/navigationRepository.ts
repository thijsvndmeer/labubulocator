import { BaseRepository } from "./baseRepository";
import { Navigation } from "@labubu/common";
import { Database } from "sqlite3";

export class NavigationRepository extends BaseRepository<Navigation> {
  constructor(db: Database) {
    super(db, "navigation");
  }
}
