import { PriceEntry } from "@common/types/labubu";
import db from "../lib/database";
import { LabubuRepository } from "../repositories/labubuRepository";
import { ListingRepository } from "../repositories/listingRepository";
import { PriceHistoryRepository } from "../repositories/priceHistoryRepository";

const labubuRepository = new LabubuRepository(db);
const listingRepository = new ListingRepository(db);
const priceHistoryRepository = new PriceHistoryRepository(db);

//============================================================================================================================================================================================
// Setters
//============================================================================================================================================================================================

// export const addPrice = (product_url: string, priceEntry : PriceEntry) => {
//     let priceHistory = priceHistories.get(product_url);
//     // make sure the price history exists
//     if (!priceHistory) {
//         priceHistory = { history: [] };
//         priceHistories.set(product_url, priceHistory);
//     }

//     // insert the new price while keeping the history sorted
//     priceHistory.history.push(priceEntry);
//     priceHistory.history.sort((a, b) => a.date.getTime() - b.date.getTime());
// }

const runTest = async () => {
  try {
    console.log("--- Testing findOrCreate ---");
    const labubu_id = await labubuRepository.findOrCreate({
      sku: "example-sku",
      name: "Example Labubu",
      series: "Example Series",
      rarity: null,
      image: null,
      description: null,
      msrp: null,
    });
    console.log("Labubu entry created.", labubu_id);

    console.log("\n--- Testing find (specific fields) ---");
    const foundLabubu1 = await labubuRepository.find({ sku: "example-sku" }, [
      "name",
    ]);
    console.log("Labubu entry found.", foundLabubu1);

    console.log("\n--- Testing update ---");
    const updatedCount = await labubuRepository.update(
      { sku: "example-sku" },
      {
        rarity: "Example Rarity",
        image: "Example-image",
        description: "Example description",
        msrp: 100,
      }
    );
    console.log("Labubu entry updated.", updatedCount);

    console.log("\n--- Testing find (all fields) ---");
    const foundLabubu2 = await labubuRepository.find({ sku: "example-sku" });
    console.log("Labubu entry found.", foundLabubu2);

    console.log("\n--- Testing delete ---");
    const deletedCount = await labubuRepository.delete();
    console.log("Labubu entry deleted.", deletedCount);
  } catch (err) {
    console.error("An error occurred during the test run:", err);
  }
};

runTest();

//============================================================================================================================================================================================
// Getters
//============================================================================================================================================================================================

/**
 * Returns the latest price entry for a given SKU, or null if no price is found.
 * @param sku - The SKU to retrieve the latest price for.
 * @returns The latest price entry for the given SKU, or null if no price is found.
 */
export const getPrice = (product_url: string): PriceEntry | null => {
  // const priceHistory = priceHistories.get(product_url);
  // if (priceHistory && priceHistory.history.length > 0) {
  //     return priceHistory.history[priceHistory.history.length - 1];
  // }
  return null;
};

/**
 * Returns the entire price history for a given SKU, or null if no price history is found.
 * @param sku - The SKU to retrieve the price history for.
 * @returns - The entire price history for the given SKU, or null if no price history is found.
 */
export const getPriceHistory = (product_url: string): PriceEntry[] | null => {
  // return priceHistories.get(product_url) || null;
  return null;
};
