import 'dotenv/config';
import express, { Request, Response } from "express";
import cors from "cors";
import labubuRoutes from "./routes/labubus";
import listingRoutes from "./routes/listings";
import { LabubuRepository } from "./repositories/labubuRepository";
import { ListingRepository } from "./repositories/listingRepository";
import { PriceHistoryRepository } from "./repositories/priceHistoryRepository";
import { EstimatedValueHistoryRepository } from "./repositories/estimatedValueHistoryRepository";
import db from "./lib/database";
import { up as migrateUp } from "./migrations/1_initial_schema";
import { syncLabubus } from "./services/labubuSyncService";
import { startApiSync } from "./services/scheduler";

const app = express();
app.use(cors());
app.use("/api", labubuRoutes);
app.use("/api", listingRoutes);
const port = process.env.PORT || 3001;

// Run migrations
migrateUp(db).then(() => {
  console.log("Database migrations completed.");
  syncLabubus();
  startApiSync();
}).catch((err) => {
  console.error("Database migration failed:", err);
});

export const labubuRepository = new LabubuRepository(db);
export const listingRepository = new ListingRepository(db);
export const priceHistoryRepository = new PriceHistoryRepository(db);
export const estimatedValueHistoryRepository = new EstimatedValueHistoryRepository(db);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
