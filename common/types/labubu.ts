
export interface Labubu {
    sku: string;
    name: string;
    series: string;
    rarity: string | null;
    image: string | null;
    description: string | null;
    msrp: number | null;
    lowestPrice: number | null;
}

export interface Listing {
    labubu_sku: string;
    vendorName: string;
    productUrl: string;
    listingTitle: string;
    currentPrice: number | null;
    inStock: boolean;
    lastCheckedAt: Date | null;
}

export interface PriceEntry {
    price: number;
    date: Date;
}