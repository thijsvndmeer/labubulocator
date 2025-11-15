import { labubuRepository } from "../index";
import { Variant } from "@labubu/common";
import axios from "axios";
import pLimit from "p-limit";
import { calculateEstimatedValueForLabubu } from "./estimatedValueService";

const KICKS_DEV_API_KEY = process.env.KICKS_DEV_API_KEY;
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

export const processStockxVariant = async (variant: Variant) => {
  console.log("STOCKX: --- START processStockxVariant ---");
  console.log("STOCKX: Initial variant object:", variant);

  console.log(`STOCKX: Checking if Variant ${variant.name} (SKU: ${variant.sku}) needs a StockX price update.`);
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  if (variant.name) {
    // Only skip if refreshed recently AND lowestPrice is a valid positive number
    if (variant.stockxLastRefreshed && variant.stockxPrice && variant.stockxPrice > 0) {
      const lastRefreshedDate = new Date(variant.stockxLastRefreshed);
      if (lastRefreshedDate > threeDaysAgo) {
        console.log(`STOCKX: Skipping StockX update for Variant ${variant.name} (SKU: ${variant.sku}) - already refreshed recently and has a valid price.`);
        return;
      }
    }

    try {
      console.log(`STOCKX: Starting 10-second delay for Variant ${variant.name} (SKU: ${variant.sku})...`);
      await sleep(10000); // 10-second delay between Kicks.dev API calls
      console.log(`STOCKX: Delay finished for Variant ${variant.name} (SKU: ${variant.sku}). Fetching data...`);

      let currentLowestAsk: number | undefined;
      let currentStockxLink: string | undefined;
      let currentKicksdevId: string | undefined;

      if (variant.kicksdevId) {
        console.log(`STOCKX: Performing direct lookup for Variant ${variant.name} (SKU: ${variant.sku}) with kicksdevId: ${variant.kicksdevId}`);
        try {
          const response = await axios.get<{ data: KicksDevProduct }>(`${KICKS_DEV_API_BASE_URL}/${variant.kicksdevId}`, {
            headers: {
              Authorization: `Bearer ${KICKS_DEV_API_KEY}`,
            },
            params: {
              "display[variants]": true,
            },
          });
          console.log("STOCKX: Direct lookup response:", response.data);
          const product = response.data.data;
          if (product) {
            console.log("STOCKX: Direct lookup product:", product);
            const title = product.title || product.primary_title || '';
            if (!title.toLowerCase().includes('blind box')) {
              currentLowestAsk = product.variants?.[0]?.lowest_ask;
              currentStockxLink = product.link;
              currentKicksdevId = product.slug;
              console.log("STOCKX: Direct lookup values:", { currentLowestAsk, currentStockxLink, currentKicksdevId });
            }
          }
        } catch (error) {
          console.error("STOCKX: Error during direct lookup:", error);
        }
      } else {
        const performSearch = async (query: string) => {
          console.log(`STOCKX: Performing search with query: "${query}"`);
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
            console.log("STOCKX: Search response data:", response.data);
            const stockxData = response.data.data;
            console.log("STOCKX: Search stockxData:", stockxData);

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
              console.log("STOCKX: Valid asks:", validAsks);

              if (validAsks.length > 0) {
                validAsks.sort((a, b) => a.price - b.price);
                lowestAsk = validAsks[0].price;
                stockxLink = validAsks[0].link;
                kicksdevId = validAsks[0].slug;
                console.log("STOCKX: Initial search result:", { lowestAsk, stockxLink, kicksdevId });

                if (
                  variant.rarity === 'common' &&
                  variant.stockStatus === 'aftermarketorbb' &&
                  variant.msrp &&
                  lowestAsk >= variant.msrp * 2
                ) {
                  if (validAsks.length > 1) {
                    console.log(`STOCKX: Price for ${variant.name} is >= 2 * MSRP. Using second best search result.`);
                    lowestAsk = validAsks[1].price;
                    stockxLink = validAsks[1].link;
                    kicksdevId = validAsks[1].slug;
                    console.log("STOCKX: Second best search result:", { lowestAsk, stockxLink, kicksdevId });
                  } else {
                    console.log(`STOCKX: Price for ${variant.name} is >= 2 * MSRP, but no second best search result available.`);
                    lowestAsk = undefined;
                    stockxLink = undefined;
                    kicksdevId = undefined;
                  }
                }
              }
            }
            return { lowestAsk, stockxLink, kicksdevId };
          } catch (error) {
            console.error("STOCKX: Error during search:", error);
            return { lowestAsk: undefined, stockxLink: undefined, kicksdevId: undefined };
          }
        };

        // Initial search
        let initialSearchQuery = variant.name;
        const dashIndex = variant.name.indexOf(' - ');
        if (dashIndex !== -1) {
          initialSearchQuery = variant.name.substring(0, dashIndex) + ' pin for love';
        }
        console.log(`STOCKX: Performing search for Variant ${variant.name} (SKU: ${variant.sku}) with query: "${initialSearchQuery}"`);
        let searchResult = await performSearch(initialSearchQuery);
        currentLowestAsk = searchResult.lowestAsk;
        currentStockxLink = searchResult.stockxLink;
        currentKicksdevId = searchResult.kicksdevId;
        console.log("STOCKX: Final search result:", { currentLowestAsk, currentStockxLink, currentKicksdevId });
      }

      const updateData: Partial<Variant> = { stockxLastRefreshed: new Date().toISOString() };

      if (currentLowestAsk !== undefined) {
        const adjustedLowestAsk = currentLowestAsk + 7;
        updateData.stockxPrice = adjustedLowestAsk;
        console.log(`STOCKX: Adjusted lowest ask for Variant ${variant.name} (SKU: ${variant.sku}) from ${currentLowestAsk} to ${adjustedLowestAsk} (+7).`);

        const existingVariant = await labubuRepository.get({ filter: { sku: variant.sku } }, ["ebayLowestPrice"]);
        const ebayLowestPrice = existingVariant[0]?.ebayLowestPrice;

        if (ebayLowestPrice !== undefined && ebayLowestPrice !== null) {
          updateData.lowestPrice = Math.min(adjustedLowestAsk, ebayLowestPrice);
        } else {
          updateData.lowestPrice = adjustedLowestAsk;
        }
      }
      if (currentKicksdevId && !variant.kicksdevId) {
        updateData.kicksdevId = currentKicksdevId;
      }

      console.log("STOCKX: Update data:", updateData);

      if (Object.keys(updateData).length > 1) {
        await labubuRepository.update(
          { filter: { sku: variant.sku } },
          updateData
        );
        console.log(`STOCKX: Updated Variant ${variant.name} (SKU: ${variant.sku}) with StockX data: stockxPrice: ${updateData.stockxPrice}, lowestPrice: ${updateData.lowestPrice}`);
        const updatedVariant = await labubuRepository.get({ filter: { sku: variant.sku } });
        if (updatedVariant.length > 0) {
          await calculateEstimatedValueForLabubu(updatedVariant[0]);
        }
      } else {
        console.log(`STOCKX: No new StockX data found for Variant ${variant.name} (SKU: ${variant.sku})`);
      }
    } catch (apiError) {
      console.error(`STOCKX: Error fetching StockX data for Variant ${variant.name} (SKU: ${variant.sku}):`, apiError);
    }
  }
  console.log("STOCKX: --- END processStockxVariant ---");
};
