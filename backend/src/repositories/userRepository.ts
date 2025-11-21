import { BaseRepository } from "./baseRepository";
import { User } from "@labubu/common";
import { Database } from "sqlite3";

export class UserRepository extends BaseRepository<User> {
  constructor(db: Database) {
    super(db, "users");
  }
}
