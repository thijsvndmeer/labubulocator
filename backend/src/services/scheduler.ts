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
    console.log("SCHEDULER: Starting scheduled Labubu value synchronization with Kicks.dev API...");
    try {
      const allLabubus = await labubuRepository.get({});
      console.log(`SCHEDULER: Found ${allLabubus.length} Labubus for scheduled Kicks.dev synchronization.`);
      const promises = allLabubus.map(labubu => stockxLimit(() => processStockxLabubu(labubu)));
      await Promise.all(promises);
      console.log("SCHEDULER: Scheduled Labubu value synchronization completed.");
    } catch (error) {
      console.error("SCHEDULER: Error during scheduled Labubu value synchronization:", error);
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
          console.log(`SCHEDULER: Found ${allLabubus.length} Labubus for initial Kicks.dev synchronization.`);

          if (process.env.KICKS_DEV_API_KEY) {
            const promises = allLabubus.map(labubu => stockxLimit(() => processStockxLabubu(labubu)));
            await Promise.all(promises);
            console.log("SCHEDULER: Initial Labubu value synchronization completed.");
          } else {
            console.warn("SCHEDULER: Skipping initial Kicks.dev sync - KICKS_DEV_API_KEY missing in .env");
          }
        } catch (error) {
          console.error("SCHEDULER: Error during initial Labubu value synchronization:", error);
        }
      })(),
      (async () => {
        if (process.env.EBAY_APP_ID && process.env.EBAY_CERT_ID) {
          await syncAllEbayLabubus();
        } else {
          console.warn("SCHEDULER: Skipping initial eBay sync - EBAY credentials missing in .env");
        }
      })()
    ]);
    console.log("SCHEDULER: Initial API synchronization completed.");

    // Schedule eBay synchronization to run every 30 minutes after initial sync
    cron.schedule("*/30 * * * *", () => {
      console.log("SCHEDULER: Starting scheduled eBay synchronization...");
      if (process.env.EBAY_APP_ID && process.env.EBAY_CERT_ID) {
        syncAllEbayLabubus();
      }
    });

    // Schedule estimated value calculation to run once a day
    cron.schedule("0 0 * * *", () => {
      console.log("SCHEDULER: Starting scheduled estimated value calculation...");
      calculateEstimatedValues();
    });
  })();
};