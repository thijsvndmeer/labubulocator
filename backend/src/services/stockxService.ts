
import axios from 'axios';

export interface StockxData {
  name: string;
  releaseDate: string;
  retailPrice: number;
  imageUrl: string;
  lastSale: {
    price: number;
  };
  lowestAsk: {
    price: number;
    currency: string;
  };
}

export async function getStockxData(url: string): Promise<StockxData | null> {
  try {
    const KICKS_DEV_API_KEY = process.env.KICKS_DEV_API_KEY || "sd_r796CnCR9yo8earZQezqQsOh2e60Zqxb"; // Replace with your actual API key or environment variable
    const KICKS_DEV_API_BASE_URL = "https://api.kicks.dev/v3/realtime/stockx/products/";

    const stockxProductId = url.split('/').pop();

    if (!stockxProductId) {
      console.error('Could not extract StockX product ID from URL', url);
      return null;
    }

    const kicksDevApiUrl = `${KICKS_DEV_API_BASE_URL}${stockxProductId}`;

    const response = await axios.get(kicksDevApiUrl, {
      headers: {
        'Authorization': `Bearer ${KICKS_DEV_API_KEY}`,
      },
    });

    const productData = response.data; // Assuming the API returns the product data directly

    // Map the KicksDB API response to the StockxData interface
    return {
      name: productData.name,
      releaseDate: productData.releaseDate,
      retailPrice: productData.retailPrice,
      imageUrl: productData.imageUrl,
      lastSale: {
        price: productData.lastSale.price,
      },
      lowestAsk: {
        price: productData.lowestAsk.price,
        currency: productData.lowestAsk.currency,
      },
    };
  } catch (error) {
    console.error('Error fetching or processing StockX data with kicks.dev:', error);
    return null;
  }
}
