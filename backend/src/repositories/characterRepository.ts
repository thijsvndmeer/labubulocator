import { Database } from "sqlite3";
import { Character } from "@labubu/common";
import { BaseRepository } from "./baseRepository";

export class CharacterRepository extends BaseRepository<Character> {
  constructor(db: Database) {
    super(db, "characters");
  }

  // You can add specific methods for Character if needed,
  // or just rely on the BaseRepository's generic methods (create, get, update, delete).
}
