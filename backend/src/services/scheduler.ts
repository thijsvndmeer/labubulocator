import cron from "node-cron";
import { processStockxVariant, stockxLimit } from "./kicksDevSyncService";
import { syncAllEbayVariants } from "./ebayService"; // Import syncAllEbayVariants from ebayService.ts
import { calculateEstimatedValues } from "./estimatedValueService";
import { variantRepository, priceHistoryRepository } from "../index"; // Import repositories from index.ts

export const startApiSync = () => {
  console.log("SCHEDULER: Starting API synchronization scheduler...");

  // Schedule Kicks.dev synchronization to run every 3 days
  cron.schedule("0 0 */3 * *", async () => {
    console.log("SCHEDULER: Starting scheduled Variant value synchronization with Kicks.dev API...");
    try {
      const allVariants = await variantRepository.get({});
      console.log(`SCHEDULER: Found ${allVariants.length} Variants for scheduled Kicks.dev synchronization.`);
      const promises = allVariants.map(variant => stockxLimit(() => processStockxVariant(variant)));
      await Promise.all(promises);
      console.log("SCHEDULER: Scheduled Variant value synchronization completed.");
    } catch (error) {
      console.error("SCHEDULER: Error during scheduled Variant value synchronization:", error);
    }
  });

  // Schedule eBay synchronization to run every 30 minutes
  cron.schedule("*/30 * * * *", () => {
    console.log("SCHEDULER: Starting scheduled eBay synchronization...");
    syncAllEbayVariants();
  });

  // Schedule estimated value calculation to run once a day
  cron.schedule("0 0 * * *", () => {
    console.log("SCHEDULER: Starting scheduled estimated value calculation...");
    calculateEstimatedValues();
  });

  // Perform initial sync immediately on startup (this remains an IIFE but does not schedule anything)
  (async () => {
    console.log("SCHEDULER: Running initial API synchronization...");
    await Promise.all([
      (async () => {
        console.log("SCHEDULER: Starting initial Variant value synchronization with Kicks.dev API...");
        try {
          const allVariants = await variantRepository.get({});
          console.log(`SCHEDULER: Found ${allVariants.length} Variants for initial Kicks.dev synchronization.`);
          // const promises = allVariants.map(variant => stockxLimit(() => processStockxVariant(variant)));
          // await Promise.all(promises); uncomment these lines to enable initial sync
          console.log("SCHEDULER: Initial Variant value synchronization completed.");
        } catch (error) {
          console.error("SCHEDULER: Error during initial Variant value synchronization:", error);
        }
      })(),
      // syncAllEbayLabubus() // Uncomment this line if you want to run eBay sync on startup as well
    ]);
    console.log("SCHEDULER: Initial API synchronization completed.");
  })();
};