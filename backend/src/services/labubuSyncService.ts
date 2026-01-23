import { labubuRepository } from "../index";
import { Labubu } from "@labubu/common";
import { loadLabubusFromCsv, LABUBU_CSV_PATH } from "../utils/labubuCsvManager";

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
  console.log("LABUBU SYNC: Starting Labubu synchronization from CSV.");
  try {
    const records = await loadLabubusFromCsv();

    for (const record of records) {
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

      if (record.kicksdevId && String(record.kicksdevId).trim() !== '') {
        labubuData.kicksdevId = String(record.kicksdevId).trim();
      }

      if (record.ebaySearchOverride && String(record.ebaySearchOverride).trim() !== '') {
        labubuData.ebaySearchOverride = String(record.ebaySearchOverride).trim();
      }

      await labubuRepository.updateOrCreate(labubuData as Labubu);
      console.log(`LABUBU SYNC: Upserted Labubu with SKU: ${record.sku}`);
    }

    console.log(`LABUBU SYNC: Succesfully synced ${LABUBU_CSV_PATH} with the database`);
  } catch (err) {
    console.error(`LABUBU SYNC: Error processing ${LABUBU_CSV_PATH}:`, err);
  }
};