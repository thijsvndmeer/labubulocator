import { PriceEntry, PriceHistory } from '@common/types/labubu'

const priceHistories = new Map<string, PriceHistory>()

//============================================================================================================================================================================================
// Persistance
//============================================================================================================================================================================================



//============================================================================================================================================================================================
// Setters
//============================================================================================================================================================================================

export const addPrice = (sku: string, priceEntry : PriceEntry) => {
    let priceHistory = priceHistories.get(sku);
    // make sure the price history exists
    if (!priceHistory) {
        priceHistory = { history: [] };
        priceHistories.set(sku, priceHistory);
    }

    // insert the new price while keeping the history sorted
    priceHistory.history.push(priceEntry);
    priceHistory.history.sort((a, b) => a.date.getTime() - b.date.getTime());
}

addPrice('test1', { price: 5, date: new Date('2022-01-04T00:00:00.000Z') })
addPrice('test2', { price: 6, date: new Date('2022-01-05T00:00:00.000Z') })
addPrice('test2', { price: 2, date: new Date('2021-01-05T00:00:00.000Z') })
addPrice('test2', { price: 9, date: new Date('2025-01-05T00:00:00.000Z') })
addPrice('test2', { price: 3, date: new Date('2024-01-05T00:00:00.000Z') })
addPrice('test2', { price: 1, date: new Date('2020-01-05T00:00:00.000Z') })

//============================================================================================================================================================================================
// Getters
//============================================================================================================================================================================================

/**
 * Returns the latest price entry for a given SKU, or null if no price is found.
 * @param {string} sku - The SKU to retrieve the latest price for.
 * @returns {PriceEntry | null} - The latest price entry for the given SKU, or null if no price is found.
 */
export const getPrice = (sku: string): PriceEntry | null => {
    const priceHistory = priceHistories.get(sku);
    if (priceHistory && priceHistory.history.length > 0) {
        return priceHistory.history[priceHistory.history.length - 1];
    }
    return null;
}

/**
 * Returns the entire price history for a given SKU, or null if no price history is found.
 * @param {string} sku - The SKU to retrieve the price history for.
 * @returns {PriceHistory | null} - The entire price history for the given SKU, or null if no price history is found.
 */
export const getPriceHistory = (sku: string): PriceHistory | null => {
    return priceHistories.get(sku) || null;
}