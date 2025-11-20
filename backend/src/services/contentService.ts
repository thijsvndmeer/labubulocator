import { ContentRepository } from "../repositories/contentRepository";
import { defaultSiteContent } from "@labubu/common";

export const ensureDefaultContent = async (repository: ContentRepository) => {
  for (const [key, value] of Object.entries(defaultSiteContent)) {
    const existing = await repository.get({ filter: { key } }, ["id"]);
    if (existing.length === 0) {
      await repository.create({ key, value });
    }
  }
};
