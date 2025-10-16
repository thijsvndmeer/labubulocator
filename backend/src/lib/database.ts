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
      image TEXT,
      msrp REAL,
      lowestPrice REAL
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating labubus table", err.message);
      }
    }
  );

  // Create the listings table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      labubuId INTEGER NOT NULL,
      vendorName TEXT NOT NULL,
      productUrl TEXT UNIQUE NOT NULL,
      listingTitle TEXT NOT NULL,
      currentPrice REAL,
      inStock INTEGER DEFAULT 1,
      lastCheckedAt TEXT,

      FOREIGN KEY (labubuId) REFERENCES labubus (id)
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating listings table", err.message);
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
});

//============================================================================================================================================================================================
// Default export
//============================================================================================================================================================================================

export default db;
