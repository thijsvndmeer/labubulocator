import { Router } from "express";
import multer, { FileFilterCallback } from "multer";
import {
  labubuRepository,
  characterRepository,
  userRepository,
  roleRepository,
  contentRepository,
  settingsRepository,
  navigationRepository,
} from "../index";
import {
  Labubu,
  labubuSchema,
  User,
  userSchema,
  Role,
  roleSchema,
  Content,
  contentSchema,
  Settings,
  settingsSchema,
  Character,
  characterSchema,
  Navigation,
  navigationSchema,
} from "@labubu/common";
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
    const deleted = await labubuRepository.delete({ filter: { sku: req.params.sku } });
    if (deleted === 0) {
      return res.status(404).json({ error: `Labubu with sku "${req.params.sku}" not found` });
    }
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
  try {
    const users = await userRepository.get({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching users.", details: err });
  }
});

router.get("/users/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await userRepository.get({ filter: { id } });
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the user.", details: err });
  }
});

router.post("/users", adminAuth, async (req, res) => {
  try {
    const user = userSchema.parse(req.body as User);
    const id = await userRepository.create({ username: user.username, password: user.password, role_id: user.role_id });
    res.status(201).json({ message: "User created successfully", id });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.put("/users/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = userSchema.parse({ ...req.body, id } as User);
    await userRepository.update({ filter: { id } }, { username: user.username, password: user.password, role_id: user.role_id });
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await userRepository.delete({ filter: { id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the user.", details: err });
  }
});

//============================================================================================================================================================================================
// Role admin routes (placeholder - implement with actual database)
//============================================================================================================================================================================================

router.get("/roles", adminAuth, async (req, res) => {
  try {
    const roles = await roleRepository.get({});
    res.status(200).json(roles);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching roles.", details: err });
  }
});

router.get("/roles/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await roleRepository.get({ filter: { id } });
    if (result.length === 0) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the role.", details: err });
  }
});

router.post("/roles", adminAuth, async (req, res) => {
  try {
    const role = roleSchema.parse(req.body as Role);
    const id = await roleRepository.create({ name: role.name });
    res.status(201).json({ message: "Role created successfully", id });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.put("/roles/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const role = roleSchema.parse({ ...req.body, id } as Role);
    await roleRepository.update({ filter: { id } }, { name: role.name });
    res.status(200).json({ message: "Role updated successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.delete("/roles/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await roleRepository.delete({ filter: { id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the role.", details: err });
  }
});

//============================================================================================================================================================================================
// Content admin routes (placeholder)
//============================================================================================================================================================================================

router.get("/content", adminAuth, async (req, res) => {
  try {
    const content = await contentRepository.get({});
    res.status(200).json(content);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching content.", details: err });
  }
});

router.get("/content/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await contentRepository.get({ filter: { id } });
    if (result.length === 0) {
      return res.status(404).json({ error: "Content not found" });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the content entry.", details: err });
  }
});

router.post("/content", adminAuth, async (req, res) => {
  try {
    const content = contentSchema.parse(req.body as Content);
    const id = await contentRepository.create({ key: content.key, value: content.value, last_updated: new Date().toISOString() });
    res.status(201).json({ message: "Content created successfully", id });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.put("/content/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const content = contentSchema.parse({ ...req.body, id } as Content);
    await contentRepository.update(
      { filter: { id } },
      { key: content.key, value: content.value, last_updated: new Date().toISOString() }
    );
    res.status(200).json({ message: "Content updated successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.delete("/content/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await contentRepository.delete({ filter: { id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "Content not found" });
    }
    res.status(200).json({ message: "Content deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the content entry.", details: err });
  }
});

//============================================================================================================================================================================================
// Settings admin routes (placeholder)
//============================================================================================================================================================================================

router.get("/settings", adminAuth, async (req, res) => {
  try {
    const settings = await settingsRepository.get({});
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching settings.", details: err });
  }
});

router.get("/settings/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await settingsRepository.get({ filter: { id } });
    if (result.length === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the setting.", details: err });
  }
});

router.post("/settings", adminAuth, async (req, res) => {
  try {
    const setting = settingsSchema.parse(req.body as Settings);
    const id = await settingsRepository.create({ key: setting.key, value: setting.value, last_updated: new Date().toISOString() });
    res.status(201).json({ message: "Setting created successfully", id });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.put("/settings/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const setting = settingsSchema.parse({ ...req.body, id } as Settings);
    await settingsRepository.update(
      { filter: { id } },
      { key: setting.key, value: setting.value, last_updated: new Date().toISOString() }
    );
    res.status(200).json({ message: "Setting updated successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.delete("/settings/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await settingsRepository.delete({ filter: { id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }
    res.status(200).json({ message: "Setting deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the setting.", details: err });
  }
});

//==============================================================================================================================
// Navigation admin routes
//==============================================================================================================================

router.get("/navigation", adminAuth, async (_req, res) => {
  try {
    const navigations = await navigationRepository.get({});
    res.status(200).json(navigations);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching navigation entries.", details: err });
  }
});

router.get("/navigation/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await navigationRepository.get({ filter: { id } });
    if (result.length === 0) {
      return res.status(404).json({ error: "Navigation entry not found" });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the navigation entry.", details: err });
  }
});

router.post("/navigation", adminAuth, async (req, res) => {
  try {
    const navigation = navigationSchema.parse(req.body as Navigation);
    const id = await navigationRepository.create({ ...navigation, last_updated: new Date().toISOString() });
    res.status(201).json({ message: "Navigation entry created successfully", id });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.put("/navigation/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const navigation = navigationSchema.parse({ ...req.body, id } as Navigation);
    await navigationRepository.update(
      { filter: { id } },
      { name: navigation.name, structure: navigation.structure, last_updated: new Date().toISOString() }
    );
    res.status(200).json({ message: "Navigation entry updated successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid data", details: err });
  }
});

router.delete("/navigation/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await navigationRepository.delete({ filter: { id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "Navigation entry not found" });
    }
    res.status(200).json({ message: "Navigation entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the navigation entry.", details: err });
  }
});

export default router;
