import { useState, useMemo, useEffect } from 'react';
import { Variant, Rarity } from '@/types/variant';
import { getPopularVariants } from '@/lib/api';

export const useVariantFilters = (variants: Variant[], searchQuery: string) => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>('all');
  const [selectedSeries, setSelectedSeries] = useState('all');
  const [sortBy, setSortBy] = useState('most-popular');
  const [popularVariants, setPopularVariants] = useState<{ variantId: string; viewCount: number }[]>([]);

  useEffect(() => {
    const fetchPopularity = async () => {
      const data = await getPopularVariants();
      setPopularVariants(data);
    };
    fetchPopularity();
  }, [sortBy]); // Refetch when sortBy changes, especially if it becomes 'most-popular'

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
        filtered.sort((a, b) => (a.estimatedValue || 0) - (b.estimatedValue || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0));
        break;
      case 'rarity': {
        const rarityOrder: Rarity[] = ['secret', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
        filtered.sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));
        break;
      }
      case 'most-popular':
        // Sort by popularVariants order
        filtered.sort((a, b) => {
          const aPopularity = popularVariants.findIndex(p => p.variantId === a.sku);
          const bPopularity = popularVariants.findIndex(p => p.variantId === b.sku);
          // If a variant is not in popularVariants, treat its popularity as very low
          return (aPopularity === -1 ? Infinity : aPopularity) - (bPopularity === -1 ? Infinity : bPopularity);
        });
        break;
      case 'newest':
      default:
        // Keep original order or sort by a default if 'newest' is not defined
        break;
    }

    return filtered;
  }, [variants, searchQuery, selectedRarity, selectedSeries, sortBy, popularVariants]);

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
