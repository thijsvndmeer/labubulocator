import axios from 'axios';
import { Labubu } from "@labubu/common/src/types/labubu";
import { labubuRepository, priceHistoryRepository } from "../index";
import pLimit from "p-limit";
import { calculateEstimatedValueForLabubu } from './estimatedValueService';
import { enforcePriceDiscrepancyRule } from "../utils/priceUtils";

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
  console.log('EBAY: Checking for existing eBay access token.');
  if (accessToken && Date.now() < tokenExpiryTime) {
    console.log('EBAY: Using existing eBay access token.');
    return accessToken;
  }

  console.log('EBAY: No valid eBay access token found, requesting a new one.');
  try {
    const credentials = Buffer.from(`${EBAY_APP_ID}:${EBAY_CERT_ID}`).toString('base64');
    console.log('EBAY: Requesting eBay access token with client credentials.');
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
    console.log('EBAY: Successfully obtained new eBay access token.');
    return accessToken;
  } catch (error) {
    console.error("EBAY: Error getting eBay access token:", error);
    throw new Error("Failed to get eBay access token.");
  }
};

// Helper function for exponential backoff retry
const retry = async <T>(fn: () => Promise<T>, retries = 5, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.warn(`EBAY: Retrying after ${delay}ms... Attempts left: ${retries}`);
      await new Promise(res => setTimeout(res, delay));
      return retry(fn, retries - 1, delay * 2);
    } else {
      console.error('EBAY: All retry attempts failed.');
      throw error;
    }
  }
};

export const getEbayListing = async (labubu: Labubu, stockxPrice?: number, limit: number = 10): Promise<{ lowestPrice?: number; ebayUrl?: string | null }> => {
  console.log(`EBAY: --- START getEbayListing for ${labubu.name} ---`);
  let ebaySearchUrl: string | null = null; // Declare ebaySearchUrl here and initialize to null
  try {
    const token = await getAccessToken();

    let baseEbayQuery = labubu.ebaySearchOverride || labubu.name;
    if (!labubu.ebaySearchOverride) {
      if (labubu.series === "Mokoko") {
        baseEbayQuery += " Mokoko";
      } else {
        baseEbayQuery += " labubu";
      }
    }
    console.log(`EBAY: Base eBay query: "${baseEbayQuery}"`);

    const performEbaySearch = async (query: string, currentLimit: number, stockxPrice?: number) => {
      console.log(`EBAY: Performing eBay search with query: "${query}"`);
      const encodedEbayQuery = encodeURIComponent(query);
      const currentEbaySearchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodedEbayQuery}`;

      const response = await retry(async () => {
        console.log(`EBAY: Calling eBay API with query: "${query}"`);
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
      console.log(`EBAY: Found ${items ? items.length : 0} items from eBay API for query "${query}"`);
      if (items && items.length > 0) {
        let validPrices: { price: number; url: string }[] = [];
        for (const item of items) {
          const price = parseFloat(item.price.value);
          console.log(`EBAY: Processing item with price: ${price}`);
          if (price >= 20) {
            // Apply reliability filter if stockxPrice is available
            if (stockxPrice && price < stockxPrice * 0.5) {
              console.log(`EBAY: Discarding eBay listing for ${labubu.name} due to price (${price}) being too low compared to StockX (${stockxPrice}).`);
              continue; // Skip this listing
            }
            validPrices.push({ price: price, url: item.itemWebUrl || currentEbaySearchUrl });
          } else {
            console.log(`EBAY: Discarding item with price ${price} because it is less than 20.`);
          }
        }

        if (validPrices.length > 0) {
          validPrices.sort((a, b) => a.price - b.price);
          console.log(`EBAY: Sorted valid prices:`, validPrices);

          const mid = Math.floor(validPrices.length / 2);
          const medianPrice = validPrices.length % 2 !== 0 ? validPrices[mid].price : (validPrices[mid - 1].price + validPrices[mid].price) / 2;
          const medianUrl = validPrices[mid].url;

          console.log(`EBAY: Returning median price: ${medianPrice}`);
          return { lowestPrice: medianPrice, ebayUrl: medianUrl };
        }
      }
      console.log(`EBAY: No valid price found for query "${query}"`);
      return { lowestPrice: undefined, ebayUrl: currentEbaySearchUrl }; // Return undefined if no valid price found
    };

    // First attempt with 'authentic'
    let ebayQueryWithAuthentic = baseEbayQuery + " authentic";
    let searchResult = await performEbaySearch(ebayQueryWithAuthentic, limit, stockxPrice);
    console.log("EBAY: Search result with 'authentic':", searchResult);

    // If no valid price found, try again without 'authentic'
    if (searchResult.lowestPrice === undefined) { 
      console.log(`EBAY: No valid price found with 'authentic' for ${labubu.name}. Retrying without 'authentic'.`);
      searchResult = await performEbaySearch(baseEbayQuery, limit, stockxPrice);
      console.log("EBAY: Search result without 'authentic':", searchResult);
    }

    // If still no valid price found, try a less strict query
    if (searchResult.lowestPrice === undefined) {
      const lessStrictQuery = labubu.name.replace(/\s*\(.*?\)/g, '').trim();
      if (lessStrictQuery !== labubu.name) {
        console.log(`EBAY: No valid price found. Retrying with less strict query: ${lessStrictQuery} labubu`);
        await sleep(30000); // Delay for the retry
        searchResult = await performEbaySearch(lessStrictQuery + " labubu", limit, stockxPrice);
        console.log("EBAY: Search result with less strict query:", searchResult);
      } else {
        // As a last resort, try searching with just the name, without "labubu" or "Mokoko"
        console.log(`EBAY: No valid price found. Retrying with just the name: ${labubu.name}`);
        await sleep(30000); // Delay for the retry
        searchResult = await performEbaySearch(labubu.name, limit, stockxPrice);
        console.log("EBAY: Search result with just the name:", searchResult);
      }
    }

    console.log(`EBAY: --- END getEbayListing for ${labubu.name} ---`);
    return searchResult;
  } catch (error) {
    console.error(`EBAY: Error fetching eBay listing for ${labubu.name}:`, error);
  }
  console.log(`EBAY: --- END getEbayListing for ${labubu.name} with error ---`);
  return { lowestPrice: undefined, ebayUrl: null }; // Return undefined for price and null for URL on error
};

export const ebayLimit = pLimit(1); // Limit to 1 concurrent eBay request

export const processEbayLabubu = async (labubu: Labubu) => {
  console.log(`EBAY: --- START processEbayLabubu for ${labubu.name} ---`);
  // The threeDaysAgo check is no longer applicable for eBay as per user instructions.

  if (labubu.name) {
    try {
      const stockxPrice = labubu.stockxPrice ?? undefined; // Normalize null to undefined for downstream typing
      console.log(`EBAY: StockX price for ${labubu.name}: ${stockxPrice}`);
      let ebayListing = await getEbayListing(labubu, stockxPrice);
      console.log(`EBAY: eBay listing for ${labubu.name}:`, ebayListing);

      // If eBay price is significantly lower than StockX price, try to find a more reliable listing
      if (stockxPrice && ebayListing.lowestPrice && ebayListing.lowestPrice < stockxPrice * 0.5) {
        console.log(`EBAY: eBay price for ${labubu.name} is significantly lower than StockX. Attempting to find a more reliable listing.`);
        // Re-run getEbayListing with a higher limit to get more options
        ebayListing = await getEbayListing(labubu, stockxPrice, 20); // Pass a higher limit
        console.log(`EBAY: New eBay listing after retry:`, ebayListing);
      }

      const updateData: Partial<Labubu> = { ebayLastRefreshed: new Date().toISOString() };

      if (ebayListing.lowestPrice !== undefined) {
        const existingLabubu = await labubuRepository.get({ filter: { sku: labubu.sku } }, ["stockxPrice"]);
        const currentStockxPrice = existingLabubu[0]?.stockxPrice;
        console.log(`EBAY: Current StockX price from DB for ${labubu.name}: ${currentStockxPrice}`);

        const priceDecision = enforcePriceDiscrepancyRule(currentStockxPrice, ebayListing.lowestPrice);

        if (priceDecision.ebayLowestPrice !== undefined) {
          updateData.ebayLowestPrice = priceDecision.ebayLowestPrice;
        } else {
          updateData.ebayLowestPrice = null;
          console.log(`EBAY: Discarding eBay price for ${labubu.name} due to >50% discrepancy with StockX.`);
        }

        if (priceDecision.stockxPrice === undefined && currentStockxPrice !== undefined && currentStockxPrice !== null) {
          updateData.stockxPrice = null;
          console.log(`EBAY: Discarding StockX price for ${labubu.name} due to >50% discrepancy with eBay.`);
        }

        if (priceDecision.lowestPrice !== undefined) {
          updateData.lowestPrice = priceDecision.lowestPrice;
          console.log(`EBAY: Updated lowest price for ${labubu.name}: ${updateData.lowestPrice}`);
        }
      }


      const priceRange = await priceHistoryRepository.getMinMaxPriceForLabubuLast24h(labubu.sku);
      if (priceRange) {
        updateData.priceRange = { low: priceRange.min, high: priceRange.max };
        console.log(`EBAY: Updated price range for ${labubu.name}:`, updateData.priceRange);
      }

      if (Object.keys(updateData).length > 1) {
        console.log(`EBAY: Updating Labubu ${labubu.name} in DB with data:`, updateData);
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
  console.log(`EBAY: --- END processEbayLabubu for ${labubu.name} ---`);
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
