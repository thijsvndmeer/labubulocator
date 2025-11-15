import express, { Request, Response } from "express";
import { collectionService } from "../index"; // Import the instantiated collectionService
import { collectionSchema, Collection } from "@labubu/common";
import { z } from "zod";

const router = express.Router();

// Middleware to parse JSON request body
router.use(express.json());

// GET all collections or by query options
router.get("/", async (req: Request, res: Response) => {
  try {
    const options = req.query; // Query options for filtering, sorting, pagination
    const collections = await collectionService.getAllCollections(options);
    res.json(collections);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET collection by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collection = await collectionService.getCollectionById(id);
    if (collection) {
      res.json(collection);
    } else {
      res.status(404).json({ message: "Collection not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new collection
router.post("/", async (req: Request, res: Response) => {
  try {
    const collectionData = collectionSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
    const newCollectionId = await collectionService.createCollection({
      ...collectionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Omit<Collection, "id">); // Cast to Omit<Collection, "id"> to satisfy type checker

    res.status(201).json({ id: newCollectionId, message: "Collection created successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.issues });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// PUT (update) a collection by ID
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collectionData = collectionSchema.partial().omit({ id: true, createdAt: true }).parse(req.body); // Allow partial updates, omit id and createdAt
    const updatedRows = await collectionService.updateCollection(id, {
        ...collectionData,
        updatedAt: new Date().toISOString(),
    } as Partial<Omit<Collection, "id">>); // Cast to Partial<Omit<Collection, "id">>

    if (updatedRows > 0) {
      res.json({ message: "Collection updated successfully" });
    } else {
      res.status(404).json({ message: "Collection not found" });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.issues });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// DELETE a collection by ID
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedRows = await collectionService.deleteCollection(id);
    if (deletedRows > 0) {
      res.json({ message: "Collection deleted successfully" });
    } else {
      res.status(404).json({ message: "Collection not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
