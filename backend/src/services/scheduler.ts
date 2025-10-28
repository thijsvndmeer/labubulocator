import cron from "node-cron";
import { labubuRepository } from "../index";
import { priceHistoryRepository } from "../index";
import { processStockxLabubu, stockxLimit } from "./kicksDevSyncService";
import { syncAllEbayLabubus } from "./ebayService"; // Import syncAllEbayLabubus from ebayService.ts
import { calculateEstimatedValues } from "./estimatedValueService";
export const startApiSync = () => {
  console.log("SCHEDULER: Starting API synchronization scheduler...");

  // Schedule Kicks.dev synchronization to run every 3 days
  cron.schedule("0 0 */3 * *", async () => {
    console.log("SCHEDULER: Starting Labubu value synchronization with Kicks.dev API...");
    try {
      const allLabubus = await labubuRepository.get({});
      const promises = allLabubus.map(labubu => stockxLimit(() => processStockxLabubu(labubu)));
      await Promise.all(promises);
      console.log("SCHEDULER: Labubu value synchronization completed.");
    } catch (error) {
      console.error("SCHEDULER: Error during Labubu value synchronization:", error);
    }
  });

  // Run immediately on startup for initial sync
  (async () => {
    console.log("SCHEDULER: Running initial API synchronization...");
    await Promise.all([
      (async () => {
        console.log("SCHEDULER: Starting initial Labubu value synchronization with Kicks.dev API...");
        try {
          const allLabubus = await labubuRepository.get({});
          const promises = allLabubus.map(labubu => stockxLimit(() => processStockxLabubu(labubu)));
          await Promise.all(promises);
          console.log("SCHEDULER: Initial Labubu value synchronization completed.");
        } catch (error) {
          console.error("SCHEDULER: Error during initial Labubu value synchronization:", error);
        }
      })(),
      syncAllEbayLabubus() // Uncomment this line if you want to run eBay sync on startup as well (which i dont)
    ]);
    console.log("SCHEDULER: Initial API synchronization completed.");

    // Schedule eBay synchronization to run every 30 minutes after initial sync
    cron.schedule("*/30 * * * *", syncAllEbayLabubus);

    // Schedule estimated value calculation to run once a day
    cron.schedule("0 0 * * *", calculateEstimatedValues);
  })();
};