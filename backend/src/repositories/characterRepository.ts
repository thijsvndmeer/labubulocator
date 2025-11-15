import { Database } from "sqlite3";
import { Character } from "@labubu/common";
import { BaseRepository } from "./baseRepository";

export class CharacterRepository extends BaseRepository<Character> {
  constructor(db: Database) {
    super(db, "characters");
  }

  public async create(data: Omit<Character, "id">): Promise<string | number> {
    return await super.create(data);
  }

  public async get<K extends keyof Character>(
    options: import("@labubu/common").QueryOptions<Character> = {},
    fields?: K[]
  ): Promise<Pick<Character, K>[]> {
    return await super.get(options, fields);
  }

  public async getById(id: string): Promise<Character | undefined> {
    const result = await this.get({ filter: { id } });
    return result[0];
  }

  public async updateById(id: string, data: Partial<Omit<Character, "id">>): Promise<number> {
    return await super.update({ filter: { id } }, data);
  }

  public async removeById(id: string): Promise<number> {
    return await super.delete({ filter: { id } });
  }
}
