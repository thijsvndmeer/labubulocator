import { parse } from "csv-parse";
import fs from "fs";
import { labubuRepository } from "../index";
import { Labubu } from "@labubu/common/src/types/labubu";
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

export const syncLabubus = async () => {
  try {
    const csvSkus = new Set<string>();
    const parser = fs.createReadStream(csvPath).pipe(
      parse({
        columns: true,
        trim: true,
        skip_empty_lines: true,
      })
    );

    for await (const record of parser) {
      if (record.sku) {
        csvSkus.add(record.sku);
      }
    }

    const dbLabubus = await labubuRepository.get({});
    const dbSkus = new Set(dbLabubus.map((l) => l.sku));

    const skusToDelete = [...dbSkus].filter((sku) => !csvSkus.has(sku));
    if (skusToDelete.length > 0) {
      await labubuRepository.delete({ filter: { sku: { in: skusToDelete } } });
      console.log(`Deleted ${skusToDelete.length} labubus from the database.`);
    }

    const secondParser = fs.createReadStream(csvPath).pipe(
      parse({
        columns: true,
        trim: true,
        skip_empty_lines: true,
      })
    );

    for await (const record of secondParser) {
      if (!record.sku || !record.name) {
        continue;
      }

      if (!record.image) {
        const seriesFolder = getSeriesFolderName(record.series);
        let sku = record.sku;
        if (sku.includes('lbb-bii-')) {
          sku = sku.replace('lbb-bii-', 'lbb-bie-');
        }
        record.image = `http://localhost:3001/images/${seriesFolder}/${sku.toUpperCase()}.png`;
      }

      const labubuData: Partial<Labubu> = { ...record };
      if (!record.kicksdevId) {
        delete labubuData.kicksdevId;
      }

      await labubuRepository.updateOrCreate(labubuData as Labubu);
    }

    console.log(`Succesfully synced ${csvPath} with the database`);
  } catch (err) {
    console.error(`Error processing ${csvPath}:`, err);
  }
};