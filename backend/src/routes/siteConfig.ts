import express, { Request, Response } from "express";
import { siteConfigService } from "../index"; // Import the instantiated siteConfigService
import { siteConfigSchema, SiteConfig } from "@labubu/common";
import { z } from "zod";

const router = express.Router();

// Middleware to parse JSON request body
router.use(express.json());

// GET default site configuration (no ID provided)
router.get("/", async (req: Request, res: Response) => {
  try {
    const config = await siteConfigService.getSiteConfig(); // Uses default 'main-config'
    if (config) {
      res.json(config);
    } else {
      // This case should ideally not happen if getSiteConfig creates a default
      res.status(404).json({ message: "Default site configuration not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET site configuration by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = await siteConfigService.getSiteConfig(id);
    if (config) {
      res.json(config);
    } else {
      res.status(404).json({ message: "Site configuration not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT (update) site configuration by ID
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const configData = siteConfigSchema.partial().omit({ id: true, createdAt: true }).parse(req.body);
    const updatedRows = await siteConfigService.updateSiteConfig(id, {
        ...configData,
        updatedAt: new Date().toISOString(),
    } as Partial<Omit<SiteConfig, "id">>);

    if (updatedRows > 0) {
      res.json({ message: "Site configuration updated successfully" });
    } else {
      res.status(404).json({ message: "Site configuration not found" });
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
