
export interface PriceEntry {
    price: number;
    date: Date;
}

export interface PriceHistory {
    history: PriceEntry[]
}