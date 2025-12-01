import { ContentRepository } from "../repositories/contentRepository";
import { SettingsRepository } from "../repositories/settingsRepository";

const defaultSettings: Record<string, string> = {
  "brand.name": "Collector Control",
  "brand.tagline": "Track and manage every collectible in one place",
  "collectible.singular": "Collectible",
  "collectible.plural": "Collectibles",
  "collectible.catalogLabel": "Catalog",
};

const defaultContent: Record<string, string> = {
  "hero.title": "Track Your Collection Value",
  "hero.subtitle": "Real-time value estimates and price comparisons for your collectibles.",
  "hero.ctaLabel": "Browse the catalog",
  "hero.image": "/images/hero-banner.jpg",
  "copy.marketData":
    "Estimated values are generated from historical sales, current listings, and market trends. They are approximations and not guaranteed market prices.",
};

const upsertSetting = async (repository: SettingsRepository, key: string, value: string) => {
  const existing = await repository.get({ filter: { key } });
  if (existing.length === 0) {
    await repository.create({ key, value, last_updated: new Date().toISOString() });
  }
};

const upsertContent = async (repository: ContentRepository, key: string, value: string) => {
  const existing = await repository.get({ filter: { key } });
  if (existing.length === 0) {
    await repository.create({ key, value, last_updated: new Date().toISOString() });
  }
};

export const ensureDefaultConfig = async (
  settingsRepository: SettingsRepository,
  contentRepository: ContentRepository,
) => {
  await Promise.all([
    ...Object.entries(defaultSettings).map(([key, value]) => upsertSetting(settingsRepository, key, value)),
    ...Object.entries(defaultContent).map(([key, value]) => upsertContent(contentRepository, key, value)),
  ]);
};

