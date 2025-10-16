import { PriceEntry } from "@common/types/labubu";
import { LabubuRepository } from "src/repositories/labubuRepository";

export class LabubuPriceService {
  private labubuRepository: LabubuRepository;

  //============================================================================================================================================================================================
  // Constructor
  //============================================================================================================================================================================================

  constructor(labubuRepository: LabubuRepository) {
    this.labubuRepository = labubuRepository;

    this.runTest();
  }

  //============================================================================================================================================================================================
  // Setters
  //============================================================================================================================================================================================

  // export const addPrice = (productUrl: string, priceEntry : PriceEntry) => {
  //     let priceHistory = priceHistories.get(productUrl);
  //     // make sure the price history exists
  //     if (!priceHistory) {
  //         priceHistory = { history: [] };
  //         priceHistories.set(productUrl, priceHistory);
  //     }

  //     // insert the new price while keeping the history sorted
  //     priceHistory.history.push(priceEntry);
  //     priceHistory.history.sort((a, b) => a.date.getTime() - b.date.getTime());
  // }

  private async runTest() {
    try {
      //   console.log("--- Testing getOrCreate ---");
      //   const labubuId = await this.labubuRepository.getOrCreate({
      //     sku: "example-sku",
      //     name: "Example Labubu",
      //     series: "Example Series",
      //     rarity: null,
      //     image: null,
      //     description: null,
      //     msrp: null,
      //     lowestPrice: null,
      //   });
      //   console.log("Labubu entry created.", labubuId);

      //   console.log("\n--- Testing get (specific fields) ---");
      //   const foundLabubu1 = await this.labubuRepository.get({filter: { sku: "example-sku" }}, ["name"]);
      //   console.log("Labubu entry found.", foundLabubu1);

      //   console.log("\n--- Testing update ---");
      //   const updatedCount = await this.labubuRepository.update(
      //     {filter: { sku: "example-sku" }},
      //     {
      //       rarity: "Example Rarity",
      //       image: "Example-image",
      //       description: "Example description",
      //       msrp: 100,
      //     }
      //   );
      //   console.log("Labubu entry updated.", updatedCount);

      //   console.log("\n--- Testing get (all fields) ---");
      //   const foundLabubu2 = await this.labubuRepository.get({filter: { sku: "example-sku" }});
      //   console.log("Labubu entry found.", foundLabubu2);

      //   console.log("\n--- Testing delete ---");
      //   const deletedCount = await this.labubuRepository.delete({filter: foundLabubu2[0]});
      //   console.log("Labubu entry deleted.", deletedCount);
      console.log(await this.labubuRepository.get());
    } catch (err) {
      console.error("An error occurred during the test run:", err);
    }
  }

  //============================================================================================================================================================================================
  // Getters
  //============================================================================================================================================================================================

  /**
   * Returns the latest price entry for a given SKU, or null if no price is found.
   * @param sku - The SKU to retrieve the latest price for.
   * @returns The latest price entry for the given SKU, or null if no price is found.
   */
  public async getPrice(productUrl: string): Promise<PriceEntry | null> {
    // const priceHistory = priceHistories.get(productUrl);
    // if (priceHistory && priceHistory.history.length > 0) {
    //     return priceHistory.history[priceHistory.history.length - 1];
    // }
    return null;
  }

  /**
   * Returns the entire price history for a given SKU, or null if no price history is found.
   * @param sku - The SKU to retrieve the price history for.
   * @returns - The entire price history for the given SKU, or null if no price history is found.
   */
  public async getPriceHistory(productUrl: string): Promise<PriceEntry[] | null> {
    // return priceHistories.get(productUrl) || null;
    return null;
  }
}
