import { BaseRepository } from "./baseRepository";
import { Content } from "@labubu/common";
import { Database } from "sqlite3";

export class ContentRepository extends BaseRepository<Content> {
  constructor(db: Database) {
    super(db, "content");
  }
}
