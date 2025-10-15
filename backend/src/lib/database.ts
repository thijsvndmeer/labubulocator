import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

//============================================================================================================================================================================================
// Setup
//============================================================================================================================================================================================

const dbPath = path.resolve(__dirname, '..', 'data', 'app.db');
const dbDir = path.dirname(dbPath);

// Create the directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database', err.message);
  } else {
    console.log('Database connected');
  }
});

//============================================================================================================================================================================================
// SCHEMA
//============================================================================================================================================================================================

db.serialize(() => {
  // Create the labubus table
  db.run(`
    CREATE TABLE IF NOT EXISTS labubus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      series TEXT NOT NULL,
      description TEXT,
      rarity TEXT,
      image TEXT,
      msrp REAL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating labubus table', err.message);
    }
  });

  // Create the listings table
  db.run(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      labubu_id INTEGER NOT NULL,
      vendor_name TEXT NOT NULL,
      product_url TEXT UNIQUE NOT NULL,
      listing_title TEXT NOT NULL,
      last_checked_at TEXT,
      in_stock INTEGER DEFAULT 1,
      FOREIGN KEY (labubu_id) REFERENCES labubus (id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating listings table', err.message);
    }
  });

  // Create the price_history table
  db.run(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      price REAL,
      date TEXT NOT NULL,
      FOREIGN KEY (listing_id) REFERENCES listings (id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating price_history table', err.message);
    }
  });
});

//============================================================================================================================================================================================
// Default export
//============================================================================================================================================================================================

export default db;