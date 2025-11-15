import { Database } from "sqlite3";
import { SiteConfig } from "@labubu/common";
import { SiteConfigRepository } from "../repositories/siteConfigRepository";

export class SiteConfigService {
  private siteConfigRepository: SiteConfigRepository;

  constructor(db: Database) {
    this.siteConfigRepository = new SiteConfigRepository(db);
  }

  public async getSiteConfig(id: string = 'main-config'): Promise<SiteConfig | undefined> {
    let config = await this.siteConfigRepository.getById(id);
    if (!config) {
      // If config doesn't exist, create a default one
      const defaultSiteConfig: Omit<SiteConfig, "id"> = {
        siteTitle: "Labubu Locator",
        siteDescription: "",
        logoUrl: "",
        faviconUrl: "",
        apiBaseUrl: "",
        contactEmail: "",
        socialMediaLinks: {},
        featureFlags: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      };
      const newId = await this.siteConfigRepository.create({ ...defaultSiteConfig, id: id } as SiteConfig); // Temporarily add ID for creation
      config = await this.siteConfigRepository.getById(id); // Fetch the newly created config
    }
    return config;
  }

  public async updateSiteConfig(id: string, siteConfigData: Partial<Omit<SiteConfig, "id">>): Promise<number> {
    return this.siteConfigRepository.updateById(id, siteConfigData);
  }
}
