import { Pool } from 'pg';
import 'dotenv/config';

console.log('DATABASE: Initializing PostgreSQL connection pool...');

// Fly.io injects the DATABASE_URL environment variable
// https://fly.io/docs/postgres/connecting/connecting-with-fly-proxy/
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('DATABASE: Client connected to PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('DATABASE: Unexpected error on idle client', err);
  process.exit(-1);
});

const initializeSchema = async () => {
  console.log("DATABASE: Initializing PostgreSQL schema...");
  const client = await pool.connect();
  try {
    // In PostgreSQL, we use SERIAL for auto-incrementing primary keys,
    // NUMERIC for prices, and TIMESTAMPTZ for timezone-aware timestamps.
    await client.query(`
      CREATE TABLE IF NOT EXISTS labubus (
        id SERIAL PRIMARY KEY,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        series TEXT NOT NULL,
        description TEXT,
        rarity TEXT,
        msrp NUMERIC,
        lowestPrice NUMERIC,
        ebayLowestPrice NUMERIC,
        stockxLastRefreshed TIMESTAMPTZ,
        ebayLastRefreshed TIMESTAMPTZ,
        estimatedValue NUMERIC,
        estimatedValueLastCalculated TIMESTAMPTZ,
        priceChange24h NUMERIC,
        stockStatus TEXT,
        kicksdevId TEXT,
        stockxPrice NUMERIC,
        ebaySearchOverride TEXT
      );
    `);
    console.log("DATABASE: 'labubus' table created or already exists.");

    await client.query(`CREATE INDEX IF NOT EXISTS idx_labubus_sku ON labubus (sku);`);
    console.log("DATABASE: Index on labubus(sku) created or already exists.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        productUrl TEXT UNIQUE NOT NULL,
        labubuSku TEXT NOT NULL,
        vendorName TEXT NOT NULL,
        listingTitle TEXT NOT NULL,
        currentPrice NUMERIC,
        inStock BOOLEAN DEFAULT true,
        lastCheckedAt TIMESTAMPTZ,
        FOREIGN KEY (labubuSku) REFERENCES labubus (sku)
      );
    `);
    console.log("DATABASE: 'listings' table created or already exists.");

    await client.query(`CREATE INDEX IF NOT EXISTS idx_listings_labubuSku ON listings (labubuSku);`);
    console.log("DATABASE: Index on listings(labubuSku) created or already exists.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS price_history (
        id SERIAL PRIMARY KEY,
        listingId INTEGER NOT NULL,
        price NUMERIC,
        date TIMESTAMPTZ NOT NULL,
        FOREIGN KEY (listingId) REFERENCES listings (id)
      );
    `);
    console.log("DATABASE: 'price_history' table created or already exists.");

    await client.query(`CREATE INDEX IF NOT EXISTS idx_price_history_listingId ON price_history (listingId);`);
    console.log("DATABASE: Index on price_history(listingId) created or already exists.");

  } catch (err) {
    if (err instanceof Error) {
        console.error("DATABASE: Error initializing schema", err.stack);
    } else {
        console.error("DATABASE: An unknown error occurred during schema initialization", err);
    }
    // If schema initialization fails, we probably want to exit.
    process.exit(1);
  } finally {
    client.release();
  }
};

// Initialize the schema on startup
initializeSchema().catch(err => {
    console.error("DATABASE: Failed to initialize database schema.", err);
    process.exit(1);
});

// The existing repositories are written for the 'sqlite3' package's API,
// which uses callbacks. The 'pg' package uses Promises.
// We create a small adapter object that mimics the 'sqlite3' API
// so we don't have to rewrite all the repository files.
const dbAdapter = {
  // Convert 'all' to use the pool
  all: (sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void) => {
    pool.query(sql, params)
      .then(res => callback(null, res.rows))
      .catch(err => callback(err, []));
  },
  // Convert 'get' to use the pool
  get: (sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
    pool.query(sql, params)
      .then(res => callback(null, res.rows[0]))
      .catch(err => callback(err, undefined));
  },
  // Convert 'run' to use the pool
  run: (sql: string, params: any[], callback: (this: { lastID: number }, err: Error | null) => void) => {
    // The 'run' method in sqlite can return the lastID, but it's more complex with pg.
    // We'll check if the query is an INSERT and returns the id.
    // This is a simplification and might need adjustment if the app uses `lastID`.
    // For now, we assume it's mainly for INSERT/UPDATE/DELETE without needing the return value.
    pool.query(sql, params)
      .then(res => {
        // A basic attempt to simulate `lastID` for INSERT statements
        const lastID = (res.command === 'INSERT' && res.rows.length > 0) ? res.rows[0].id : 0;
        callback.call({ lastID }, null);
      })
      .catch(err => callback.call({ lastID: 0 }, err));
  },
  // serialize is used to run queries in sequence. With a connection pool, this is less of an issue,
  // but we'll provide a no-op function to avoid breaking the existing code structure.
  serialize: (callback: () => void) => {
    callback();
  }
};

export default dbAdapter;