require('module-alias/register');
import 'dotenv/config';
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import labubuRoutes from "./routes/labubus";
import listingRoutes from "./routes/listings";
import { LabubuRepository } from "./repositories/labubuRepository";
import { ListingRepository } from "./repositories/listingRepository";
import { PriceHistoryRepository } from "./repositories/priceHistoryRepository";
import { UserRepository } from "./repositories/userRepository";
import { RoleRepository } from "./repositories/roleRepository";
import { ContentRepository } from "./repositories/contentRepository";
import { NavigationRepository } from "./repositories/navigationRepository";
import { SettingsRepository } from "./repositories/settingsRepository";
import db from "./lib/database";
import { syncLabubus } from "./services/labubuSyncService";
import { startApiSync } from "./services/scheduler";
import { UserService } from "./services/userService";
import { RoleService } from "./services/roleService";
import { ContentService } from "./services/contentService";
import { NavigationService } from "./services/navigationService";
import { SettingsService } from "./services/settingsService";
import fs from 'fs';
import path from 'path';
import adminLabubuRoutes from './routes/adminLabubus';
import cors from 'cors'; // Import cors

const app = express();
app.set('trust proxy', true);
console.log("APP: Starting up...");
app.set("query parser", "extended");
const port = process.env.PORT || 3001;

//============================================================================================================================================================================================
// Database
//============================================================================================================================================================================================

export const labubuRepository = new LabubuRepository(db);
export const listingRepository = new ListingRepository(db);
export const priceHistoryRepository = new PriceHistoryRepository(db);
export const userRepository = new UserRepository(db);
export const roleRepository = new RoleRepository(db);
export const contentRepository = new ContentRepository(db);
export const navigationRepository = new NavigationRepository(db);
export const settingsRepository = new SettingsRepository(db);

//============================================================================================================================================================================================
// Services
//============================================================================================================================================================================================

export const userService = new UserService(userRepository);
export const roleService = new RoleService(roleRepository);
export const contentService = new ContentService(contentRepository);
export const navigationService = new NavigationService(navigationRepository);
export const settingsService = new SettingsService(settingsRepository);

(async () => {
  await syncLabubus();
  startApiSync();
})();

//============================================================================================================================================================================================
// Middleware
//============================================================================================================================================================================================

// Helper function to find image recursively
const findImageRecursively = (filename: string, currentDir: string): string | null => {
  const files = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(currentDir, file.name);
    if (file.isDirectory()) {
      const foundPath = findImageRecursively(filename, fullPath);
      if (foundPath) {
        return foundPath;
      }
    } else if (file.isFile() && file.name === filename) {
      return fullPath;
    }
  }
  return null;
};

<<<<<<< HEAD
app.use(bodyParser.json());
app.use((req, res, next) => {
  const allowedOrigins = ["https://labubulocator.me","http://localhost:4173"];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  next();
});
=======
app.use(express.json()); // Add this line to parse JSON request bodies

// CORS Configuration
const allowedOrigins = ["https://labubulocator.me"];
const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      localhostOriginPattern.test(origin)
    ) {
      return callback(null, true);
    }

    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, x-admin-token", // Allow x-admin-token header
  credentials: true, // Allow cookies to be sent
}));
>>>>>>> ff1567965961f00da574fed1b25c29819849ee56

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  next();
});

// Custom middleware to handle flattened image URLs
app.use("/images/:filename", (req, res, next) => {
  const requestedFilename = req.params.filename;
  const publicImagesPath = path.join(__dirname, '..', 'public', 'images');

  const foundImagePath = findImageRecursively(requestedFilename, publicImagesPath);
  if (foundImagePath) {
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    res.sendFile(foundImagePath);
  } else {
    next(); // File not found, pass to next middleware (e.g., 404 handler)
  }
});

//============================================================================================================================================================================================
// Routing
//============================================================================================================================================================================================

import adminRoutes from "./routes/admin";
import { authMiddleware } from "./middleware/auth";

app.use("/api/labubus", labubuRoutes);
app.use("/api/listings", listingRoutes);

<<<<<<< HEAD
app.use("/api/admin", authMiddleware, adminRoutes);
=======
const allowAdminApi = Boolean(process.env.ADMIN_SECRET_TOKEN);

if (allowAdminApi) {
  app.use("/admin-api", adminLabubuRoutes); // Mount new admin API routes
} else {
  console.warn("Admin API disabled: set ADMIN_SECRET_TOKEN to enable.");
}
>>>>>>> ff1567965961f00da574fed1b25c29819849ee56

//============================================================================================================================================================================================
// Start the server
//============================================================================================================================================================================================

// A simple root endpoint to confirm the server is running
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from the Labubu Locator backend!");
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});


// const interval = 0.1 * 60 * 1000 // 15 minutes
// setInterval(() => {
//   // TODO - replace this with a real price
//   const priceEntry: PriceEntry = { price: Math.random() * 100, date: new Date() }
//   labubuPriceService.addPrice('test', priceEntry)
//   console.log('Added price entry:', priceEntry)
// }, interval)
