import { Variant } from '@/types/variant';
import labubuClassic from '@/assets/labubu-classic.jpg';
import labubuSparkle from '@/assets/labubu-sparkle.jpg';
import labubuGold from '@/assets/labubu-gold.jpg';
import labubuGlow from '@/assets/labubu-glow.jpg';

export const mockVariants: Variant[] = [
  {
    id: '1',
    name: 'Classic Labubu',
    series: 'The Monsters Series 1',
    sku: 'LAB-001',
    rarity: 'common',
    images: [labubuClassic],
    estimatedValue: 45.00,
    priceRange: { low: 38.00, high: 52.00 },
    confidenceScore: 92,
    recentSales: [
      { source: 'eBay', price: 45.00, currency: 'USD', date: '2025-09-28', url: '#' },
      { source: 'Mercari', price: 42.00, currency: 'USD', date: '2025-09-25', url: '#' },
      { source: 'eBay', price: 48.00, currency: 'USD', date: '2025-09-22', url: '#' },
    ],
    priceHistory: [
      { date: '2025-08', median30d: 43.00, median90d: 41.00, median365d: 40.00, volume: 156 },
      { date: '2025-09', median30d: 45.00, median90d: 43.00, median365d: 42.00, volume: 178 },
    ],
  },
  {
    id: '2',
    name: 'Sparkle Edition',
    series: 'Sweet Dream Series',
    sku: 'LAB-089',
    rarity: 'rare',
    images: [labubuSparkle],
    estimatedValue: 125.00,
    priceRange: { low: 95.00, high: 155.00 },
    confidenceScore: 85,
    recentSales: [
      { source: 'eBay', price: 120.00, currency: 'USD', date: '2025-09-27', url: '#' },
      { source: 'Pop Mart', price: 128.00, currency: 'USD', date: '2025-09-20', url: '#' },
    ],
    priceHistory: [
      { date: '2025-08', median30d: 115.00, median90d: 110.00, median365d: 105.00, volume: 42 },
      { date: '2025-09', median30d: 125.00, median90d: 118.00, median365d: 112.00, volume: 38 },
    ],
  },
  {
    id: '3',
    name: 'Golden Crown',
    series: 'Royal Series',
    sku: 'LAB-ROYAL-01',
    rarity: 'legendary',
    images: [labubuGold],
    estimatedValue: 380.00,
    priceRange: { low: 320.00, high: 450.00 },
    confidenceScore: 78,
    recentSales: [
      { source: 'eBay', price: 375.00, currency: 'USD', date: '2025-09-26', url: '#' },
      { source: 'Grailed', price: 390.00, currency: 'USD', date: '2025-09-18', url: '#' },
    ],
    priceHistory: [
      { date: '2025-08', median30d: 360.00, median90d: 350.00, median365d: 340.00, volume: 12 },
      { date: '2025-09', median30d: 380.00, median90d: 365.00, median365d: 355.00, volume: 9 },
    ],
  },
  {
    id: '4',
    name: 'Moonlight Glow',
    series: 'Lunar Eclipse Collection',
    sku: 'LAB-SECRET-03',
    rarity: 'secret',
    images: [labubuGlow],
    estimatedValue: 650.00,
    priceRange: { low: 520.00, high: 780.00 },
    confidenceScore: 68,
    recentSales: [
      { source: 'StockX', price: 650.00, currency: 'USD', date: '2025-09-24', url: '#' },
      { source: 'eBay', price: 620.00, currency: 'USD', date: '2025-09-10', url: '#' },
    ],
    priceHistory: [
      { date: '2025-08', median30d: 600.00, median90d: 580.00, median365d: 550.00, volume: 5 },
      { date: '2025-09', median30d: 650.00, median90d: 615.00, median365d: 590.00, volume: 4 },
    ],
  },
];
