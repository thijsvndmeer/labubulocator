import { variantRepository, priceHistoryRepository } from "../index";
import { Variant } from "@labubu/common";

const STOCKX_WEIGHT = 0.8;
const EBAY_WEIGHT = 0.2;
const DECAY_RATE = 0.1;
const CURRENT_MARKET_WEIGHT = 0.7;
const HISTORICAL_WEIGHT = 0.3;

const calculateVolatility = async (sku: string): Promise<number | undefined> => {
  console.log(`ESTIMATED VALUE: Calculating volatility for ${sku}.`);
  const historicalPrices = await priceHistoryRepository.getAllByLabubuSku(sku);
  if (historicalPrices.length < 2) {
    console.log(`ESTIMATED VALUE: Not enough historical prices to calculate volatility for ${sku}.`);
    return undefined;
  }

  const prices = historicalPrices.map(p => p.price);
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.map(p => Math.pow(p - mean, 2)).reduce((a, b) => a + b, 0) / prices.length;
  const stdDev = Math.sqrt(variance);

  // Normalize volatility to a 0-100 scale. Assuming prices are in a reasonable range.
  const normalizedVolatility = Math.min(stdDev / 5, 1) * 100;

  console.log(`ESTIMATED VALUE: Calculated volatility for ${sku}: ${normalizedVolatility}`);
  return normalizedVolatility;
};

const calculateHistoricalValue = async (sku: string): Promise<number | null> => {
  console.log(`ESTIMATED VALUE: Calculating historical value for ${sku}.`);
  const historicalPrices = await priceHistoryRepository.getAllByLabubuSku(sku);
  if (historicalPrices.length === 0) {
    console.log(`ESTIMATED VALUE: No historical prices found for ${sku}.`);
    return null;
  }

  let weightedPriceSum = 0;
  let weightSum = 0;
  const now = new Date();

  for (const record of historicalPrices) {
    const ageInDays = (now.getTime() - new Date(record.date).getTime()) / (1000 * 3600 * 24);
    const weight = Math.exp(-DECAY_RATE * ageInDays);
    weightedPriceSum += record.price * weight;
    weightSum += weight;
  }

  const result = weightSum > 0 ? weightedPriceSum / weightSum : null;
  console.log(`ESTIMATED VALUE: Calculated historical value for ${sku}: ${result}`);
  return result;
};

const calculateCurrentMarketValue = (variant: Variant): number | null => {
  console.log(`ESTIMATED VALUE: Calculating current market value for ${variant.name}.`);
  const { stockxPrice, ebayLowestPrice } = variant;

  let result: number | null = null;
  if (stockxPrice && ebayLowestPrice) {
    result = STOCKX_WEIGHT * stockxPrice + EBAY_WEIGHT * ebayLowestPrice;
  } else if (stockxPrice) {
    result = stockxPrice;
  } else if (ebayLowestPrice) {
    result = ebayLowestPrice;
  }

  console.log(`ESTIMATED VALUE: Calculated current market value for ${variant.name}: ${result}`);
  return result;
};

const roundEstimatedValue = (value: number): number => {
  if (value >= 1000) {
    return Math.round(value / 10) * 10;
  }
  return Math.round(value);
};

export const calculateEstimatedValueForVariant = async (variant: Variant) => {
  console.log(`ESTIMATED VALUE: Calculating estimated value for ${variant.name}.`);
  const previousEstimatedValue = variant.estimatedValue;

  const historicalValue = await calculateHistoricalValue(variant.sku);
  const currentMarketValue = calculateCurrentMarketValue(variant);
  const volatility = await calculateVolatility(variant.sku);

  let estimatedValue: number | null = null;

  if (currentMarketValue && historicalValue) {
    estimatedValue = CURRENT_MARKET_WEIGHT * currentMarketValue + HISTORICAL_WEIGHT * historicalValue;
  } else if (currentMarketValue) {
    estimatedValue = currentMarketValue;
  } else if (historicalValue) {
    estimatedValue = historicalValue;
  }

  if (estimatedValue) {
    console.log(`ESTIMATED VALUE: Calculated estimated value for ${variant.name}: ${estimatedValue}`);
    const roundedValue = roundEstimatedValue(estimatedValue);
    console.log(`ESTIMATED VALUE: Rounded estimated value for ${variant.name}: ${roundedValue}`);
    let priceChange24h: number | undefined = undefined;

    if (previousEstimatedValue) {
      priceChange24h = ((roundedValue - previousEstimatedValue) / previousEstimatedValue) * 100;
    }

    await variantRepository.updateById(
      variant.id,
      {
        estimatedValue: roundedValue,
        estimatedValueLastCalculated: new Date().toISOString(),
        priceChange24h: priceChange24h,
        volatility: volatility,
      }
    );
    console.log(`ESTIMATED VALUE: Updated estimated value for ${variant.name} to ${roundedValue}`);
  }
};

export const calculateEstimatedValues = async () => {
  console.log("ESTIMATED VALUE: Calculating estimated values for all variants...");
  const variants = await variantRepository.get({});

  for (const variant of variants) {
    await calculateEstimatedValueForVariant(variant);
  }

  console.log("ESTIMATED VALUE: Finished calculating estimated values for all variants.");
};
