import { Database } from "sqlite3";
import { Variant } from "@labubu/common";
import { VariantRepository } from "../repositories/variantRepository";

export class VariantService {
  private variantRepository: VariantRepository;

  constructor(db: Database) {
    this.variantRepository = new VariantRepository(db);
  }

  public async getAllVariants(options?: any): Promise<Variant[]> {
    return this.variantRepository.get(options);
  }

  public async getVariantById(id: string): Promise<Variant | undefined> {
    return this.variantRepository.getById(id);
  }

  public async getVariantBySku(sku: string): Promise<Variant | undefined> {
    const result = await this.variantRepository.get({ filter: { sku } });
    return result[0];
  }

  public async createVariant(variantData: Omit<Variant, "id">): Promise<string | number> {
    return this.variantRepository.create(variantData);
  }

  public async updateVariant(id: string, variantData: Partial<Omit<Variant, "id">>): Promise<number> {
    return this.variantRepository.updateById(id, variantData);
  }

  public async deleteVariant(id: string): Promise<number> {
    return this.variantRepository.removeById(id);
  }
}
