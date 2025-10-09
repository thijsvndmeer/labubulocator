import { PriceData, Sale, PriceSnapshot, Variant } from '@/types/variant';
import Papa from 'papaparse';

let variants: Variant[] = [];

const parseJsonString = (jsonString: string, defaultValue: any) => {
  try {
    // The JSON strings in the CSV are double-quoted, so we need to parse them twice.
    return JSON.parse(JSON.parse(`"${jsonString}"`));
  } catch (e) {
    return defaultValue;
  }
};

export const initializeVariants = async () => {
  if (variants.length > 0) {
    return;
  }

  console.log('Attempting to fetch labubus.csv...');
  try {
    const response = await fetch('/labubus.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    console.log('labubus.csv fetched successfully.');

    return new Promise<void>((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('CSV parsing complete. Raw data:', results.data);
          variants = results.data.map((row: any) => ({
            name: row.name,
            series: row.series,
            variant: row.variant,
            sku: row.sku,
            rarity: row.rarity,
            images: parseJsonString(row.images, []),
            description: row.description,
            msrp: parseFloat(row.msrp),
            retailUrl: row.retailUrl,
            stockStatus: row.stockStatus,
            attributes: parseJsonString(row.attributes, {}),
            affiliateLinks: parseJsonString(row.affiliateLinks, []),
            
            // These will be calculated dynamically
            lastSalePrice: 0,
            floorPrice: 0,
            priceSources: [],
            estimatedValue: 0,
            priceRange: { low: 0, high: 0 },
            confidenceScore: 0,
            priceChange24h: 0,
            recentSales: [],
            priceHistory: [],
          }));
          console.log('Initialized variants:', variants);
          resolve();
        },
        error: (error: any) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Failed to fetch or process labubus.csv:', error);
    // Ensure the promise is rejected if an error occurs during fetch or initial processing
    return Promise.reject(error);
  }
};

export const getAllVariants = (): Variant[] => {
  return variants;
};

export const getVariantBySku = (sku: string): Variant | undefined => {
  console.log('Searching for SKU:', sku);
  const foundVariant = variants.find((v) => v.sku === sku);
  console.log('Found variant:', foundVariant);
  return foundVariant;
};

export const updateVariantWithScrapedData = (variantSku: string, scrapedPrices: PriceData[]): Variant | undefined => {
  const variantIndex = variants.findIndex(v => v.sku === variantSku);
  if (variantIndex === -1) {
    return undefined;
  }

  const variant = variants[variantIndex];

  // Update price sources
  variant.priceSources = scrapedPrices;

  if (scrapedPrices.length > 0) {
    const prices = scrapedPrices.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    variant.floorPrice = minPrice;
    variant.lastSalePrice = minPrice; // Placeholder
    variant.estimatedValue = avgPrice;
    variant.priceRange = { low: minPrice, high: maxPrice };

    // Add to recent sales
    const newSales: Sale[] = scrapedPrices.map(p => ({
      source: p.site,
      price: p.price,
      currency: 'USD',
      date: new Date().toISOString(),
      url: p.url,
    }));
    variant.recentSales = [...(variant.recentSales || []), ...newSales].slice(-10);

    // Add to price history
    const newSnapshot: PriceSnapshot = {
      date: new Date().toISOString(),
      median30d: avgPrice,
      median90d: avgPrice,
      median365d: avgPrice,
      volume: (variant.priceHistory?.[0]?.volume || 0) + newSales.length,
    };
    variant.priceHistory = [...(variant.priceHistory || []), newSnapshot].slice(-30);
    
    // Update confidence score
    variant.confidenceScore = Math.min(100, 50 + scrapedPrices.length * 10);
  }

  variants[variantIndex] = variant;
  return variant;
};