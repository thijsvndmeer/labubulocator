import express, { Request, Response } from "express";
import { characterService } from "../index"; // Import the instantiated characterService
import { characterSchema, Character } from "@labubu/common";
import { z } from "zod";

const router = express.Router();

// Middleware to parse JSON request body
router.use(express.json());

// GET all characters or by query options
router.get("/", async (req: Request, res: Response) => {
  try {
    const options = req.query; // Query options for filtering, sorting, pagination
    const characters = await characterService.getAllCharacters(options);
    res.json(characters);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET character by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const character = await characterService.getCharacterById(id);
    if (character) {
      res.json(character);
    } else {
      res.status(404).json({ message: "Character not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new character
router.post("/", async (req: Request, res: Response) => {
  try {
    const characterData = characterSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
    const newCharacterId = await characterService.createCharacter({
      ...characterData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Omit<Character, "id">); // Cast to Omit<Character, "id"> to satisfy type checker

    res.status(201).json({ id: newCharacterId, message: "Character created successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.issues });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// PUT (update) a character by ID
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const characterData = characterSchema.partial().omit({ id: true, createdAt: true }).parse(req.body); // Allow partial updates, omit id and createdAt
    const updatedRows = await characterService.updateCharacter(id, {
        ...characterData,
        updatedAt: new Date().toISOString(),
    } as Partial<Omit<Character, "id">>); // Cast to Partial<Omit<Character, "id">>

    if (updatedRows > 0) {
      res.json({ message: "Character updated successfully" });
    } else {
      res.status(404).json({ message: "Character not found" });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.issues });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// DELETE a character by ID
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedRows = await characterService.deleteCharacter(id);
    if (deletedRows > 0) {
      res.json({ message: "Character deleted successfully" });
    } else {
      res.status(404).json({ message: "Character not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
