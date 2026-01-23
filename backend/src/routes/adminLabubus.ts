import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { labubuRepository } from '../index'; // Assuming labubuRepository is exported from index.ts
import { Labubu, Rarity, StockStatus } from '@labubu/common'; // Adjust path if necessary
import Papa from 'papaparse'; // For CSV parsing
import multer from 'multer'; // Import multer for file uploads
import fs from 'fs'; // For file system operations
import path from 'path';
import {
  removeLabubuFromCsv,
  replaceCsvWithLabubus,
  restoreCsvFromBackup,
  upsertLabubuInCsv,
} from '../utils/labubuCsvManager';

const router = Router();

const isLocalRequest = (req: Request) => {
  const remoteAddress = req.ip?.replace('::ffff:', '') || '';
  return remoteAddress === '127.0.0.1' || remoteAddress === '::1';
};

const isLocalOrigin = (origin?: string) => {
  if (!origin) return false;

  try {
    const { hostname } = new URL(origin);
    return ['localhost', '127.0.0.1', '::1'].includes(hostname);
  } catch (error) {
    console.warn('Invalid origin header on admin request:', origin);
    return false;
  }
};

const restrictToLocalhost = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.ALLOW_REMOTE_ADMIN === 'true') {
    return next();
  }

  if (!isLocalRequest(req) && !isLocalOrigin(req.headers.origin)) {
    return res.status(403).json({ message: 'Admin API is only available from localhost-origin requests.' });
  }

  next();
};

// --- Zod Schemas for Validation ---
// Use z.enum for string literal union types
const RarityEnumSchema = z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'secret', 'chase'] as const);
const StockStatusEnumSchema = z.enum(['in_stock', 'low_stock', 'out_of_stock', 'pre_order', 'discontinued', 'aftermarketorbb'] as const);


const adminLabubuSchema = z.object({
  sku: z.string().min(1, 'SKU is required.'),
  name: z.string().min(1, 'Name is required.'),
  series: z.string().min(1, 'Series is required.'),
  rarity: RarityEnumSchema,
  description: z.string().optional(),
  msrp: z.number().min(0, 'MSRP must be a positive number.').optional(),
  variant: z.string().optional(),
  stockStatus: StockStatusEnumSchema.optional(),
  kicksdevId: z.string().optional(),
  ebaySearchOverride: z.string().optional(),
});

// For update, all fields are optional
const adminUpdateLabubuSchema = adminLabubuSchema.partial();


// --- Middleware ---

// Authentication Middleware
const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminToken = req.headers['x-admin-token'];
  const expectedToken = process.env.ADMIN_SECRET_TOKEN;

  if (!expectedToken) {
    console.error('ADMIN_SECRET_TOKEN is not set in environment variables.');
    return res.status(500).json({ message: 'Server configuration error: Admin token not set.' });
  }

  if (!adminToken || adminToken !== expectedToken) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or missing admin token.' });
  }
  next();
};

// Input Validation Middleware
const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues.map((err: z.ZodIssue) => ({ path: err.path.join('.'), message: err.message })),
      });
    }
    next(error); // Pass other errors to the next error handler
  }
};

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });
const imageUpload = multer({ dest: 'uploads/' });

const publicImagesPath = path.resolve(process.cwd(), 'public', 'images');


// --- Admin Labubu Routes ---

// Apply authentication and locality middleware to all admin routes
router.use(restrictToLocalhost);
router.use(adminAuth);

// Get all labubus (admin view, potentially more detailed)
router.get('/labubus', async (req: Request, res: Response) => {
  try {
    const labubus = await labubuRepository.get({});
    res.json(labubus);
  } catch (error: any) {
    console.error('Error in GET /admin-api/labubus:', error);
    res.status(500).json({ message: 'Error fetching labubus', error: error.message });
  }
});

// Get labubu by SKU
router.get('/labubus/:sku', async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;
    const labubu = await labubuRepository.get({ filter: { sku } });
    if (labubu.length > 0) {
      res.json(labubu[0]);
    } else {
      res.status(404).json({ message: `Labubu with SKU ${sku} not found.` });
    }
  } catch (error: any) {
    console.error(`Error in GET /admin-api/labubus/${req.params.sku}:`, error);
    res.status(500).json({ message: 'Error fetching labubu by SKU', error: error.message });
  }
});

// Create a new labubu
router.post('/labubus', validate(adminLabubuSchema), async (req: Request, res: Response) => {
  try {
    const newLabubuData: Labubu = req.body;
    const { previousCsvText } = await upsertLabubuInCsv(newLabubuData);
    try {
      await labubuRepository.create(newLabubuData);
      res.status(201).json({ message: 'Labubu created successfully', sku: newLabubuData.sku });
    } catch (error) {
      await restoreCsvFromBackup(previousCsvText);
      throw error;
    }
  } catch (error: any) {
    console.error('Error in POST /admin-api/labubus:', error);
    res.status(500).json({ message: 'Error creating labubu', error: error.message });
  }
});

// Update an existing labubu
router.put('/labubus/:sku', validate(adminUpdateLabubuSchema), async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;
    const updatedLabubuData: Partial<Labubu> = req.body;
    const { previousCsvText } = await upsertLabubuInCsv({ sku, ...updatedLabubuData });
    try {
      const rowsAffected = await labubuRepository.update({ filter: { sku } }, updatedLabubuData);

      if (rowsAffected > 0) {
        res.json({ message: `Labubu with SKU ${sku} updated successfully.` });
      } else {
        await restoreCsvFromBackup(previousCsvText);
        res.status(404).json({ message: `Labubu with SKU ${sku} not found.` });
      }
    } catch (error) {
      await restoreCsvFromBackup(previousCsvText);
      throw error;
    }
  } catch (error: any) {
    console.error(`Error in PUT /admin-api/labubus/${req.params.sku}:`, error);
    res.status(500).json({ message: 'Error updating labubu', error: error.message });
  }
});

// Delete a labubu
router.delete('/labubus/:sku', async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;
    const { previousCsvText } = await removeLabubuFromCsv(sku);
    try {
      const rowsAffected = await labubuRepository.delete({ filter: { sku } });

      if (rowsAffected > 0) {
        res.json({ message: `Labubu with SKU ${sku} deleted successfully.` });
      } else {
        await restoreCsvFromBackup(previousCsvText);
        res.status(404).json({ message: `Labubu with SKU ${sku} not found.` });
      }
    } catch (error) {
      await restoreCsvFromBackup(previousCsvText);
      throw error;
    }
  } catch (error: any) {
    console.error(`Error in DELETE /admin-api/labubus/${req.params.sku}:`, error);
    res.status(500).json({ message: 'Error deleting labubu', error: error.message });
  }
});

// Upload CSV for catalog replacement
router.post('/labubus/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const csvData = fs.readFileSync(req.file.path, 'utf8');
    const results = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(), // Explicitly type header
    });

    const parsedLabubus: Partial<Labubu>[] = results.data.map((row: any) => ({
      sku: row.sku,
      name: row.name,
      series: row.series,
      rarity: row.rarity as Rarity,
      description: row.description || undefined,
      msrp: row.msrp ? parseFloat(row.msrp) : undefined,
      variant: row.variant || undefined,
      stockStatus: row.stockStatus as StockStatus || undefined,
      kicksdevId: row.kicksdevId || undefined,
      ebaySearchOverride: row.ebaySearchOverride || undefined,
    }));

    for (const labubu of parsedLabubus) {
      const validationResult = adminLabubuSchema.safeParse(labubu);
      if (!validationResult.success) {
        fs.unlinkSync(req.file.path);
        const zodError = validationResult.error as z.ZodError; // Explicitly cast
        return res.status(400).json({
          message: `CSV validation failed for SKU: ${labubu.sku}`,
          errors: zodError.issues.map((err: z.ZodIssue) => ({ path: err.path.join('.'), message: err.message })),
        });
      }
    }

    const { previousCsvText } = await replaceCsvWithLabubus(parsedLabubus);

    try {
      await labubuRepository.clearAll();
      for (const labubu of parsedLabubus) {
        await labubuRepository.create(labubu as Labubu);
      }

      fs.unlinkSync(req.file.path);
      res.json({ message: 'CSV processed successfully, catalog replaced.', processed: parsedLabubus.length });
    } catch (error) {
      await restoreCsvFromBackup(previousCsvText);
      throw error;
    }

  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error in POST /admin-api/labubus/upload:', error);
    res.status(500).json({ message: 'Error processing CSV upload', error: error.message });
  }
});

// --- Image management ---
router.get('/images', (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(publicImagesPath);
    res.json({ images: files });
  } catch (error: any) {
    console.error('Error listing images:', error);
    res.status(500).json({ message: 'Error listing images', error: error.message });
  }
});

router.post('/images', imageUpload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded.' });
    }

    const targetName = path.basename((req.body.filename as string) || req.file.originalname);
    const targetPath = path.join(publicImagesPath, targetName);

    fs.mkdirSync(publicImagesPath, { recursive: true });

    try {
      fs.renameSync(req.file.path, targetPath);
    } catch (error) {
      fs.unlinkSync(req.file.path);
      throw error;
    }

    res.status(201).json({ message: 'Image saved successfully', filename: targetName });
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

router.delete('/images/:filename', (req: Request, res: Response) => {
  try {
    const filename = path.basename(req.params.filename);
    const targetPath = path.join(publicImagesPath, filename);

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ message: `Image ${filename} not found.` });
    }

    fs.unlinkSync(targetPath);
    res.json({ message: `Image ${filename} deleted successfully.` });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
});


export default router;