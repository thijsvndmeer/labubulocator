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
    const parser = fs.createReadStream(csvPath).pipe(
      parse({
        columns: true,
        trim: true,
        skip_empty_lines: true,
      })
    );

    for await (const record of parser) {
      if (!record.image) {
        const seriesFolder = getSeriesFolderName(record.series);
        let sku = record.sku;
        if (sku.includes('lbb-bii-')) {
          sku = sku.replace('lbb-bii-', 'lbb-bie-');
        }
        record.image = `http://localhost:3001/images/${seriesFolder}/${sku.toUpperCase()}.png`;
      }
      await labubuRepository.updateOrCreate(record as Labubu);
    }

    console.log(`Succesfully synced ${csvPath} with the database`);
  } catch (err) {
    console.error(`Error processing ${csvPath}:`, err);
  }
};