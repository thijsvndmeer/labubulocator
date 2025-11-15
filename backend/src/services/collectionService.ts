import { Database } from "sqlite3";
import { Collection } from "@labubu/common";
import { CollectionRepository } from "../repositories/collectionRepository";

export class CollectionService {
  private collectionRepository: CollectionRepository;

  constructor(db: Database) {
    this.collectionRepository = new CollectionRepository(db);
  }

  public async getAllCollections(options?: any): Promise<Collection[]> {
    return this.collectionRepository.get(options);
  }

  public async getCollectionById(id: string): Promise<Collection | undefined> {
    return this.collectionRepository.getById(id);
  }

  public async createCollection(collectionData: Omit<Collection, "id">): Promise<string | number> {
    return this.collectionRepository.create(collectionData);
  }

  public async updateCollection(id: string, collectionData: Partial<Omit<Collection, "id">>): Promise<number> {
    return this.collectionRepository.updateById(id, collectionData);
  }

  public async deleteCollection(id: string): Promise<number> {
    return this.collectionRepository.removeById(id);
  }
}
