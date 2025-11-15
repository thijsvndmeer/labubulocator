import { Database } from "sqlite3";
import { SearchSettings, Facet } from "@labubu/common";
import { SearchSettingsRepository } from "../repositories/searchSettingsRepository";

export class SearchSettingsService {
  private searchSettingsRepository: SearchSettingsRepository;

  constructor(db: Database) {
    this.searchSettingsRepository = new SearchSettingsRepository(db);
  }

  public async getSearchSettings(id: string = 'main-search-config'): Promise<SearchSettings | undefined> {
    let settings = await this.searchSettingsRepository.getById(id);
    if (!settings) {
      // If settings don't exist, create a default one
      const defaultFacets: Facet[] = [
        { key: 'rarity', label: 'Rarity', type: 'text', options: ['Common', 'Rare', 'Limited Edition'] },
        { key: 'price', label: 'Price Range', type: 'range' },
        { key: 'inStock', label: 'In Stock', type: 'boolean' },
      ];

      const defaultSearchSettings: Omit<SearchSettings, "id"> = {
        enabledFilters: ['rarity', 'character', 'set'],
        defaultSortBy: 'name_asc',
        autocompleteEnabled: true,
        autocompleteMinChars: 3,
        facets: defaultFacets,
        boostedFields: { name: 2.0, description: 1.0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      };
      await this.searchSettingsRepository.create({ ...defaultSearchSettings, id: id } as SearchSettings); // Temporarily add ID for creation
      settings = await this.searchSettingsRepository.getById(id); // Fetch the newly created settings
    }
    return settings;
  }

  public async updateSearchSettings(id: string, searchSettingsData: Partial<Omit<SearchSettings, "id">>): Promise<number> {
    return this.searchSettingsRepository.updateById(id, searchSettingsData);
  }
}
