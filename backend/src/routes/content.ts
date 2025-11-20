import { Router } from "express";
import { contentRepository } from "../index";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const entries = await contentRepository.get({}, ["id", "key", "value", "last_updated"]);
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to load site content", details: error });
  }
});

router.get("/:key", async (req, res) => {
  try {
    const entry = await contentRepository.getByKey(req.params.key);
    if (!entry) {
      res.status(404).json({ error: `Content with key "${req.params.key}" not found` });
      return;
    }
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: "Failed to load site content entry", details: error });
  }
});

export default router;
