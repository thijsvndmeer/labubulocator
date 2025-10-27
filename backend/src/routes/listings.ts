import { Router } from "express";
import { listingRepository, priceHistoryRepository } from "../index";
import { HttpOptions, Listing, listingSchema, makeHttpOptionsSchema } from "@labubu/common";

const router = Router();
const listingHttpOptionsSchema = makeHttpOptionsSchema(listingSchema);

//============================================================================================================================================================================================
// Get requests
//============================================================================================================================================================================================

router.get("/", async (req, res) => {
  try {
    let options;
    try {
      options = listingHttpOptionsSchema.parse(req.query) as HttpOptions<Listing>;
    } catch (err) {
      res.status(400).json({ error: "Invalid query parameters.", details: err });
      return;
    }

    const result = await listingRepository.get(options, options.fields);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching listings.", details: err });
  }
});

router.get("/:id/", async (req, res) => {
  try {
    if (!Number.isInteger(Number(req.params.id))) {
      res.status(400).json({ error: "Id must be an integer" });
      return;
    }

    const result = await listingRepository.get({ filter: { id: Number(req.params.id) } });
    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ error: `Listing with id "${req.params.id}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the listing.", details: err });
  }
});

router.get("/:id/priceHistory", async (req, res) => {
  try {
    if (!Number.isInteger(Number(req.params.id))) {
      res.status(400).json({ error: "Id must be an integer" });
      return;
    }

    const listing = await listingRepository.get({ filter: { id: Number(req.params.id) } }, ["id"]);
    if (listing.length === 0) {
      res.status(404).json({ error: `Listing with id "${req.params.id}" not found` });
    }

    const result = await priceHistoryRepository.get({ filter: { listingId: listing[0].id }, order: [{ by: "date" }] });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the price history of the listing.", details: err });
  }
});

//============================================================================================================================================================================================
// Default export
//============================================================================================================================================================================================

export default router;
