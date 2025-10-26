import { labubuRepository, priceHistoryRepository, estimatedValueHistoryRepository } from "../index";
import { Labubu } from "@labubu/common/src/types/labubu";

const STOCKX_WEIGHT = 0.8;
const EBAY_WEIGHT = 0.2;
const DECAY_RATE = 0.1;
const CURRENT_MARKET_WEIGHT = 0.7;
const HISTORICAL_WEIGHT = 0.3;

const calculateHistoricalValue = async (sku: string): Promise<number | null> => {
  const historicalPrices = await priceHistoryRepository.getAllByLabubuSku(sku);
  if (historicalPrices.length === 0) {
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

  return weightSum > 0 ? weightedPriceSum / weightSum : null;
};

const calculateCurrentMarketValue = (labubu: Labubu): number | null => {
  const { stockxPrice, ebayLowestPrice } = labubu;

  if (stockxPrice && ebayLowestPrice) {
    return STOCKX_WEIGHT * stockxPrice + EBAY_WEIGHT * ebayLowestPrice;
  } else if (stockxPrice) {
    return stockxPrice;
  } else if (ebayLowestPrice) {
    return ebayLowestPrice;
  }

  return null;
};

const roundEstimatedValue = (value: number): number => {
  if (value >= 1000) {
    return Math.round(value / 10) * 10;
  }
  return Math.round(value);
};

export const calculateEstimatedValueForLabubu = async (labubu: Labubu) => {
  const historicalValue = await calculateHistoricalValue(labubu.sku);
  const currentMarketValue = calculateCurrentMarketValue(labubu);

  let estimatedValue: number | null = null;

  if (currentMarketValue && historicalValue) {
    estimatedValue = CURRENT_MARKET_WEIGHT * currentMarketValue + HISTORICAL_WEIGHT * historicalValue;
  } else if (currentMarketValue) {
    estimatedValue = currentMarketValue;
  } else if (historicalValue) {
    estimatedValue = historicalValue;
  }

  if (estimatedValue) {
    const roundedValue = roundEstimatedValue(estimatedValue);

    await estimatedValueHistoryRepository.create({
      labubuSku: labubu.sku,
      estimatedValue: roundedValue,
      date: new Date().toISOString(),
    });

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const previousValueEntry = await estimatedValueHistoryRepository.getByLabubuSkuAndDate(labubu.sku, oneDayAgo.toISOString());

    let priceChange24h: number | undefined = undefined;

    if (previousValueEntry) {
      priceChange24h = ((roundedValue - previousValueEntry.estimatedValue) / previousValueEntry.estimatedValue) * 100;
    }

    await labubuRepository.update(
      { filter: { sku: labubu.sku } },
      {
        estimatedValue: roundedValue,
        estimatedValueLastCalculated: new Date().toISOString(),
        priceChange24h: priceChange24h,
      }
    );
    console.log(`ESTIMATED VALUE: Updated estimated value for ${labubu.name} to ${roundedValue}`);
  }
};

export const calculateEstimatedValues = async () => {
  console.log("Calculating estimated values for all labubus...");
  const labubus = await labubuRepository.get({});

  for (const labubu of labubus) {
    await calculateEstimatedValueForLabubu(labubu);
  }

  console.log("Finished calculating estimated values for all labubus.");
};
