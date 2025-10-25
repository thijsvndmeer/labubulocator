import { labubuRepository } from "../index";
import { Labubu } from "@labubu/common/src/types/labubu";
import axios from "axios";
import pLimit from "p-limit";

const KICKS_DEV_API_KEY = process.env.KICKS_DEV_API_KEY || "sd_r796CnCR9yo8earZQezqQsOh2e60Zqxb";
const KICKS_DEV_API_BASE_URL = "https://api.kicks.dev/v3/stockx/products";

// Helper function for rate limiting
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface KicksDevProductVariant {
  lowest_ask: number;
}

interface KicksDevApiResponse {
  data: Array<{
    link?: string;
    variants?: KicksDevProductVariant[];
    title?: string;
    primary_title?: string;
  }>;
}

export const stockxLimit = pLimit(1); // Limit to 1 concurrent StockX request

export const processStockxLabubu = async (labubu: Labubu) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  if (labubu.name) {
    // Only skip if refreshed recently AND lowestPrice is a valid positive number
    if (labubu.stockxLastRefreshed && labubu.lowestPrice && labubu.lowestPrice > 0) {
      const lastRefreshedDate = new Date(labubu.stockxLastRefreshed);
      if (lastRefreshedDate > threeDaysAgo) {
        console.log(`STOCKX: Skipping StockX update for Labubu ${labubu.name} (SKU: ${labubu.sku}) - already refreshed recently and has a valid price.`);
        return;
      }
    }

    try {
      console.log(`STOCKX: Starting 10-second delay for Labubu ${labubu.name} (SKU: ${labubu.sku})...`);
      await sleep(10000); // 10-second delay between Kicks.dev API calls
      console.log(`STOCKX: Delay finished for Labubu ${labubu.name} (SKU: ${labubu.sku}). Fetching data...`);

      let currentLowestAsk: number | undefined;
      let currentStockxLink: string | undefined;

      const performSearch = async (query: string) => {
        const response = await axios.get<KicksDevApiResponse>(KICKS_DEV_API_BASE_URL, {
          headers: {
            Authorization: `Bearer ${KICKS_DEV_API_KEY}`,
          },
          params: {
            query: query,
            "display[variants]": true,
            brand: 'Pop Mart',
          },
        });
        const stockxData = response.data.data;

        let lowestAsk: number | undefined;
        let stockxLink: string | undefined;

        if (stockxData && stockxData.length > 0) {
          for (const product of stockxData) {
            const title = product.title || product.primary_title || '';
            if (!title.toLowerCase().includes('blind box')) {
              lowestAsk = product.variants?.[0]?.lowest_ask;
              stockxLink = product.link;
              console.log(`STOCKX: Extracted link for ${labubu.name} (SKU: ${labubu.sku}): ${stockxLink}`);
              break; // Found a valid product, exit loop
            }
          }

          if (!stockxLink && stockxData.length > 0) {
            // Fallback to the first product's link if no specific match was found but data exists
            // This fallback is only if no non-blind box product was found with a link
            const firstNonBlindBoxProduct = stockxData.find(product => {
              const title = product.title || product.primary_title || '';
              return !title.toLowerCase().includes('blind box');
            });
            if (firstNonBlindBoxProduct) {
              stockxLink = firstNonBlindBoxProduct.link;
            }
          }
        }
        return { lowestAsk, stockxLink };
      };

      // Initial search
      let initialSearchQuery = labubu.name;
      const dashIndex = labubu.name.indexOf(' - ');
      if (dashIndex !== -1) {
        initialSearchQuery = labubu.name.substring(0, dashIndex) + ' pin for love';
      }
      console.log(`STOCKX: Performing search for Labubu ${labubu.name} (SKU: ${labubu.sku}) with query: "${initialSearchQuery}"`);
      let searchResult = await performSearch(initialSearchQuery);
      currentLowestAsk = searchResult.lowestAsk;
      currentStockxLink = searchResult.stockxLink;

      const updateData: Partial<Labubu> = { stockxLastRefreshed: new Date().toISOString() };

      if (currentLowestAsk !== undefined) {
        const adjustedLowestAsk = currentLowestAsk + 7;
        updateData.lowestPrice = adjustedLowestAsk;
        console.log(`STOCKX: Adjusted lowest ask for Labubu ${labubu.name} (SKU: ${labubu.sku}) from ${currentLowestAsk} to ${adjustedLowestAsk} (+7).`);
      }
      if (currentStockxLink) {
        updateData.stockxUrl = currentStockxLink;
      }

      if (Object.keys(updateData).length > 1) {
        await labubuRepository.update(
          { filter: { sku: labubu.sku } },
          updateData
        );
        console.log(`STOCKX: Updated Labubu ${labubu.name} (SKU: ${labubu.sku}) with StockX data: lowest ask: ${updateData.lowestPrice}`);
      } else {
        console.log(`STOCKX: No new StockX data found for Labubu ${labubu.name} (SKU: ${labubu.sku})`);
      }
    } catch (apiError) {
      console.error(`STOCKX: Error fetching StockX data for Labubu ${labubu.name} (SKU: ${labubu.sku}):`, apiError);
    }
  }
};
