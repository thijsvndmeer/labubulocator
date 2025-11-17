import { Database } from "sqlite3";
import { BaseRepository } from "./baseRepository";
import { Content, QueryOptions } from "@labubu/common";

export class ContentRepository extends BaseRepository<Content> {
  constructor(db: Database) {
    super(db, "content");
  }

  async createContent(content: Omit<Content, "id">): Promise<number> {
    return this.create(content);
  }

  async getContent(options?: QueryOptions<Content>): Promise<Content[]> {
    return this.get(options);
  }

  async updateContent(criteria: QueryOptions<Content>, data: Partial<Omit<Content, "id">>): Promise<number> {
    return this.update(criteria, data);
  }

  async deleteContent(criteria: QueryOptions<Content>): Promise<number> {
    return this.delete(criteria);
  }
}