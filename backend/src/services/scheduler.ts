import cron from "node-cron";
import { labubuRepository } from "../index";
import { priceHistoryRepository } from "../index";
import { processStockxLabubu, stockxLimit } from "./kicksDevSyncService";
import { processEbayLabubu, ebayLimit } from "./ebayService"; // Import processEbayLabubu and ebayLimit from ebayService.ts

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
      (async () => {
        console.log("EBAY: Starting initial eBay value synchronization...");
        try {
          const allLabubus = await labubuRepository.get({}); // Fetch all Labubus
          console.log(`EBAY: Found ${allLabubus.length} Labubus for initial eBay synchronization.`);
          for (const labubu of allLabubus) {
            await ebayLimit(() => processEbayLabubu(labubu));
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
          }
          console.log("EBAY: Initial eBay value synchronization completed.");
        } catch (error) {
          console.error("EBAY: Error during initial eBay value synchronization:", error);
        }
      })()
    ]);
    console.log("SCHEDULER: Initial API synchronization completed.");

    // Schedule eBay synchronization to run every 30 minutes after initial sync
    cron.schedule("*/30 * * * *", async () => {
      console.log("EBAY: Starting eBay value synchronization...");
      try {
        const allLabubus = await labubuRepository.get({}); // Fetch all Labubus
        console.log(`EBAY: Found ${allLabubus.length} Labubus for eBay synchronization.`);
        const promises = allLabubus.map(labubu => ebayLimit(() => processEbayLabubu(labubu)));
        await Promise.all(promises);
        console.log("EBAY: eBay value synchronization completed.");
      } catch (error) {
        console.error("EBAY: Error during eBay value synchronization:", error);
      }
    });
  })();
};