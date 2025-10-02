export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'secret';

export interface Variant {
  id: string;
  name: string;
  series: string;
  sku: string;
  rarity: Rarity;
  images: string[];
  estimatedValue: number;
  priceRange: {
    low: number;
    high: number;
  };
  confidenceScore: number;
  recentSales: Sale[];
  priceHistory: PriceSnapshot[];
}

export interface Sale {
  source: string;
  price: number;
  currency: string;
  date: string;
  url: string;
}

export interface PriceSnapshot {
  date: string;
  median30d: number;
  median90d: number;
  median365d: number;
  volume: number;
}
