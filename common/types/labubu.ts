
export interface PriceEntry {
    price: number;
    date: Date;
}

export interface PriceHistory {
    history: PriceEntry[]
}

export interface Labubu {
    sku: string;
    name: string;
    series: string;
    rarity: string | null;
    image: string | null;
    description: string | null;
    msrp: number | null;
}