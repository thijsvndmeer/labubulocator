import { Database } from "sqlite3";
import { Set } from "@labubu/common";
import { SetRepository } from "../repositories/setRepository";

export class SetService {
  private setRepository: SetRepository;

  constructor(db: Database) {
    this.setRepository = new SetRepository(db);
  }

  public async getAllSets(options?: any): Promise<Set[]> {
    return this.setRepository.get(options);
  }

  public async getSetById(id: string): Promise<Set | undefined> {
    return this.setRepository.getById(id);
  }

  public async createSet(setData: Omit<Set, "id">): Promise<string | number> {
    return this.setRepository.create(setData);
  }

  public async updateSet(id: string, setData: Partial<Omit<Set, "id">>): Promise<number> {
    return this.setRepository.updateById(id, setData);
  }

  public async deleteSet(id: string): Promise<number> {
    return this.setRepository.removeById(id);
  }
}
