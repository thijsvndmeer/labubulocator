import { Database } from "sqlite3";
import { BaseRepository } from "./baseRepository";
import { Navigation, QueryOptions } from "../../../common/src/index";

export class NavigationRepository extends BaseRepository<Navigation> {
  constructor(db: Database) {
    super(db, "navigation");
  }

  async createNavigation(navigation: Omit<Navigation, "id">): Promise<number> {
    return this.create(navigation);
  }

  async getNavigation(options?: QueryOptions<Navigation>): Promise<Navigation[]> {
    return this.get(options);
  }

  async updateNavigation(criteria: QueryOptions<Navigation>, data: Partial<Omit<Navigation, "id">>): Promise<number> {
    return this.update(criteria, data);
  }

  async deleteNavigation(criteria: QueryOptions<Navigation>): Promise<number> {
    return this.delete(criteria);
  }
}
