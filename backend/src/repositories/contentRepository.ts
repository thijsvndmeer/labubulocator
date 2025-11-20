import { Database } from "sqlite3";
import { Content } from "@labubu/common";
import { BaseRepository } from "./baseRepository";
import { PersistedContent } from "../types/content";
import { QueryCriteria, QueryOptions } from "../types/labubu";

export class ContentRepository extends BaseRepository<PersistedContent> {
  constructor(db: Database) {
    super(db, "site_content");
  }

  private stamp<T extends object>(data: T) {
    return { ...data, last_updated: new Date().toISOString() };
  }

  public async create(data: Omit<PersistedContent, "id" | "last_updated">): Promise<number> {
    return super.create(this.stamp(data) as Omit<PersistedContent, "id">);
  }

  public async get<K extends keyof PersistedContent>(
    options: QueryOptions<PersistedContent> = {},
    fields?: K[]
  ): Promise<Pick<PersistedContent, K>[]> {
    return super.get(options, fields);
  }

  public async update(criteria: QueryCriteria<PersistedContent>, data: Partial<Content>): Promise<number> {
    return super.update(criteria, this.stamp(data));
  }

  public async delete(criteria: QueryCriteria<PersistedContent>): Promise<number> {
    return super.delete(criteria);
  }

  public async getByKey(key: string) {
    const [entry] = await this.get({ filter: { key } });
    return entry || null;
  }

  public async setKey(key: string, value: string) {
    const existing = await this.get({ filter: { key } }, ["id"]);
    if (existing.length === 0) {
      await this.create({ key, value });
      return this.getByKey(key);
    }
    await this.update({ filter: { key } }, { value });
    return this.getByKey(key);
  }
}
