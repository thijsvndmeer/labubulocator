import { Router } from "express";
import { labubuRepository } from "../index";
import { HttpOptions, Labubu, labubuSchema, makeHttpOptionsSchema } from "@labubu/common";

const router = Router();
const labubuHttpOptionsSchema = makeHttpOptionsSchema(labubuSchema);

//============================================================================================================================================================================================
// Get requests
//============================================================================================================================================================================================

router.get("/", async (req, res) => {
  console.log("ROUTE: GET /api/labubus - Request received.");
  try {
    let options;
    try {
      options = labubuHttpOptionsSchema.parse(req.query) as HttpOptions<Labubu>;
      console.log("ROUTE: GET /api/labubus - Parsed options:", options);
    } catch (err) {
      res.status(400).json({ error: "Invalid query parameters.", details: err });
      return;
    }

    const queryOptions: import("../types/labubu").QueryOptions<import("../types/labubu").PersistedLabubu> = {
      filter: options.filter,
      ranges: options.ranges as import("@labubu/common").Range<import("../types/labubu").PersistedLabubu>[] | undefined,
      order: options.order as import("@labubu/common").Sorting<import("../types/labubu").PersistedLabubu>[] | undefined,
      limit: options.limit,
      offset: options.offset,
    };
    const result = await labubuRepository.get(queryOptions, options.fields as (keyof import("../types/labubu").PersistedLabubu)[]);
    console.log(`ROUTE: GET /api/labubus - Found ${result.length} labubus.`);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching labubus.", details: err });
  }
});

router.get("/:sku/", async (req, res) => {
  console.log(`ROUTE: GET /api/labubus/${req.params.sku} - Request received.`);
  try {
    const result = await labubuRepository.get({ filter: { sku: req.params.sku } });
    if (result.length > 0) {
      console.log(`ROUTE: GET /api/labubus/${req.params.sku} - Found labubu.`);
      res.status(200).json(result[0]);
    } else {
      console.log(`ROUTE: GET /api/labubus/${req.params.sku} - Labubu not found.`);
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