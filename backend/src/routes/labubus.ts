import { Router } from "express";
import { labubuRepository } from "../index";
import { HttpOptions, Labubu, labubuSchema, makeHttpOptionsSchema } from "@labubu/common/src/types/labubu";
import { getStockxData } from "../services/stockxService";

const router = Router();
const labubuHttpOptionsSchema = makeHttpOptionsSchema(labubuSchema);

//============================================================================================================================================================================================
// Get requests
//============================================================================================================================================================================================

router.get("/", async (req, res) => {
  try {
    let options;
    try {
      options = labubuHttpOptionsSchema.parse(req.query) as HttpOptions<Labubu>;
    } catch (err) {
      res.status(400).json({ error: "Invalid query parameters.", details: err });
      return;
    }

    const result = await labubuRepository.get(options, options.fields);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching labubus.", details: err });
  }
});

router.get("/:sku/", async (req, res) => {
  try {
    const result = await labubuRepository.get({ filter: { sku: req.params.sku } });
    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ error: `Labubu with sku "${req.params.sku}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the labubu.", details: err });
  }
});

router.get("/scrape/:sku", async (req, res) => {
  try {
    const result = await labubuRepository.get({ filter: { sku: req.params.sku } });
    if (result.length > 0) {
      const labubu = result[0];
      if (labubu.stockxUrl) {
        const stockxData = await getStockxData(labubu.stockxUrl);
        if (stockxData) {
          res.status(200).json(stockxData);
        } else {
          res.status(500).json({ error: "Failed to scrape StockX data." });
        }
      } else {
        res.status(404).json({ error: `Labubu with sku "${req.params.sku}" does not have a StockX URL.` });
      }
    } else {
      res.status(404).json({ error: `Labubu with sku "${req.params.sku}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the labubu.", details: err });
  }
});

//============================================================================================================================================================================================
// Default export
//============================================================================================================================================================================================

export default router;