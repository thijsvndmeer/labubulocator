import express, { Request, Response } from "express";
import { variantService } from "../index"; // Import the instantiated variantService
import { variantSchema, Variant } from "@labubu/common";
import { z } from "zod";

const router = express.Router();

// Middleware to parse JSON request body
router.use(express.json());

// GET all variants
router.get("/", async (req: Request, res: Response) => {
  console.log("ROUTE: GET /api/variants - Request received.");
  try {
    const options = req.query; // Query options for filtering, sorting, pagination
    const variants = await variantService.getAllVariants(options);
    console.log(`ROUTE: GET /api/variants - Found ${variants.length} variants.`);
    res.status(200).json(variants);
  } catch (error: any) {
    res.status(500).json({ error: "An error occurred while fetching variants.", details: error.message });
  }
});

// GET variant by ID
router.get("/:id", async (req: Request, res: Response) => {
  console.log(`ROUTE: GET /api/variants/${req.params.id} - Request received.`);
  try {
    const { id } = req.params;
    const variant = await variantService.getVariantById(id);
    if (variant) {
      console.log(`ROUTE: GET /api/variants/${req.params.id} - Found variant.`);
      res.status(200).json(variant);
    } else {
      console.log(`ROUTE: GET /api/variants/${req.params.id} - Variant not found.`);
      res.status(404).json({ error: `Variant with ID "${req.params.id}" not found` });
    }
  } catch (error: any) {
    res.status(500).json({ error: "An error occurred while fetching the variant.", details: error.message });
  }
});

// GET variant by SKU
router.get("/sku/:sku", async (req: Request, res: Response) => {
  console.log(`ROUTE: GET /api/variants/sku/${req.params.sku} - Request received.`);
  try {
    const { sku } = req.params;
    const variant = await variantService.getVariantBySku(sku);
    if (variant) {
      console.log(`ROUTE: GET /api/variants/sku/${req.params.sku} - Found variant.`);
      res.status(200).json(variant);
    } else {
      console.log(`ROUTE: GET /api/variants/sku/${req.params.sku} - Variant not found.`);
      res.status(404).json({ error: `Variant with SKU "${req.params.sku}" not found` });
    }
  } catch (error: any) {
    res.status(500).json({ error: "An error occurred while fetching the variant.", details: error.message });
  }
});

// POST a new variant
router.post("/", async (req: Request, res: Response) => {
  try {
    const variantData = variantSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
    const newVariantId = await variantService.createVariant({
      ...variantData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Omit<Variant, "id">); // Cast to Omit<Variant, "id"> to satisfy type checker

    res.status(201).json({ id: newVariantId, message: "Variant created successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.issues });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// PUT (update) a variant by ID
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const variantData = variantSchema.partial().omit({ id: true, createdAt: true }).parse(req.body); // Allow partial updates, omit id and createdAt
    const updatedRows = await variantService.updateVariant(id, {
        ...variantData,
        updatedAt: new Date().toISOString(),
    } as Partial<Omit<Variant, "id">>); // Cast to Partial<Omit<Variant, "id">>

    if (updatedRows > 0) {
      res.json({ message: "Variant updated successfully" });
    } else {
      res.status(404).json({ message: "Variant not found" });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.issues });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// DELETE a variant by ID
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedRows = await variantService.deleteVariant(id);
    if (deletedRows > 0) {
      res.json({ message: "Variant deleted successfully" });
    } else {
      res.status(404).json({ message: "Variant not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;