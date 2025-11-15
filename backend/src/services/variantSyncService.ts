import { parse } from "csv-parse";
import fs from "fs";
import { variantRepository } from "../index";
import { Variant } from "@labubu/common";
import path from "path";

const csvPath = path.resolve("src", "data", "labubus.csv");

const getSeriesFolderName = (series: string): string => {
    const seriesLower = series.toLowerCase();
    if (seriesLower.startsWith('exciting macaron')) return 'exciting macaron';
    if (seriesLower.startsWith('have a seat')) return 'have a seat';
    if (seriesLower.startsWith('big into energy')) return 'big into energy';
    if (seriesLower.startsWith('pin for love')) return 'pin for love';
    if (seriesLower.startsWith('plush releases')) return 'plush releases';
    if (seriesLower.startsWith('regional')) return 'regional';
    if (seriesLower.startsWith('zimomo')) return 'zimomo';
    if (seriesLower.startsWith('mokoko')) return 'mokoko';
    if (seriesLower.startsWith('coca cola')) return 'coca cola series';
    return series.toLowerCase().replace(/ /g, '-');
}

export const syncVariants = async () => {
  console.log("VARIANT SYNC: Starting Variant synchronization from CSV.");
  try {
    const parser = fs.createReadStream(csvPath).pipe(
      parse({
        columns: true,
        trim: true,
        skip_empty_lines: true,
      })
    );

    for await (const record of parser) {
      console.log(`VARIANT SYNC: Processing record for SKU: ${record.sku}`);
      const variantData: Partial<Variant> = {
        sku: record.sku,
        name: record.name,
        series: record.series,
        description: record.description,
        rarity: record.rarity,
        msrp: record.msrp,
        stockStatus: record.stockStatus,
      };

      if (record.kicksdevId && record.kicksdevId.trim() !== '') {
        variantData.kicksdevId = record.kicksdevId;
      }

      if (record.ebaySearchOverride && record.ebaySearchOverride.trim() !== '') {
        variantData.ebaySearchOverride = record.ebaySearchOverride;
      }

      await variantRepository.updateOrCreate(variantData as Variant);
      console.log(`VARIANT SYNC: Upserted Variant with SKU: ${record.sku}`);
    }

    console.log(`VARIANT SYNC: Succesfully synced ${csvPath} with the database`);
  } catch (err) {
    console.error(`VARIANT SYNC: Error processing ${csvPath}:`, err);
  }
};