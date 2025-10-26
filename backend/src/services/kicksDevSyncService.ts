import { labubuRepository, listingRepository, priceHistoryRepository } from "../index";
import { Labubu } from "@labubu/common/src/types/labubu";
import axios from "axios";
import pLimit from "p-limit";
import { calculateEstimatedValueForLabubu } from "./estimatedValueService";

const KICKS_DEV_API_KEY = process.env.KICKS_DEV_API_KEY || "sd_r796CnCR9yo8earZQezqQsOh2e60Zqxb";
const KICKS_DEV_API_BASE_URL = "https://api.kicks.dev/v3/stockx/products";

// Helper function for rate limiting
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface KicksDevProductVariant {
  lowest_ask: number;
}

interface KicksDevProduct {
  id: string;
  slug: string;
  link?: string;
  variants?: KicksDevProductVariant[];
  title?: string;
  primary_title?: string;
}

interface KicksDevApiResponse {
  data: KicksDevProduct[];
}

export const stockxLimit = pLimit(1); // Limit to 1 concurrent StockX request

export const processStockxLabubu = async (labubu: Labubu) => {
  console.log("--- START processStockxLabubu ---");
  console.log("Initial labubu object:", labubu);

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  if (labubu.name) {
    // Only skip if refreshed recently AND lowestPrice is a valid positive number
    if (labubu.stockxLastRefreshed && labubu.stockxPrice && labubu.stockxPrice > 0) {
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
      let currentKicksdevId: string | undefined;

      if (labubu.kicksdevId) {
        console.log(`STOCKX: Performing direct lookup for Labubu ${labubu.name} (SKU: ${labubu.sku}) with kicksdevId: ${labubu.kicksdevId}`);
        try {
          const response = await axios.get<{ data: KicksDevProduct }>(`${KICKS_DEV_API_BASE_URL}/${labubu.kicksdevId}`, {
            headers: {
              Authorization: `Bearer ${KICKS_DEV_API_KEY}`,
            },
            params: {
              "display[variants]": true,
            },
          });
          console.log("Direct lookup response:", response.data);
          const product = response.data.data;
          if (product) {
            console.log("Direct lookup product:", product);
            const title = product.title || product.primary_title || '';
            if (!title.toLowerCase().includes('blind box')) {
              currentLowestAsk = product.variants?.[0]?.lowest_ask;
              currentStockxLink = product.link;
              currentKicksdevId = product.slug;
              console.log("Direct lookup values:", { currentLowestAsk, currentStockxLink, currentKicksdevId });
            }
          }
        } catch (error) {
          console.error("Error during direct lookup:", error);
        }
      } else {
        const performSearch = async (query: string) => {
          console.log(`Performing search with query: "${query}"`);
          try {
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
            console.log("Search response data:", response.data);
            const stockxData = response.data.data;
            console.log("Search stockxData:", stockxData);

            let lowestAsk: number | undefined;
            let stockxLink: string | undefined;
            let kicksdevId: string | undefined;

            if (stockxData && stockxData.length > 0) {
              const validAsks: { price: number; link?: string, slug: string }[] = [];
              for (const product of stockxData) {
                const title = product.title || product.primary_title || '';
                if (!title.toLowerCase().includes('blind box')) {
                  const ask = product.variants?.[0]?.lowest_ask;
                  if (ask) {
                    validAsks.push({ price: ask, link: product.link, slug: product.slug });
                  }
                }
              }
              console.log("Valid asks:", validAsks);

              if (validAsks.length > 0) {
                validAsks.sort((a, b) => a.price - b.price);
                lowestAsk = validAsks[0].price;
                stockxLink = validAsks[0].link;
                kicksdevId = validAsks[0].slug;
                console.log("Initial search result:", { lowestAsk, stockxLink, kicksdevId });

                if (
                  labubu.rarity === 'common' &&
                  labubu.stockStatus === 'aftermarketorbb' &&
                  labubu.msrp &&
                  lowestAsk >= labubu.msrp * 2
                ) {
                  if (validAsks.length > 1) {
                    console.log(`STOCKX: Price for ${labubu.name} is >= 2 * MSRP. Using second best search result.`);
                    lowestAsk = validAsks[1].price;
                    stockxLink = validAsks[1].link;
                    kicksdevId = validAsks[1].slug;
                    console.log("Second best search result:", { lowestAsk, stockxLink, kicksdevId });
                  } else {
                    console.log(`STOCKX: Price for ${labubu.name} is >= 2 * MSRP, but no second best search result available.`);
                    lowestAsk = undefined;
                    stockxLink = undefined;
                    kicksdevId = undefined;
                  }
                }
              }
            }
            return { lowestAsk, stockxLink, kicksdevId };
          } catch (error) {
            console.error("Error during search:", error);
            return { lowestAsk: undefined, stockxLink: undefined, kicksdevId: undefined };
          }
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
        currentKicksdevId = searchResult.kicksdevId;
        console.log("Final search result:", { currentLowestAsk, currentStockxLink, currentKicksdevId });
      }

      const updateData: Partial<Labubu> = { stockxLastRefreshed: new Date().toISOString() };

      if (currentLowestAsk !== undefined) {
        const adjustedLowestAsk = currentLowestAsk + 7;
        updateData.stockxPrice = adjustedLowestAsk;
        console.log(`STOCKX: Adjusted lowest ask for Labubu ${labubu.name} (SKU: ${labubu.sku}) from ${currentLowestAsk} to ${adjustedLowestAsk} (+7).`);

        const existingLabubu = await labubuRepository.get({ filter: { sku: labubu.sku } }, ["ebayLowestPrice"]);
        const ebayLowestPrice = existingLabubu[0]?.ebayLowestPrice;

        if (ebayLowestPrice !== undefined && ebayLowestPrice !== null) {
          updateData.lowestPrice = Math.min(adjustedLowestAsk, ebayLowestPrice);
        } else {
          updateData.lowestPrice = adjustedLowestAsk;
        }
      }
      if (currentKicksdevId) {
        updateData.kicksdevId = currentKicksdevId;
      }

      console.log("Update data:", updateData);

      if (Object.keys(updateData).length > 1) {
        await labubuRepository.update(
          { filter: { sku: labubu.sku } },
          updateData
        );
        console.log(`STOCKX: Updated Labubu ${labubu.name} (SKU: ${labubu.sku}) with StockX data: stockxPrice: ${updateData.stockxPrice}, lowestPrice: ${updateData.lowestPrice}`);

        if (currentLowestAsk && currentStockxLink) {
          const listingId = await listingRepository.updateOrCreate({
            productUrl: currentStockxLink,
            labubuSku: labubu.sku,
            vendorName: "StockX",
            listingTitle: labubu.name, // Or a more descriptive title if available
            currentPrice: currentLowestAsk,
            inStock: true,
            lastCheckedAt: new Date(),
          });
          await priceHistoryRepository.create({
            listingId: listingId,
            price: currentLowestAsk,
            date: new Date(),
          });
        }

        const updatedLabubu = await labubuRepository.get({ filter: { sku: labubu.sku } });
        if (updatedLabubu.length > 0) {
          await calculateEstimatedValueForLabubu(updatedLabubu[0]);
        }
      } else {
        console.log(`STOCKX: No new StockX data found for Labubu ${labubu.name} (SKU: ${labubu.sku})`);
      }
    } catch (apiError) {
      console.error(`STOCKX: Error fetching StockX data for Labubu ${labubu.name} (SKU: ${labubu.sku}):`, apiError);
    }
  }
  console.log("--- END processStockxLabubu ---");
};
