export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'secret';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order' | 'discontinued';

export interface PriceSource {
  source: string;
  price: number;
  currency: string;
  timestamp: string;
  url:string;
  inStock: boolean;
}

export interface PriceData {
  site: string;
  price: number;
  url: string;
}
export interface AffiliateLink {
  network: string;
  url: string;
  id: string;
  displayName: string;
}

export interface Variant {
  name: string;
  series: string;
  variant?: string;
  sku: string;
  rarity: Rarity;
  images: string[];
  description: string;
  msrp: number;
  retailUrl: string;
  lastSalePrice?: number;
  floorPrice?: number;
  priceSources?: PriceData[];
  affiliateLinks: AffiliateLink[];
  stockStatus: StockStatus;
  attributes: Record<string, string>;
  estimatedValue?: number;
  priceRange?: {
    low: number;
    high: number;
  };
  confidenceScore?: number;
  priceChange24h?: number;
  recentSales?: Sale[];
  priceHistory?: PriceSnapshot[];
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
