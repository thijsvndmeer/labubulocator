import { Router } from "express";
import multer, { FileFilterCallback } from "multer";
import { labubuRepository, characterRepository } from "../index";
import { Labubu, labubuSchema, User, Role, Content, Settings, Character, characterSchema } from "@labubu/common";
import { replaceLabubuCatalog } from "../services/labubuSyncService";

const router = Router();

// Admin authentication middleware
const adminAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'supersecrettokenpleasereplaceme';
  
  if (token === ADMIN_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit to prevent runaway uploads
  fileFilter: (req, file, cb: FileFilterCallback) => {
    if (file.mimetype === "text/csv" || file.originalname.toLowerCase().endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

//============================================================================================================================================================================================
// Auth routes
//============================================================================================================================================================================================

router.post("/auth/login", async (req, res) => {
  const { token } = req.body;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'supersecrettokenpleasereplaceme';
  
  if (token === ADMIN_TOKEN) {
    res.status(200).json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

router.post("/auth/verify", async (req, res) => {
  const { token } = req.body;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'supersecrettokenpleasereplaceme';
  
  res.status(200).json({ valid: token === ADMIN_TOKEN });
});

//============================================================================================================================================================================================
// Labubu admin routes
//============================================================================================================================================================================================

router.get("/labubus", adminAuth, async (req, res) => {
  try {
    const result = await labubuRepository.get({});
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching labubus.", details: err });
  }
});

router.get("/labubus/:sku", adminAuth, async (req, res) => {
  try {
    const result = await labubuRepository.get({ filter: { sku: req.params.sku } });
    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ error: `Labubu with sku "${req.params.sku}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the labubu.", details: err });
  }
});

router.post("/labubus", adminAuth, async (req, res) => {
  try {
    const labubu = labubuSchema.parse(req.body);
    await labubuRepository.updateOrCreate(labubu);
    res.status(201).json({ message: 'Labubu created successfully', labubu });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.put("/labubus/:sku", adminAuth, async (req, res) => {
  try {
    const labubu = labubuSchema.parse({ ...req.body, sku: req.params.sku });
    await labubuRepository.updateOrCreate(labubu);
    res.status(200).json({ message: 'Labubu updated successfully', labubu });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.delete("/labubus/:sku", adminAuth, async (req, res) => {
  try {
    // Add delete functionality to repository if needed
    res.status(200).json({ message: 'Labubu deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the labubu.", details: err });
  }
});

router.post("/labubus/upload", adminAuth, csvUpload.single("catalog"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "A CSV file must be provided using the 'catalog' field." });
  }

  try {
    const { processedCount } = await replaceLabubuCatalog(labubuRepository, req.file.buffer);
    res.status(200).json({
      message: "Catalog uploaded successfully. The labubu catalog has been replaced.",
      processed: processedCount,
    });
  } catch (error) {
    console.error("ADMIN: Failed to upload catalog", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Failed to upload catalog", details: message });
  }
});

//============================================================================================================================================================================================
// Character admin routes
//============================================================================================================================================================================================

router.get("/characters", adminAuth, async (req, res) => {
  try {
    const result = await characterRepository.get({});
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching characters.", details: err });
  }
});

router.get("/characters/:id", adminAuth, async (req, res) => {
  try {
    const result = await characterRepository.get({ filter: { id: parseInt(req.params.id) } });
    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ error: `Character with id "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the character.", details: err });
  }
});

router.post("/characters", adminAuth, async (req, res) => {
  try {
    const character = characterSchema.parse(req.body);
    const id = await characterRepository.create(character);
    res.status(201).json({ message: 'Character created successfully', id });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.put("/characters/:id", adminAuth, async (req, res) => {
  try {
    const character = characterSchema.parse({ ...req.body, id: parseInt(req.params.id) });
    await characterRepository.update({ filter: { id: parseInt(req.params.id) } }, character);
    res.status(200).json({ message: 'Character updated successfully', character });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.delete("/characters/:id", adminAuth, async (req, res) => {
  try {
    await characterRepository.delete({ filter: { id: parseInt(req.params.id) } });
    res.status(200).json({ message: 'Character deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the character.", details: err });
  }
});

//============================================================================================================================================================================================
// User admin routes (placeholder - implement with actual database)
//============================================================================================================================================================================================

router.get("/users", adminAuth, async (req, res) => {
  res.status(200).json([]);
});

router.get("/users/:id", adminAuth, async (req, res) => {
  res.status(404).json({ error: "User not found" });
});

router.post("/users", adminAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

router.put("/users/:id", adminAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

router.delete("/users/:id", adminAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

//============================================================================================================================================================================================
// Role admin routes (placeholder - implement with actual database)
//============================================================================================================================================================================================

router.get("/roles", adminAuth, async (req, res) => {
  res.status(200).json([
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Editor' },
    { id: 3, name: 'Viewer' }
  ]);
});

router.get("/roles/:id", adminAuth, async (req, res) => {
  res.status(404).json({ error: "Role not found" });
});

router.post("/roles", adminAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

router.put("/roles/:id", adminAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

router.delete("/roles/:id", adminAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

//============================================================================================================================================================================================
// Content admin routes (placeholder)
//============================================================================================================================================================================================

router.get("/content", adminAuth, async (req, res) => {
  res.status(200).json([]);
});

router.get("/content/:id", adminAuth, async (req, res) => {
  res.status(404).json({ error: "Content not found" });
});

router.post("/content", adminAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

router.put("/content/:id", adminAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

router.delete("/content/:id", adminAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

//============================================================================================================================================================================================
// Settings admin routes (placeholder)
//============================================================================================================================================================================================

router.get("/settings", adminAuth, async (req, res) => {
  res.status(200).json([]);
});

router.get("/settings/:id", adminAuth, async (req, res) => {
  res.status(404).json({ error: "Setting not found" });
});

router.post("/settings", adminAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

router.put("/settings/:id", adminAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

router.delete("/settings/:id", adminAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

export default router;
