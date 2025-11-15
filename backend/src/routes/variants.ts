import { Router } from "express";
import { labubuRepository } from "../index";
import { HttpOptions, Variant, variantSchema, makeHttpOptionsSchema } from "@labubu/common";

const router = Router();
const variantHttpOptionsSchema = makeHttpOptionsSchema(variantSchema);

//============================================================================================================================================================================================
// Get requests
//============================================================================================================================================================================================

router.get("/", async (req, res) => {
  console.log("ROUTE: GET /api/variants - Request received.");
  try {
    let options;
    try {
      options = variantHttpOptionsSchema.parse(req.query) as HttpOptions<Variant>;
      console.log("ROUTE: GET /api/variants - Parsed options:", options);
    } catch (err) {
      res.status(400).json({ error: "Invalid query parameters.", details: err });
      return;
    }

    const queryOptions: import("@labubu/common").QueryOptions<import("@labubu/common").Variant> = {
      filter: options.filter,
      ranges: options.ranges as import("@labubu/common").Range<import("@labubu/common").Variant>[] | undefined,
      order: options.order as import("@labubu/common").Sorting<import("@labubu/common").Variant>[] | undefined,
      limit: options.limit,
      offset: options.offset,
    };
    const result = await labubuRepository.get(queryOptions, options.fields as (keyof import("@labubu/common").Variant)[]);
    console.log(`ROUTE: GET /api/variants - Found ${result.length} variants.`);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching variants.", details: err });
  }
});

router.get("/:sku/", async (req, res) => {
  console.log(`ROUTE: GET /api/variants/${req.params.sku} - Request received.`);
  try {
    const result = await labubuRepository.get({ filter: { sku: req.params.sku } });
    if (result.length > 0) {
      console.log(`ROUTE: GET /api/variants/${req.params.sku} - Found variant.`);
      res.status(200).json(result[0]);
    } else {
      console.log(`ROUTE: GET /api/variants/${req.params.sku} - Variant not found.`);
      res.status(404).json({ error: `Variant with sku "${req.params.sku}" not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the variant.", details: err });
  }
});

//============================================================================================================================================================================================
// Default export
//============================================================================================================================================================================================

export default router;