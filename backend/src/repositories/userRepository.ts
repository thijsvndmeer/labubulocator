import { Database } from "sqlite3";
import { BaseRepository } from "./baseRepository";
import { User, QueryOptions } from "../../../common/src/index";

export class UserRepository extends BaseRepository<User> {
  constructor(db: Database) {
    super(db, "users");
  }

  async createUser(user: Omit<User, "id">): Promise<number> {
    return this.create(user);
  }

  async getUsers(options?: QueryOptions<User>): Promise<User[]> {
    return this.get(options);
  }

  async updateUser(criteria: QueryOptions<User>, data: Partial<Omit<User, "id">>): Promise<number> {
    return this.update(criteria, data);
  }

  async deleteUser(criteria: QueryOptions<User>): Promise<number> {
    return this.delete(criteria);
  }
}
