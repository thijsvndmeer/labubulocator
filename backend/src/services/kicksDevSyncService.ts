import { labubuRepository } from "../index";
import { Labubu } from "@labubu/common/src/types/labubu";
import axios from "axios";
import pLimit from "p-limit";

const KICKS_DEV_API_KEY = process.env.KICKS_DEV_API_KEY || "sd_r796CnCR9yo8earZQezqQsOh2e60Zqxb"; // Fallback for development
const KICKS_DEV_API_BASE_URL = "https://api.kicks.dev/v3/stockx/products"; // Changed API endpoint

// Helper function for rate limiting
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface KicksDevProductVariant {
  lowest_ask: number;
  // ... other variant properties if needed
}

interface KicksDevApiResponse {
  data: Array<{
    link?: string; // Add link property
    variants?: KicksDevProductVariant[]; // Direct variants for stockx products
    // ... other fields
  }>;
}

export const stockxLimit = pLimit(1); // Limit to 1 concurrent StockX request

export const processStockxLabubu = async (labubu: Labubu) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  if (labubu.name) {
    if (labubu.lastRefreshed) {
      const lastRefreshedDate = new Date(labubu.lastRefreshed);
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
      const updateData: Partial<Labubu> = { lastRefreshed: new Date().toISOString() };

      if (stockxData && stockxData.length > 0) {
        const lowestAsk = stockxData[0].variants?.[0]?.lowest_ask;
        let stockxLink = stockxData[0].link;

        if (!stockxLink) {
          stockxLink = `https://stockx.com/search?s=${encodeURIComponent(labubu.name)}`;
        }

        if (lowestAsk !== undefined) {
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

export const syncLabubuValues = async () => {
  console.log("Starting Labubu value synchronization with Kicks.dev API...");
  try {
    const allLabubus = await labubuRepository.get({});
    const promises = allLabubus.map(labubu => stockxLimit(() => processStockxLabubu(labubu)));
    await Promise.all(promises);
    console.log("Labubu value synchronization completed.");
  } catch (error) {
    console.error("Error during Labubu value synchronization:", error);
  }
};