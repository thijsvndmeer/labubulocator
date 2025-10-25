import cron from "node-cron";
import { labubuRepository } from "../index";
import { Labubu } from "@labubu/common/src/types/labubu";
import axios from "axios";
import pLimit from "p-limit";
import { getEbayListing } from "./ebayService";
import { priceHistoryRepository } from "../index";

// Helper function for rate limiting
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const stockxLimit = pLimit(1); // Limit to 1 concurrent StockX request
const ebayLimit = pLimit(1); // Limit to 1 concurrent eBay request

interface KicksDevProductVariant {
  lowest_ask: number;
}

interface KicksDevApiResponse {
  data: Array<{
    link?: string;
    variants?: KicksDevProductVariant[];
  }>;
}

const KICKS_DEV_API_KEY = process.env.KICKS_DEV_API_KEY || "sd_r796CnCR9yo8earZQezqQsOh2e60Zqxb";
const KICKS_DEV_API_BASE_URL = "https://api.kicks.dev/v3/stockx/products";

const processStockxLabubu = async (labubu: Labubu) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  if (labubu.name) {
    if (labubu.stockxLastRefreshed) {
      const lastRefreshedDate = new Date(labubu.stockxLastRefreshed);
      if (lastRefreshedDate > threeDaysAgo) {
        console.log(`Skipping StockX update for Labubu ${labubu.name} (SKU: ${labubu.sku}) - already refreshed recently.`);
        return;
      }
    }

    try {
      await sleep(10000); // 10-second delay between Kicks.dev API calls
      const response = await axios.get<KicksDevApiResponse>(KICKS_DEV_API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${KICKS_DEV_API_KEY}`,
        },
        params: {
          query: labubu.name,
          "display[variants]": true,
        },
      });
      const stockxData = response.data.data;
      const updateData: Partial<Labubu> = { stockxLastRefreshed: new Date().toISOString() };

      if (stockxData && stockxData.length > 0) {
        const lowestAsk = stockxData[0].variants?.[0]?.lowest_ask;
        let stockxLink = stockxData[0].link;

        if (!stockxLink) {
          stockxLink = `https://stockx.com/search?s=${encodeURIComponent(labubu.name)}`;
        }

        if (lowestAsk !== undefined && lowestAsk >= 25) {
          updateData.lowestPrice = lowestAsk;
        }
        if (stockxLink) {
          updateData.stockxUrl = stockxLink;
        }
      } else {
        const stockxLink = `https://stockx.com/search?s=${encodeURIComponent(labubu.name)}`;
        updateData.stockxUrl = stockxLink;
        console.log(`No product data found for Labubu ${labubu.name} (SKU: ${labubu.sku}) from Kicks.dev API. Created search link: ${stockxLink}`);
      }

      const priceRange = await priceHistoryRepository.getMinMaxPriceForLabubuLastWeek(labubu.sku);
      if (priceRange) {
        updateData.priceRange = { low: priceRange.min, high: priceRange.max };
      }

      if (Object.keys(updateData).length > 1) {
        await labubuRepository.update(
          { filter: { sku: labubu.sku } },
          updateData
        );
        console.log(`Updated Labubu ${labubu.name} (SKU: ${labubu.sku}) with StockX data: lowest ask: ${updateData.lowestPrice}`);
      } else {
        console.log(`No new StockX data found for Labubu ${labubu.name} (SKU: ${labubu.sku})`);
      }
    } catch (apiError) {
      console.error(`Error fetching StockX data for Labubu ${labubu.name} (SKU: ${labubu.sku}):`, apiError);
    }
  }
};

const processEbayLabubu = async (labubu: Labubu) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  if (labubu.name) {
    if (labubu.ebayLastRefreshed) {
      const lastRefreshedDate = new Date(labubu.ebayLastRefreshed);
      if (lastRefreshedDate > threeDaysAgo) {
        console.log(`Skipping eBay update for Labubu ${labubu.name} (SKU: ${labubu.sku}) - already refreshed recently.`);
        return;
      }
    }

    try {
      await sleep(30000); // 30-second delay between eBay API calls
      let ebayListing = await getEbayListing(`${labubu.name} labubu`, labubu.msrp || 0);

      if (ebayListing.lowestPrice === labubu.msrp && labubu.msrp !== undefined && labubu.msrp < 25) {
        // If fallback to MSRP happened and MSRP is < 25, try a less strict eBay search
        const lessStrictQuery = labubu.name.replace(/\s*\(.*?\)/g, '').trim(); // Remove text in parentheses
        if (lessStrictQuery !== labubu.name) {
          console.log(`Retrying eBay search for ${labubu.name} with less strict query: ${lessStrictQuery} labubu`);
          await sleep(30000); // Another delay for the retry
          ebayListing = await getEbayListing(`${lessStrictQuery} labubu`, labubu.msrp || 0);
        }
      }

      const updateData: Partial<Labubu> = { ebayLastRefreshed: new Date().toISOString() };

      if (ebayListing.lowestPrice !== undefined && ebayListing.lowestPrice >= 25) {
        updateData.ebayLowestPrice = ebayListing.lowestPrice;
      }
      if (ebayListing.ebayUrl) {
        updateData.ebayUrl = ebayListing.ebayUrl;
      }

      const priceRange = await priceHistoryRepository.getMinMaxPriceForLabubuLastWeek(labubu.sku);
      if (priceRange) {
        updateData.priceRange = { low: priceRange.min, high: priceRange.max };
      }

      if (Object.keys(updateData).length > 1) {
        await labubuRepository.update(
          { filter: { sku: labubu.sku } },
          updateData
        );
        console.log(`Updated Labubu ${labubu.name} (SKU: ${labubu.sku}) with eBay data: lowest price: ${updateData.ebayLowestPrice}`);
      } else {
        console.log(`No new eBay data found for Labubu ${labubu.name} (SKU: ${labubu.sku})`);
      }
    } catch (apiError) {
      console.error(`Error fetching eBay data for Labubu ${labubu.name} (SKU: ${labubu.sku}):`, apiError);
    }
  }
};

export const startApiSync = () => {
  console.log("Starting API synchronization scheduler...");

  // Schedule Kicks.dev synchronization to run every 3 days
  cron.schedule("0 0 */3 * *", async () => {
    console.log("Starting Labubu value synchronization with Kicks.dev API...");
    try {
      const allLabubus = await labubuRepository.get({});
      const promises = allLabubus.map(labubu => stockxLimit(() => processStockxLabubu(labubu)));
      await Promise.all(promises);
      console.log("Labubu value synchronization completed.");
    } catch (error) {
      console.error("Error during Labubu value synchronization:", error);
    }
  });

  // Schedule eBay synchronization to run every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    console.log("Starting eBay value synchronization...");
    try {
      const allLabubus = await labubuRepository.get({}); // Fetch all Labubus
      console.log(`Found ${allLabubus.length} Labubus for eBay synchronization.`);
      const promises = allLabubus.map(labubu => ebayLimit(() => processEbayLabubu(labubu)));
      await Promise.all(promises);
      console.log("eBay value synchronization completed.");
    } catch (error) {
      console.error("Error during eBay value synchronization:", error);
    }
  });

  // Run immediately on startup for initial sync
  (async () => {
    console.log("Running initial API synchronization...");
    await Promise.all([
      (async () => {
        console.log("Starting initial Labubu value synchronization with Kicks.dev API...");
        try {
          const allLabubus = await labubuRepository.get({});
          const promises = allLabubus.map(labubu => stockxLimit(() => processStockxLabubu(labubu)));
          await Promise.all(promises);
          console.log("Initial Labubu value synchronization completed.");
        } catch (error) {
          console.error("Error during initial Labubu value synchronization:", error);
        }
      })(),
      (async () => {
        console.log("Starting initial eBay value synchronization...");
        try {
          const allLabubus = await labubuRepository.get({}); // Fetch all Labubus
          console.log(`Found ${allLabubus.length} Labubus for initial eBay synchronization.`);
          const promises = allLabubus.map(labubu => ebayLimit(() => processEbayLabubu(labubu)));
          await Promise.all(promises);
          console.log("Initial eBay value synchronization completed.");
        } catch (error) {
          console.error("Error during initial eBay value synchronization:", error);
        }
      })()
    ]);
    console.log("Initial API synchronization completed.");
  })();
};
