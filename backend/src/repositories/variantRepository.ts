import { Database } from "sqlite3";
import { Variant, QueryOptions, QueryCriteria } from "@labubu/common";
import { BaseRepository } from "./baseRepository";

export class VariantRepository extends BaseRepository<Variant> {
  constructor(db: Database) {
    super(db, "variants");
  }

  // create
  public async create(data: Omit<Variant, "id">): Promise<string | number> {
    return await super.create(data);
  }

  public async getOrCreate(data: Variant): Promise<string | number> {
    const existing = await this.get({ filter: { sku: data.sku } }, ["id"]);
    if (existing.length > 0) {
      return existing[0].id;
    }
    return await super.create(data);
  }

  public async updateOrCreate(data: Variant): Promise<string | number> {
    const existing = await this.get({ filter: { sku: data.sku } }, ["id"]);
    if (existing.length > 0) {
      await super.update({ filter: { sku: data.sku } }, data);
      return existing[0].id;
    }
    return await super.create(data);
  }

  // read
  public async get<K extends keyof Variant>(
    options: QueryOptions<Variant> = {},
    fields?: K[]
  ): Promise<Pick<Variant, K>[]> {
    return await super.get(options, fields);
  }

  public async getById(id: string): Promise<Variant | undefined> {
    const result = await this.get({ filter: { id } });
    return result[0];
  }

  public async updateById(id: string, data: Partial<Omit<Variant, "id">>): Promise<number> {
    return await super.update({ filter: { id } }, data);
  }

  public async removeById(id: string): Promise<number> {
    return await super.delete({ filter: { id } });
  }
}