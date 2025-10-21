import { labubuRepository } from "../index";
import { Labubu } from "@labubu/common/src/types/labubu";
import axios from "axios";
import cron from "node-cron";

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

export const syncLabubuValues = async () => {
  console.log("Starting Labubu value synchronization with Kicks.dev API...");
  try {
    const allLabubus = await labubuRepository.get({});
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    for (const labubu of allLabubus) {
      if (labubu.name) {
        // Check if the Labubu was refreshed in the past 3 days
        if (labubu.lastRefreshed) {
          const lastRefreshedDate = new Date(labubu.lastRefreshed);
          if (lastRefreshedDate > threeDaysAgo) {
            console.log(`Skipping Labubu ${labubu.name} (SKU: ${labubu.sku}) - already refreshed recently.`);
            continue; // Skip to the next Labubu
          }
        }

        try {
          // Implement rate limiting
          await sleep(10000); // Wait for 10 seconds before the next request

          const response = await axios.get<KicksDevApiResponse>(KICKS_DEV_API_BASE_URL, {
            headers: {
              Authorization: `Bearer ${KICKS_DEV_API_KEY}`,
            },
            params: {
              query: labubu.name, // Use labubu.name as the query
              "display[variants]": true, // Request variants to get lowest_ask
            },
          });

          const productData = response.data.data;

          if (productData && productData.length > 0) {
            const lowestAsk = productData[0].variants?.[0]?.lowest_ask; // Directly access variants
            let stockxLink = productData[0].link; // Extract the link

            // If no direct link is available, construct a search URL
            if (!stockxLink) {
              stockxLink = `https://stockx.com/search?s=${encodeURIComponent(labubu.name)}`;
            }

            const updateData: Partial<Labubu> = { lastRefreshed: new Date().toISOString() };

            if (lowestAsk !== undefined) {
              updateData.lowestPrice = lowestAsk;
            }
            if (stockxLink) {
              updateData.stockxUrl = stockxLink;
            }

            if (Object.keys(updateData).length > 1) { // Check if there's anything to update besides lastRefreshed
              await labubuRepository.update(
                { filter: { sku: labubu.sku } },
                updateData
              );
              console.log(`Updated Labubu ${labubu.name} (SKU: ${labubu.sku}) with lowest ask: ${lowestAsk} and StockX link: ${stockxLink}`);
            } else {
              console.log(`No new data (lowest ask or StockX link) found for Labubu ${labubu.name} (SKU: ${labubu.sku})`);
            }
          } else {
            // If no product data is found, still try to create a search link
            const stockxLink = `https://stockx.com/search?s=${encodeURIComponent(labubu.name)}`;
            await labubuRepository.update(
              { filter: { sku: labubu.sku } },
              { stockxUrl: stockxLink, lastRefreshed: new Date().toISOString() }
            );
            console.log(`No product data found for Labubu ${labubu.name} (SKU: ${labubu.sku}) from Kicks.dev API. Created search link: ${stockxLink}`);
          }
        } catch (apiError) {
          console.error(`Error fetching data for Labubu ${labubu.name} (SKU: ${labubu.sku}) from Kicks.dev API:`, apiError);
        }
      }
    }
    console.log("Labubu value synchronization completed.");
  } catch (error) {
    console.error("Error during Labubu value synchronization:", error);
  }
};

// Schedule the synchronization to run every 3 days
// This cron expression means: "At 00:00 on day-of-month 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31 in every month."
// This is approximately every 3 days.
cron.schedule("0 0 */3 * *", () => {
  syncLabubuValues();
});

// Run immediately on startup for initial sync
syncLabubuValues();