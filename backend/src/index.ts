import 'dotenv/config';
import express, { Request, Response } from "express";
import labubuRoutes from "./routes/labubus";
import listingRoutes from "./routes/listings";
import { LabubuRepository } from "./repositories/labubuRepository";
import { ListingRepository } from "./repositories/listingRepository";
import { PriceHistoryRepository } from "./repositories/priceHistoryRepository";
import db from "./lib/database";
import { syncLabubus } from "./services/labubuSyncService";
import { syncLabubuValues } from "./services/kicksDevSyncService";

const app = express();
app.set("query parser", "extended");
const port = 3001;

//============================================================================================================================================================================================
// Database
//============================================================================================================================================================================================

export const labubuRepository = new LabubuRepository(db);
export const listingRepository = new ListingRepository(db);
export const priceHistoryRepository = new PriceHistoryRepository(db);

syncLabubus();
syncLabubuValues();

//============================================================================================================================================================================================
// Middleware
//============================================================================================================================================================================================



app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:4173", "https://id-preview--f24f2b88-4446-4219-a252-e77251f3c13d.lovable.app/"];
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

app.use("/images", (req, res, next) => {
  res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
  next();
});

app.use("/images", express.static("public/images"));

//============================================================================================================================================================================================
// Routing
//============================================================================================================================================================================================

app.use("/api/labubus", labubuRoutes);

app.use("/api/listings", listingRoutes);

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
