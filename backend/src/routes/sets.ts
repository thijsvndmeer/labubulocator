import express, { Request, Response } from "express";
import { setService } from "../index"; // Import the instantiated setService
import { setSchema, Set } from "@labubu/common";
import { z } from "zod";

const router = express.Router();

// Middleware to parse JSON request body
router.use(express.json());

// GET all sets or by query options
router.get("/", async (req: Request, res: Response) => {
  try {
    const options = req.query; // Query options for filtering, sorting, pagination
    const sets = await setService.getAllSets(options);
    res.json(sets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET set by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const set = await setService.getSetById(id);
    if (set) {
      res.json(set);
    } else {
      res.status(404).json({ message: "Set not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new set
router.post("/", async (req: Request, res: Response) => {
  try {
    const setData = setSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
    const newSetId = await setService.createSet({
      ...setData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Omit<Set, "id">); // Cast to Omit<Set, "id"> to satisfy type checker

    res.status(201).json({ id: newSetId, message: "Set created successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.issues });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// PUT (update) a set by ID
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const setData = setSchema.partial().omit({ id: true, createdAt: true }).parse(req.body); // Allow partial updates, omit id and createdAt
    const updatedRows = await setService.updateSet(id, {
        ...setData,
        updatedAt: new Date().toISOString(),
    } as Partial<Omit<Set, "id">>); // Cast to Partial<Omit<Set, "id">>

    if (updatedRows > 0) {
      res.json({ message: "Set updated successfully" });
    } else {
      res.status(404).json({ message: "Set not found" });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.issues });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// DELETE a set by ID
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedRows = await setService.deleteSet(id);
    if (deletedRows > 0) {
      res.json({ message: "Set deleted successfully" });
    } else {
      res.status(404).json({ message: "Set not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
