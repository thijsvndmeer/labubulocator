import { BaseRepository } from "./baseRepository";
import { Role } from "@labubu/common";
import { Database } from "sqlite3";

export class RoleRepository extends BaseRepository<Role> {
  constructor(db: Database) {
    super(db, "roles");
  }
}
