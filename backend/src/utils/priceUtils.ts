export const enforcePriceDiscrepancyRule = (
  stockxPrice?: number | null,
  ebayLowestPrice?: number | null
): {
  stockxPrice?: number;
  ebayLowestPrice?: number;
  lowestPrice?: number;
} => {
  let validatedStockxPrice = stockxPrice ?? undefined;
  let validatedEbayLowestPrice = ebayLowestPrice ?? undefined;

  if (validatedStockxPrice !== undefined && validatedEbayLowestPrice !== undefined) {
    const higherPrice = Math.max(validatedStockxPrice, validatedEbayLowestPrice);
    const lowerPrice = Math.min(validatedStockxPrice, validatedEbayLowestPrice);

    // Discard the lower provider's data if it differs by more than 50% from the higher one
    if (lowerPrice < higherPrice * 0.5) {
      if (validatedStockxPrice === lowerPrice) {
        validatedStockxPrice = undefined;
      }
      if (validatedEbayLowestPrice === lowerPrice) {
        validatedEbayLowestPrice = undefined;
      }
    }
  }

  const availablePrices = [validatedStockxPrice, validatedEbayLowestPrice].filter(
    (price): price is number => price !== undefined
  );

  const lowestPrice = availablePrices.length > 0 ? Math.min(...availablePrices) : undefined;

  return { stockxPrice: validatedStockxPrice, ebayLowestPrice: validatedEbayLowestPrice, lowestPrice };
};
