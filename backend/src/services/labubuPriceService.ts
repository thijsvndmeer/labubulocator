import { PriceEntry, PriceHistory } from '@common/types/labubu'

const priceHistories = new Map<string, PriceHistory>()

//============================================================================================================================================================================================
// Setters
//============================================================================================================================================================================================

priceHistories.set('test', { history: [{ price: 1, date: new Date('2022-01-01T00:00:00.000Z') }] })
priceHistories.set('test2', { history: [{ price: 2, date: new Date('2022-01-01T00:00:00.000Z') }, { price: 3, date: new Date('2022-01-02T00:00:00.000Z') }, { price: 4, date: new Date('2022-01-03T00:00:00.000Z') }] })

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