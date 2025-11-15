import { Database } from "sqlite3";
import { Set } from "@labubu/common";
import { BaseRepository } from "./baseRepository";

export class SetRepository extends BaseRepository<Set> {
  constructor(db: Database) {
    super(db, "sets");
  }

  public async create(data: Omit<Set, "id">): Promise<string | number> {
    return await super.create(data);
  }

  public async get<K extends keyof Set>(
    options: import("@labubu/common").QueryOptions<Set> = {},
    fields?: K[]
  ): Promise<Pick<Set, K>[]> {
    return await super.get(options, fields);
  }

  public async getById(id: string): Promise<Set | undefined> {
    const result = await this.get({ filter: { id } });
    return result[0];
  }

  public async updateById(id: string, data: Partial<Omit<Set, "id">>): Promise<number> {
    return await super.update({ filter: { id } }, data);
  }

  public async removeById(id: string): Promise<number> {
    return await super.delete({ filter: { id } });
  }
}
