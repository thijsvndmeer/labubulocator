import { useState, useMemo } from 'react';
import { Variant, Rarity } from '@/types/variant';

export const useVariantFilters = (variants: Variant[], searchQuery: string) => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>('all');
  const [selectedSeries, setSelectedSeries] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  const allSeries = useMemo(() => {
    const series = new Set(variants.map(v => v.series));
    return Array.from(series).sort();
  }, [variants]);

  const filteredVariants = useMemo(() => {
    let filtered = [...variants];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(query) ||
        v.series.toLowerCase().includes(query) ||
        v.sku.toLowerCase().includes(query) ||
        v.variant?.toLowerCase().includes(query)
      );
    }

    // Rarity filter
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(v => v.rarity === selectedRarity);
    }

    // Series filter
    if (selectedSeries !== 'all') {
      filtered = filtered.filter(v => v.series === selectedSeries);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.estimatedValue - b.estimatedValue);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.estimatedValue - a.estimatedValue);
        break;
      case 'rarity':
        const rarityOrder: Rarity[] = ['secret', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
        filtered.sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));
        break;
      case 'trending':
        filtered.sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h));
        break;
      case 'newest':
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [variants, searchQuery, selectedRarity, selectedSeries, sortBy]);

  return {
    filteredVariants,
    selectedRarity,
    setSelectedRarity,
    selectedSeries,
    setSelectedSeries,
    sortBy,
    setSortBy,
    allSeries,
  };
};
