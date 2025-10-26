import { Database } from "sqlite3";

export const up = (db: Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.exec(
      `
      PRAGMA foreign_keys = OFF;

      CREATE TABLE IF NOT EXISTS labubus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE NOT NULL CHECK(sku <> ''),
        name TEXT NOT NULL CHECK(name <> ''),
        series TEXT NOT NULL CHECK(series <> ''),
        description TEXT,
        rarity TEXT,
        image TEXT,
        msrp REAL,
        lowestPrice REAL,
        ebayLowestPrice REAL,
        stockxLastRefreshed TEXT,
        ebayLastRefreshed TEXT,
        estimatedValue REAL,
        estimatedValueLastCalculated TEXT,
        priceChange24h REAL,
        priceRange TEXT,
        stockStatus TEXT,
        kicksdevId TEXT,
        stockxPrice REAL
      );

      CREATE INDEX IF NOT EXISTS idx_labubus_sku ON labubus (sku);

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
      );

      CREATE INDEX IF NOT EXISTS idx_listings_labubuSku ON listings (labubuSku);

      CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listingId INTEGER NOT NULL,
        price REAL,
        date TEXT NOT NULL,
        FOREIGN KEY (listingId) REFERENCES listings (id)
      );

      CREATE INDEX IF NOT EXISTS idx_price_history_listingId ON price_history (listingId);

      CREATE TABLE IF NOT EXISTS estimated_value_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        labubuSku TEXT NOT NULL,
        estimatedValue REAL NOT NULL,
        date TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_estimated_value_history_labubuSku ON estimated_value_history (labubuSku);

      PRAGMA foreign_keys = ON;
      `,
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

export const down = (db: Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.exec(
      `
      PRAGMA foreign_keys = OFF;
      DROP TABLE IF EXISTS labubus;
      DROP TABLE IF EXISTS listings;
      DROP TABLE IF EXISTS price_history;
      DROP TABLE IF EXISTS estimated_value_history;
      PRAGMA foreign_keys = ON;
      `,
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};
