import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { Database } from "sqlite3";

const dataDir = process.env.RENDER_DATA_DIR || path.resolve(process.cwd(), "data");
const dbPath = path.join(dataDir, "app.db");
const dbDir = path.dirname(dbPath);
console.log(`DATABASE: Database path: ${dbPath}`);

// Create the directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

async function initializeDatabase(): Promise<Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("DATABASE: Error connecting to database", err.message);
        return reject(err);
      } else {
        console.log("DATABASE: Database connected");
      }
    });

    db.serialize(() => {
      console.log("DATABASE: Initializing database schema...");
      // Create the variants table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS variants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sku TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          series TEXT NOT NULL,
          description TEXT,
          rarity TEXT,
          msrp REAL,
          lowestPrice REAL,
          ebayLowestPrice REAL,
          stockxLastRefreshed TEXT,
          ebayLastRefreshed TEXT,
          estimatedValue REAL,
          estimatedValueLastCalculated TEXT,
          priceChange24h REAL,
          stockStatus TEXT,
          kicksdevId TEXT,
          stockxPrice REAL,
          ebaySearchOverride TEXT,
          priceRange TEXT -- new column to store JSON string of min/max prices
        )
      `,
        (err) => {
          if (err) {
            console.error("DATABASE: Error creating variants table", err.message);
            return reject(err);
          } else {
            console.log("DATABASE: variants table created or already exists.");
          }
        }
      );

      // Create index on sku in variants table
      db.run(
        `CREATE INDEX IF NOT EXISTS idx_variants_sku ON variants (sku)`,
        (err) => {
          if (err) {
            console.error("DATABASE: Error creating index on variants(sku)", err.message);
            return reject(err);
          } else {
            console.log("DATABASE: Index on variants(sku) created or already exists.");
          }
        }
      );

      // Add ebaySearchOverride column if it doesn't exist
      db.run(
        `ALTER TABLE variants ADD COLUMN ebaySearchOverride TEXT`,
        (err) => {
          if (err && !err.message.includes("duplicate column name")) {
            console.error("DATABASE: Error adding ebaySearchOverride column to variants table", err.message);
            return reject(err);
          }
        }
      );

      // Create the listings table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS listings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          productUrl TEXT UNIQUE NOT NULL,
          labubuSku TEXT NOT NULL,
          vendorName TEXT NOT NULL,
          listingTitle TEXT NOT NULL,
          currentPrice REAL,
          inStock BOOLEAN DEFAULT true,
          lastCheckedAt TEXT,
          FOREIGN KEY (labubuSku) REFERENCES variants (sku)
        )
      `,
        (err) => {
          if (err) {
            console.error("DATABASE: Error creating listings table", err.message);
            return reject(err);
          } else {
            console.log("DATABASE: listings table created or already exists.");
          }
        }
      );

      // Create index on labubuSku in listings table
      db.run(
        `CREATE INDEX IF NOT EXISTS idx_listings_variantSku ON listings (labubuSku)`,
        (err) => {
          if (err) {
            console.error("DATABASE: Error creating index on listings(labubuSku)", err.message);
            return reject(err);
          } else {
            console.log("DATABASE: Index on listings(labubuSku) created or already exists.");
          }
        }
      );

      // Create the price_history table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS price_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          listingId INTEGER NOT NULL,
          price REAL,
          date TEXT NOT NULL,
          FOREIGN KEY (listingId) REFERENCES listings (id)
        )
      `,
        (err) => {
          if (err) {
            console.error("DATABASE: Error creating price_history table", err.message);
            return reject(err);
          } else {
            console.log("DATABASE: price_history table created or already exists.");
          }
        }
      );

      // Create index on listingId in price_history table
      db.run(
        `CREATE INDEX IF NOT EXISTS idx_price_history_listingId ON price_history (listingId)`,
        (err) => {
          if (err) {
            console.error("DATABASE: Error creating index on price_history(listingId)", err.message);
            return reject(err);
          } else {
            console.log("DATABASE: Index on price_history(listingId) created or already exists.");
          }
        }
      );

      // Create the characters table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS characters (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          imageUrl TEXT,
          variantIds TEXT, -- Stored as JSON string of string array
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          metadata TEXT -- Stored as JSON string
        )
      `,
        (err) => {
          if (err) {
            console.error("DATABASE: Error creating characters table", err.message);
            return reject(err);
          } else {
            console.log("DATABASE: characters table created or already exists.");
          }
        }
      );

      // Create the sets table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS sets (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          imageUrl TEXT,
          characterIds TEXT, -- Stored as JSON string of string array
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          metadata TEXT -- Stored as JSON string
        )
      `,
        (err) => {
          if (err) {
            console.error("DATABASE: Error creating sets table", err.message);
            return reject(err);
          } else {
            console.log("DATABASE: sets table created or already exists.");
          }
        }
      );

      // Create the collections table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS collections (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          imageUrl TEXT,
          variantIds TEXT, -- Stored as JSON string of string array
          type TEXT NOT NULL, -- e.g., 'collection', 'category'
          status TEXT NOT NULL, -- e.g., 'published', 'draft'
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          metadata TEXT -- Stored as JSON string
        )
      `,
        (err) => {
          if (err) {
            console.error("DATABASE: Error creating collections table", err.message);
            return reject(err);
          } else {
            console.log("DATABASE: collections table created or already exists.");
          }
        }
      );

      // Create the site_config table (singleton)
      db.run(
        `
        CREATE TABLE IF NOT EXISTS site_config (
          id TEXT PRIMARY KEY,
          siteTitle TEXT NOT NULL,
          siteDescription TEXT,
          logoUrl TEXT,
          faviconUrl TEXT,
          apiBaseUrl TEXT,
          contactEmail TEXT,
          socialMediaLinks TEXT, -- Stored as JSON string
          featureFlags TEXT, -- Stored as JSON string
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          metadata TEXT -- Stored as JSON string
        )
      `,
        (err) => {
          if (err) {
            console.error("DATABASE: Error creating site_config table", err.message);
            return reject(err);
          } else {
            console.log("DATABASE: site_config table created or already exists.");
          }
        }
      );

      // Create the search_settings table (singleton)
      db.run(
        `
        CREATE TABLE IF NOT EXISTS search_settings (
          id TEXT PRIMARY KEY,
          enabledFilters TEXT, -- Stored as JSON string of string array
          defaultSortBy TEXT,
          autocompleteEnabled BOOLEAN,
          autocompleteMinChars INTEGER,
          facets TEXT, -- Stored as JSON string of Facet array
          boostedFields TEXT, -- Stored as JSON string of object
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          metadata TEXT -- Stored as JSON string
        )
      `,
        (err) => {
          if (err) {
            console.error("DATABASE: Error creating search_settings table", err.message);
            return reject(err);
          } else {
            console.log("DATABASE: search_settings table created or already exists.");
          }
          resolve(db); // Resolve the promise once all schema operations are done
        }
      );
    });
  });
}

//============================================================================================================================================================================================
// Default export
//============================================================================================================================================================================================

export default initializeDatabase();
