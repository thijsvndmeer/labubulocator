import axios from 'axios';
import { Labubu } from "@labubu/common/src/types/labubu";
import { labubuRepository, priceHistoryRepository } from "../index";
import pLimit from "p-limit";

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

export const getEbayListing = async (query: string, msrp: number): Promise<{ lowestPrice?: number; ebayUrl?: string }> => {
  try {
    const token = await getAccessToken();
    const response = await retry(async () => {
      return await axios.get(`${EBAY_API_BASE_URL}/item_summary/search`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' // Or other marketplace ID
        },
        params: {
          q: query,
          category_ids: '246',
          item_conditions: 'NEW',
          limit: 10, // Fetch up to 10 items
          sort: 'price',
        }
      });
    });

    const items = response.data.itemSummaries;
    if (items && items.length > 0) {
      const partnerId = "5339126898";
      for (const item of items) {
        const price = parseFloat(item.price.value);
        if (price >= 20) {
          const smartEbayUrl = `${item.itemWebUrl}?mkcid=1&mkrid=711-53200-19255-0&siteid=0&numpt=0&toolid=10001&campid=${partnerId}&customid=&mkevt=1`;
          return { lowestPrice: price, ebayUrl: smartEbayUrl };
        }
      }
    }
    // If no price >= 25 is found, fallback to MSRP
    return { lowestPrice: msrp, ebayUrl: undefined };
  } catch (error) {
    console.error(`Error fetching eBay listing for ${query}:`, error);
  }
  return { lowestPrice: msrp, ebayUrl: undefined };
};

export const ebayLimit = pLimit(1); // Limit to 1 concurrent eBay request

export const processEbayLabubu = async (labubu: Labubu) => {
  // The threeDaysAgo check is no longer applicable for eBay as per user instructions.

  if (labubu.name) {
    try {
      let ebayListing = await getEbayListing(`${labubu.name} labubu`, labubu.msrp || 0);

      if (ebayListing.lowestPrice === labubu.msrp && labubu.msrp !== undefined && labubu.msrp < 25) {
        // If fallback to MSRP happened and MSRP is < 25, try a less strict eBay search
        const lessStrictQuery = labubu.name.replace(/\s*\(.*?\)/g, '').trim(); // Remove text in parentheses
        if (lessStrictQuery !== labubu.name) {
          console.log(`EBAY: Retrying eBay search for ${labubu.name} with less strict query: ${lessStrictQuery} labubu`);
          await sleep(30000); // Another delay for the retry
          ebayListing = await getEbayListing(`${lessStrictQuery} labubu`, labubu.msrp || 0);
        }
      }

      const updateData: Partial<Labubu> = { ebayLastRefreshed: new Date().toISOString() };

      if (ebayListing.lowestPrice !== undefined) {
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
        console.log(`EBAY: Updated Labubu ${labubu.name} (SKU: ${labubu.sku}) with eBay data: lowest price: ${updateData.ebayLowestPrice}`);
      } else {
        console.log(`EBAY: No new eBay data found for Labubu ${labubu.name} (SKU: ${labubu.sku})`);
      }
    } catch (apiError) {
      console.error(`EBAY: Error fetching eBay data for Labubu ${labubu.name} (SKU: ${labubu.sku}):`, apiError);
    }
  }
};
