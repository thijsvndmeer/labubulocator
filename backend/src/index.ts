console.log("--- START OF INDEX.TS ---");
// import 'dotenv/config';
import express, { Request, Response } from "express";
import variantsRoutes from "./routes/variants";
import listingRoutes from "./routes/listings";
import charactersRoutes from "./routes/characters";
import setsRoutes from "./routes/sets";
import collectionsRoutes from "./routes/collections";
import siteConfigRoutes from "./routes/siteConfig";
import searchSettingsRoutes from "./routes/searchSettings";
import { VariantRepository } from "./repositories/variantRepository";
import { VariantService } from "./services/variantService";
import { ListingRepository } from "./repositories/listingRepository";
import { PriceHistoryRepository } from "./repositories/priceHistoryRepository";
import { CharacterRepository } from "./repositories/characterRepository";
import { CharacterService } from "./services/characterService";
import { SetRepository } from "./repositories/setRepository";
import { SetService } from "./services/setService";
import { CollectionRepository } from "./repositories/collectionRepository";
import { CollectionService } from "./services/collectionService";
import { SiteConfigRepository } from "./repositories/siteConfigRepository";
import { SiteConfigService } from "./services/siteConfigService";
import { SearchSettingsRepository } from "./repositories/searchSettingsRepository";
import { SearchSettingsService } from "./services/searchSettingsService";
import initializeDatabase from "./lib/database"; // Changed import
import { syncVariants } from "./services/variantSyncService";
import { startApiSync } from "./services/scheduler";
import fs from 'fs';
import path from 'path';
import { Database } from "sqlite3";

const app = express();
console.log("APP: Starting up...");
app.set("query parser", "extended");
const port = process.env.PORT || 3001;

export let variantRepository: VariantRepository;
export let variantService: VariantService;
export let listingRepository: ListingRepository;
export let priceHistoryRepository: PriceHistoryRepository;
export let characterRepository: CharacterRepository;
export let characterService: CharacterService;
export let setRepository: SetRepository;
export let setService: SetService;
export let collectionRepository: CollectionRepository;
export let collectionService: CollectionService;
export let siteConfigRepository: SiteConfigRepository;
export let siteConfigService: SiteConfigService;
export let searchSettingsRepository: SearchSettingsRepository;
export let searchSettingsService: SearchSettingsService;

(async () => {
  let db: Database;
  try {
    console.log("APP: Initializing database...");
    db = await initializeDatabase; // Await database initialization
    console.log("APP: Database initialized.");

    //============================================================================================================================================================================================
    // Repositories and Services (instantiated after DB is ready)
    //============================================================================================================================================================================================

    variantRepository = new VariantRepository(db);
    variantService = new VariantService(db);
    listingRepository = new ListingRepository(db);
    priceHistoryRepository = new PriceHistoryRepository(db);
    characterRepository = new CharacterRepository(db);
    characterService = new CharacterService(db);
    setRepository = new SetRepository(db);
    setService = new SetService(db);
    collectionRepository = new CollectionRepository(db);
    collectionService = new CollectionService(db);
    siteConfigRepository = new SiteConfigRepository(db);
    siteConfigService = new SiteConfigService(db);
    searchSettingsRepository = new SearchSettingsRepository(db);
    searchSettingsService = new SearchSettingsService(db);

    // Make repositories and services available via routes and other services


    await syncVariants(); // Run initial sync
    startApiSync();

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

    app.use((req, res, next) => {
      const allowedOrigins = ["https://labubulocator.me","http://localhost:4173"];
      const origin = req.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
      next();
    });

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

    app.use("/api/variants", variantsRoutes);

    app.use("/api/listings", listingRoutes);
    app.use("/api/characters", charactersRoutes);
    app.use("/api/sets", setsRoutes);
    app.use("/api/collections", collectionsRoutes);
    app.use("/api/site-config", siteConfigRoutes);
    app.use("/api/search-settings", searchSettingsRoutes);

    //============================================================================================================================================================================================
    // Start the server
    //============================================================================================================================================================================================

    // A simple root endpoint to confirm the server is running
    app.get("/", (req: Request, res: Response) => {
      res.send("Hello from the Labubu Locator backend!");
    });

    console.log("Attempting to start server...");
    const server = app.listen(port, () => {
      console.log(`Backend server is running at http://localhost:${port}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`ERROR: Port ${port} is already in use.`);
      } else {
        console.error("ERROR: Server startup failed:", error);
      }
      process.exit(1); // Exit with an error code
    });

  } catch (error) {
    console.error("Error during application startup:", error);
    process.exit(1); // Exit with an error code
  }
})();
console.log("End of script reached.");

// Global unhandled promise rejection and uncaught exception handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('ERROR: Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('ERROR: Uncaught Exception:', error);
  // Application specific logging, throwing an error, or other logic here
  process.exit(1);
});