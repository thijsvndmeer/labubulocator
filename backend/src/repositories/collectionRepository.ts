import { Database } from "sqlite3";
import { Collection } from "@labubu/common";
import { BaseRepository } from "./baseRepository";

export class CollectionRepository extends BaseRepository<Collection> {
  constructor(db: Database) {
    super(db, "collections");
  }

  public async create(data: Omit<Collection, "id">): Promise<string | number> {
    return await super.create(data);
  }

  public async get<K extends keyof Collection>(
    options: import("@labubu/common").QueryOptions<Collection> = {},
    fields?: K[]
  ): Promise<Pick<Collection, K>[]> {
    return await super.get(options, fields);
  }

  public async getById(id: string): Promise<Collection | undefined> {
    const result = await this.get({ filter: { id } });
    return result[0];
  }

  public async updateById(id: string, data: Partial<Omit<Collection, "id">>): Promise<number> {
    return await super.update({ filter: { id } }, data);
  }

  public async removeById(id: string): Promise<number> {
    return await super.delete({ filter: { id } });
  }
}
