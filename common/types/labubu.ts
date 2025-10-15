
export interface Labubu {
    sku: string;
    name: string;
    series: string;
    rarity: string | null;
    image: string | null;
    description: string | null;
    msrp: number | null;
}

export interface Listing {
    labubu_sku: string;
    vendor_name: string;
    product_url: string;
    listing_title: string;
    last_checked_at: Date | null;
    in_stock: boolean;
}

export interface PriceEntry {
    price: number;
    date: Date;
}