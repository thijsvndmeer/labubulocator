import { Database } from "sqlite3";
import { Character } from "@labubu/common";
import { CharacterRepository } from "../repositories/characterRepository";

export class CharacterService {
  private characterRepository: CharacterRepository;

  constructor(db: Database) {
    this.characterRepository = new CharacterRepository(db);
  }

  public async getAllCharacters(options?: any): Promise<Character[]> {
    return this.characterRepository.get(options);
  }

  public async getCharacterById(id: string): Promise<Character | undefined> {
    return this.characterRepository.getById(id);
  }

  public async createCharacter(characterData: Omit<Character, "id">): Promise<string | number> {
    return this.characterRepository.create(characterData);
  }

  public async updateCharacter(id: string, characterData: Partial<Omit<Character, "id">>): Promise<number> {
    return this.characterRepository.updateById(id, characterData);
  }

  public async deleteCharacter(id: string): Promise<number> {
    return this.characterRepository.removeById(id);
  }
}
