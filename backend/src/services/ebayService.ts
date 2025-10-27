import axios from 'axios';
import { Labubu } from "@labubu/common/src/types/labubu";
import { labubuRepository, priceHistoryRepository } from "../index";
import pLimit from "p-limit";
import { calculateEstimatedValueForLabubu } from './estimatedValueService';

// Helper function for rate limiting
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const EBAY_APP_ID = process.env.EBAY_APP_ID || '';
const EBAY_CERT_ID = process.env.EBAY_CERT_ID || '';
const EBAY_DEV_ID = process.env.EBAY_DEV_ID || ''; // Not directly used for Browse API Client Credentials Flow

const EBAY_API_BASE_URL = "https://api.ebay.com/buy/browse/v1";
const EBAY_OAUTH_BASE_URL = "https://api.ebay.com/identity/v1/oauth2/token";

let accessToken: string = '';
let tokenExpiryTime: number = 0;

const getAccessToken = async (): Promise<string> => {
  if (accessToken && Date.now() < tokenExpiryTime) {
    return accessToken;
  }

  try {
    const credentials = Buffer.from(`${EBAY_APP_ID}:${EBAY_CERT_ID}`).toString('base64');
    const response = await axios.post(EBAY_OAUTH_BASE_URL,
      'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiryTime = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh 1 minute before expiry
    return accessToken;
  } catch (error) {
    console.error("Error getting eBay access token:", error);
    throw new Error("Failed to get eBay access token.");
  }
};

// Helper function for exponential backoff retry
const retry = async <T>(fn: () => Promise<T>, retries = 5, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying after ${delay}ms... Attempts left: ${retries}`);
      await new Promise(res => setTimeout(res, delay));
      return retry(fn, retries - 1, delay * 2);
    } else {
      throw error;
    }
  }
};

export const getEbayListing = async (labubu: Labubu, stockxPrice?: number, limit: number = 10): Promise<{ lowestPrice?: number; ebayUrl?: string | null }> => {
  console.log(`--- START getEbayListing for ${labubu.name} ---`);
  let ebaySearchUrl: string | null = null; // Declare ebaySearchUrl here and initialize to null
  try {
    const token = await getAccessToken();

    let baseEbayQuery = labubu.name;
    if (labubu.series === "Mokoko") {
      baseEbayQuery += " Mokoko";
    } else {
      baseEbayQuery += " labubu";
    }

    const performEbaySearch = async (query: string, currentLimit: number, stockxPrice?: number) => {
      console.log(`Performing eBay search with query: "${query}"`);
      const encodedEbayQuery = encodeURIComponent(query);
      const currentEbaySearchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodedEbayQuery}`;

      const response = await retry(async () => {
        return await axios.get(`${EBAY_API_BASE_URL}/item_summary/search`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' // Or other marketplace ID
          },
          params: {
            q: query,
            category_ids: '220',
            item_conditions: 'NEW',
            limit: currentLimit, // Use the passed limit
            sort: 'price',
          }
        });
      });

      const items = response.data.itemSummaries;
      if (items && items.length > 0) {
        let validPrices: { price: number; url: string }[] = [];
        for (const item of items) {
          const price = parseFloat(item.price.value);
          if (price >= 20) {
            // Apply reliability filter if stockxPrice is available
            if (stockxPrice && price < stockxPrice * 0.5) {
              console.log(`EBAY: Discarding eBay listing for ${labubu.name} due to price (${price}) being too low compared to StockX (${stockxPrice}).`);
              continue; // Skip this listing
            }
            validPrices.push({ price: price, url: item.itemWebUrl || currentEbaySearchUrl });
          }
        }

        if (validPrices.length > 0) {
          validPrices.sort((a, b) => a.price - b.price);

          if (
            labubu.rarity === 'common' &&
            labubu.stockStatus === 'aftermarketorbb' &&
            labubu.msrp &&
            validPrices[0].price >= labubu.msrp * 2
          ) {
            if (validPrices.length > 1) {
              console.log(`EBAY: Price for ${labubu.name} is >= 2 * MSRP. Using second best search result.`);
              return { lowestPrice: validPrices[1].price, ebayUrl: validPrices[1].url };
            } else {
              console.log(`EBAY: Price for ${labubu.name} is >= 2 * MSRP, but no second best search result available.`);
              return { lowestPrice: undefined, ebayUrl: validPrices[0].url };
            }
          }

          return { lowestPrice: validPrices[0].price, ebayUrl: validPrices[0].url };
        }
      }
      return { lowestPrice: undefined, ebayUrl: currentEbaySearchUrl }; // Return undefined if no valid price found
    };

    // First attempt with 'authentic'
    let ebayQueryWithAuthentic = baseEbayQuery + " authentic";
    let searchResult = await performEbaySearch(ebayQueryWithAuthentic, limit, stockxPrice);
    console.log("Search result with 'authentic':", searchResult);

    // If no valid price found, try again without 'authentic'
    if (searchResult.lowestPrice === undefined) { 
      console.log(`EBAY: No valid price found with 'authentic' for ${labubu.name}. Retrying without 'authentic'.`);
      searchResult = await performEbaySearch(baseEbayQuery, limit, stockxPrice);
      console.log("Search result without 'authentic':", searchResult);
    }

    // If still no valid price found, try a less strict query
    if (searchResult.lowestPrice === undefined) {
      const lessStrictQuery = labubu.name.replace(/\s*\(.*?\)/g, '').trim();
      if (lessStrictQuery !== labubu.name) {
        console.log(`EBAY: No valid price found. Retrying with less strict query: ${lessStrictQuery} labubu`);
        await sleep(30000); // Delay for the retry
        searchResult = await performEbaySearch(lessStrictQuery + " labubu", limit, stockxPrice);
        console.log("Search result with less strict query:", searchResult);
      } else {
        // As a last resort, try searching with just the name, without "labubu" or "Mokoko"
        console.log(`EBAY: No valid price found. Retrying with just the name: ${labubu.name}`);
        await sleep(30000); // Delay for the retry
        searchResult = await performEbaySearch(labubu.name, limit, stockxPrice);
        console.log("Search result with just the name:", searchResult);
      }
    }

    console.log(`--- END getEbayListing for ${labubu.name} ---`);
    return searchResult;
  } catch (error) {
    console.error(`EBAY: Error fetching eBay listing for ${labubu.name}:`, error);
  }
  console.log(`--- END getEbayListing for ${labubu.name} with error ---`);
  return { lowestPrice: undefined, ebayUrl: null }; // Return undefined for price and null for URL on error
};

export const ebayLimit = pLimit(1); // Limit to 1 concurrent eBay request

export const processEbayLabubu = async (labubu: Labubu) => {
  // The threeDaysAgo check is no longer applicable for eBay as per user instructions.

  if (labubu.name) {
    try {
      let stockxPrice = labubu.stockxPrice; // Use stockxPrice
      let ebayListing = await getEbayListing(labubu, stockxPrice);

      // If eBay price is significantly lower than StockX price, try to find a more reliable listing
      if (stockxPrice && ebayListing.lowestPrice && ebayListing.lowestPrice < stockxPrice * 0.5) {
        console.log(`EBAY: eBay price for ${labubu.name} is significantly lower than StockX. Attempting to find a more reliable listing.`);
        // Re-run getEbayListing with a higher limit to get more options
        ebayListing = await getEbayListing(labubu, stockxPrice, 20); // Pass a higher limit
      }

      const updateData: Partial<Labubu> = { ebayLastRefreshed: new Date().toISOString() };

      if (ebayListing.lowestPrice !== undefined) {
        updateData.ebayLowestPrice = ebayListing.lowestPrice;

        const existingLabubu = await labubuRepository.get({ filter: { sku: labubu.sku } }, ["stockxPrice"]);
        const currentStockxPrice = existingLabubu[0]?.stockxPrice;

        if (currentStockxPrice !== undefined && currentStockxPrice !== null) {
          updateData.lowestPrice = Math.min(ebayListing.lowestPrice, currentStockxPrice);
        } else {
          updateData.lowestPrice = ebayListing.lowestPrice;
        }
      }


      const priceRange = await priceHistoryRepository.getMinMaxPriceForLabubuLast24h(labubu.sku);
      if (priceRange) {
        updateData.priceRange = { low: priceRange.min, high: priceRange.max };
      }

      if (Object.keys(updateData).length > 1) {
        await labubuRepository.update(
          { filter: { sku: labubu.sku } },
          updateData
        );
        console.log(`EBAY: Updated Labubu ${labubu.name} (SKU: ${labubu.sku}) with eBay data: lowest price: ${updateData.ebayLowestPrice}`);
        const updatedLabubu = await labubuRepository.get({ filter: { sku: labubu.sku } });
        if (updatedLabubu.length > 0) {
          await calculateEstimatedValueForLabubu(updatedLabubu[0]);
        }
      } else {
        console.log(`EBAY: No new eBay data found for Labubu ${labubu.name} (SKU: ${labubu.sku})`);
      }
    } catch (apiError) {
      console.error(`EBAY: Error fetching eBay data for Labubu ${labubu.name} (SKU: ${labubu.sku}):`, apiError);
    }
  }
};

export const syncAllEbayLabubus = async () => {
  console.log("EBAY: Starting eBay value synchronization...");
  try {
    const allLabubus = await labubuRepository.get({}); // Fetch all Labubus
    console.log(`EBAY: Found ${allLabubus.length} Labubus for eBay synchronization.`);
    for (const labubu of allLabubus) {
      await ebayLimit(() => processEbayLabubu(labubu));
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
    }
    console.log("EBAY: eBay value synchronization completed.");
  } catch (error) {
    console.error("EBAY: Error during eBay value synchronization:", error);
  }
};
