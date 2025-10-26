import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

//============================================================================================================================================================================================
// Setup
//============================================================================================================================================================================================

const dbPath = path.resolve("src", "data", "app.db");
const dbDir = path.dirname(dbPath);

// Create the directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database", err.message);
  } else {
    console.log("Database connected");
  }
});

//============================================================================================================================================================================================
// SCHEMA
//============================================================================================================================================================================================

db.serialize(() => {
  // Create the labubus table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS labubus (
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
      priceChange24h REAL
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating labubus table", err.message);
      }
    }
  );

  // Create index on sku in labubus table
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_labubus_sku ON labubus (sku)`,
    (err) => {
      if (err) {
        console.error("Error creating index on labubus(sku)", err.message);
      }
    }
  );

  // Add stockxLastRefreshed column if it doesn't exist
  db.run(
    `ALTER TABLE labubus ADD COLUMN stockxLastRefreshed TEXT`,
    (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("Error adding stockxLastRefreshed column to labubus table", err.message);
      }
    }
  );

  // Add ebayLastRefreshed column if it doesn't exist
  db.run(
    `ALTER TABLE labubus ADD COLUMN ebayLastRefreshed TEXT`,
    (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("Error adding ebayLastRefreshed column to labubus table", err.message);
      }
    }
  );

  // Remove lastRefreshed column if it exists (optional, for cleanup)
  // Note: SQLite does not support dropping columns directly. This would require a more complex migration.
  // For simplicity, we'll just stop using it and add the new columns.

  // Add ebayLowestPrice column if it doesn't exist
  db.run(
    `ALTER TABLE labubus ADD COLUMN ebayLowestPrice REAL`,
    (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("Error adding ebayLowestPrice column to labubus table", err.message);
      }
    }
  );

  // Add stockStatus column if it doesn't exist
  db.run(
    `ALTER TABLE labubus ADD COLUMN stockStatus TEXT`,
    (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("Error adding stockStatus column to labubus table", err.message);
      }
    }
  );

  // Add kicksdevId column if it doesn't exist
  db.run(
    `ALTER TABLE labubus ADD COLUMN kicksdevId TEXT`,
    (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("Error adding kicksdevId column to labubus table", err.message);
      }
    }
  );

  // Add stockxPrice column if it doesn't exist
  db.run(
    `ALTER TABLE labubus ADD COLUMN stockxPrice REAL`,
    (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("Error adding stockxPrice column to labubus table", err.message);
      }
    }
  );

  // Add estimatedValue column if it doesn't exist
  db.run(
    `ALTER TABLE labubus ADD COLUMN estimatedValue REAL`,
    (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("Error adding estimatedValue column to labubus table", err.message);
      }
    }
  );

  // Add estimatedValueLastCalculated column if it doesn't exist
  db.run(
    `ALTER TABLE labubus ADD COLUMN estimatedValueLastCalculated TEXT`,
    (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("Error adding estimatedValueLastCalculated column to labubus table", err.message);
      }
    }
  );

  // Add priceChange24h column if it doesn't exist
  db.run(
    `ALTER TABLE labubus ADD COLUMN priceChange24h REAL`,
    (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("Error adding priceChange24h column to labubus table", err.message);
      }
    }
  );

  // Create the listings table

  // Add stockStatus column if it doesn't exist
  db.run(
    `ALTER TABLE labubus ADD COLUMN stockStatus TEXT`,
    (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("Error adding stockStatus column to labubus table", err.message);
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
      inStock INTEGER DEFAULT 1,
      lastCheckedAt TEXT,

      FOREIGN KEY (labubuSku) REFERENCES labubus (sku)
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating listings table", err.message);
      }
    }
  );

  // Create index on labubuSku in listings table
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_listings_labubuSku ON listings (labubuSku)`,
    (err) => {
      if (err) {
        console.error("Error creating index on listings(labubuSku)", err.message);
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
        console.error("Error creating price_history table", err.message);
      }
    }
  );

  // Create index on listingId in price_history table
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_price_history_listingId ON price_history (listingId)`,
    (err) => {
      if (err) {
        console.error("Error creating index on price_history(listingId)", err.message);
      }
    }
  );
});

//============================================================================================================================================================================================
// Default export
//============================================================================================================================================================================================

export default db;
