import express, { Request, Response } from "express";
import labubuRoutes from "./routes/labubu";
import * as labubuPriceService from "./services/labubuPriceService";
import { PriceEntry } from "@common/types/labubu";

const app = express();
const port = 3001;

//============================================================================================================================================================================================
// Middleware
//============================================================================================================================================================================================

app.use((req, res, next) => {
  // Allow requests from the frontend
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4000/");
  next();
});

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  next();
});

//============================================================================================================================================================================================
// Routing
//============================================================================================================================================================================================

app.use("/api/labubus", labubuRoutes);

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
