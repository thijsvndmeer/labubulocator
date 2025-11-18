import { parse } from "csv-parse";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { Labubu } from "@labubu/common/src/types/labubu";
import path from "path";
import { LabubuRepository } from "../repositories/labubuRepository";

const dataDirectory = path.resolve(process.cwd(), "src", "data");
export const LABUBU_CSV_PATH = path.join(dataDirectory, "labubus.csv");

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

export const syncLabubus = async (repository: LabubuRepository, csvFilePath: string = LABUBU_CSV_PATH): Promise<number> => {
  console.log(`LABUBU SYNC: Starting Labubu synchronization from CSV at ${csvFilePath}.`);
  try {
    const parser = fs.createReadStream(csvFilePath).pipe(
      parse({
        columns: true,
        trim: true,
        skip_empty_lines: true,
      })
    );

    let processedCount = 0;
    for await (const record of parser) {
      console.log(`LABUBU SYNC: Processing record for SKU: ${record.sku}`);
      const labubuData: Partial<Labubu> = {
        sku: record.sku,
        name: record.name,
        series: record.series,
        description: record.description,
        rarity: record.rarity,
        msrp: record.msrp,
        stockStatus: record.stockStatus,
      };

      if (record.kicksdevId && record.kicksdevId.trim() !== '') {
        labubuData.kicksdevId = record.kicksdevId;
      }

      if (record.ebaySearchOverride && record.ebaySearchOverride.trim() !== '') {
        labubuData.ebaySearchOverride = record.ebaySearchOverride;
      }

      await repository.updateOrCreate(labubuData as Labubu);
      console.log(`LABUBU SYNC: Upserted Labubu with SKU: ${record.sku}`);
      processedCount += 1;
    }

    console.log(`LABUBU SYNC: Succesfully synced ${csvFilePath} with the database (${processedCount} rows).`);
    return processedCount;
  } catch (err) {
    console.error(`LABUBU SYNC: Error processing ${csvFilePath}:`, err);
    throw err;
  }
};

export const replaceLabubuCatalog = async (
  repository: LabubuRepository,
  csvBuffer: Buffer,
  targetFilePath: string = LABUBU_CSV_PATH
) => {
  console.log(`LABUBU SYNC: Replacing catalog with data from uploaded CSV.`);
  await fsPromises.mkdir(path.dirname(targetFilePath), { recursive: true });
  await fsPromises.writeFile(targetFilePath, csvBuffer);
  console.log(`LABUBU SYNC: Saved uploaded CSV to ${targetFilePath}. Clearing existing catalog...`);
  await repository.delete();
  const processedCount = await syncLabubus(repository, targetFilePath);
  return { processedCount, filePath: targetFilePath };
};
