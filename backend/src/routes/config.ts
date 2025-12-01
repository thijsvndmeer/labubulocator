import { Router } from "express";
import { contentRepository, navigationRepository, settingsRepository } from "../index";

const router = Router();

const mapKeyValues = (entries: { key: string; value?: string | null }[]) =>
  entries.reduce<Record<string, string>>((acc, entry) => {
    acc[entry.key] = entry.value ?? "";
    return acc;
  }, {});

router.get("/config", async (_req, res) => {
  try {
    const [settings, content, navigation] = await Promise.all([
      settingsRepository.get({}),
      contentRepository.get({}),
      navigationRepository.get({}),
    ]);

    res.status(200).json({
      settings: mapKeyValues(settings),
      content: mapKeyValues(content),
      navigation: navigation.map((nav) => ({
        ...nav,
        parsedStructure: (() => {
          try {
            return nav.structure ? JSON.parse(nav.structure) : [];
          } catch (error) {
            console.warn("CONFIG: Failed to parse navigation structure", nav.id, error);
            return [];
          }
        })(),
      })),
    });
  } catch (error) {
    console.error("CONFIG: Failed to load configuration", error);
    res.status(500).json({ error: "Failed to load site configuration" });
  }
});

export default router;
