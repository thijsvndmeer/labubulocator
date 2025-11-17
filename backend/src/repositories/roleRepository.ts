import { Database } from "sqlite3";
import { BaseRepository } from "./baseRepository";
import { Role, QueryOptions } from "@labubu/common";

export class RoleRepository extends BaseRepository<Role> {
  constructor(db: Database) {
    super(db, "roles");
  }

  async createRole(role: Omit<Role, "id">): Promise<number> {
    return this.create(role);
  }

  async getRoles(options?: QueryOptions<Role>): Promise<Role[]> {
    return this.get(options);
  }

  async updateRole(criteria: QueryOptions<Role>, data: Partial<Omit<Role, "id">>): Promise<number> {
    return this.update(criteria, data);
  }

  async deleteRole(criteria: QueryOptions<Role>): Promise<number> {
    return this.delete(criteria);
  }
}
