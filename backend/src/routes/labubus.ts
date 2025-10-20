import { Router } from "express";
import { labubuRepository, listingRepository } from "../index";
import {
  HttpOptions,
  Labubu,
  labubuSchema,
  Listing,
  listingSchema,
  makeHttpOptionsSchema,
} from "@labubu/common/src/types/labubu";
import crypto from "crypto";

const router = Router();
const labubuHttpOptionsSchema = makeHttpOptionsSchema(labubuSchema);

const cache = new Map<string, { etag: string; data: any }>();

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

    const cacheKey = JSON.stringify(options);
    const cached = cache.get(cacheKey);

    if (cached && req.headers["if-none-match"] === cached.etag) {
      res.status(304).send();
      return;
    }

    const result = await labubuRepository.get(options, options.fields);
    const etag = crypto.createHash("md5").update(JSON.stringify(result)).digest("hex");

    cache.set(cacheKey, { etag, data: result });

    res.setHeader("ETag", etag);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching labubus.", details: err });
  }
});

router.get("/:sku/", async (req, res) => {
  try {
    const result = await labubuRepository.get({ filter: { sku: req.params.sku }, ranges: undefined, order: undefined, limit: undefined, offset: undefined });
    if (result.length > 0) {
      res.status(200).json(result[0]);
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