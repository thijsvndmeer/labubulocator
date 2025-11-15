import express, { Request, Response } from "express";
import { searchSettingsService } from "../index"; // Import the instantiated searchSettingsService
import { searchSettingsSchema, SearchSettings } from "@labubu/common";
import { z } from "zod";

const router = express.Router();

// Middleware to parse JSON request body
router.use(express.json());

// GET default search settings (no ID provided)
router.get("/", async (req: Request, res: Response) => {
  try {
    const settings = await searchSettingsService.getSearchSettings(); // Uses default 'main-search-config'
    if (settings) {
      res.json(settings);
    } else {
      // This case should ideally not happen if getSearchSettings creates a default
      res.status(404).json({ message: "Default search settings not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET search settings by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const settings = await searchSettingsService.getSearchSettings(id);
    if (settings) {
      res.json(settings);
    } else {
      res.status(404).json({ message: "Search settings not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT (update) search settings by ID
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const settingsData = searchSettingsSchema.partial().omit({ id: true, createdAt: true }).parse(req.body);
    const updatedRows = await searchSettingsService.updateSearchSettings(id, {
        ...settingsData,
        updatedAt: new Date().toISOString(),
    } as Partial<Omit<SearchSettings, "id">>);

    if (updatedRows > 0) {
      res.json({ message: "Search settings updated successfully" });
    } else {
      res.status(404).json({ message: "Search settings not found" });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.issues });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

export default router;
