import { useState, useMemo, useEffect } from 'react';
import { Labubu } from '@labubu/common/src/types/labubu';
import { shuffleArray } from '@/lib/utils';

export const useVariantFilters = (variants: Labubu[], searchQuery: string) => {
  const [selectedRarity, setSelectedRarity] = useState<string | 'all'>('all');
  const [selectedSeries, setSelectedSeries] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [randomOrderSkus, setRandomOrderSkus] = useState<string[]>([]);

  useEffect(() => {
    if (sortBy === 'random') {
      if (randomOrderSkus.length === 0 && variants.length > 0) {
        const shuffled = shuffleArray(variants.map(v => v.sku));
        setRandomOrderSkus(shuffled);
      }
    }
  }, [sortBy, variants, randomOrderSkus]);

  const allSeries = useMemo(() => {
    const series: string[] = [];
    const seenSeries = new Set<string>();
    variants.forEach(v => {
      if (!seenSeries.has(v.series)) {
        series.push(v.series);
        seenSeries.add(v.series);
      }
    });
    return series;
  }, [variants]);

  const filteredVariants = useMemo(() => {
    let eligibleVariants = [...variants];

    if (selectedRarity !== 'all') {
      eligibleVariants = eligibleVariants.filter(v => v.rarity === selectedRarity);
    }

    if (selectedSeries !== 'all') {
      eligibleVariants = eligibleVariants.filter(v => v.series === selectedSeries);
    }

    const applySorting = (arr: Labubu[]) => {
      switch (sortBy) {
        case 'price-low':
          arr.sort((a, b) => (a.lowestPrice || 0) - (b.lowestPrice || 0));
          break;
        case 'price-high':
          arr.sort((a, b) => (b.lowestPrice || 0) - (a.lowestPrice || 0));
          break;
        case 'rarity': {
          const rarityOrder: string[] = ['secret', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
          arr.sort((a, b) => rarityOrder.indexOf(a.rarity!) - rarityOrder.indexOf(b.rarity!));
          break;
        }
        case 'random':
          if (randomOrderSkus.length > 0) {
            const orderMap = new Map(randomOrderSkus.map((sku, index) => [sku, index]));
            arr.sort((a, b) => {
              const aIndex = orderMap.get(a.sku);
              const bIndex = orderMap.get(b.sku);
              if (aIndex === undefined || bIndex === undefined) return 0;
              return aIndex - bIndex;
            });
          }
          break;
        case 'newest':
        default:
          break;
      }
      return arr;
    };

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const exactNameMatches: Labubu[] = [];
      const partialNameMatches: Labubu[] = [];
      const exactSeriesMatches: Labubu[] = [];
      const partialSeriesMatches: Labubu[] = [];
      const exactSkuMatches: Labubu[] = [];
      const partialSkuOrVariantMatches: Labubu[] = [];

      eligibleVariants.forEach(v => {
        const nameLower = v.name.toLowerCase();
        const seriesLower = v.series.toLowerCase();
        const skuLower = v.sku.toLowerCase();

        if (nameLower === query) {
          exactNameMatches.push(v);
        } else if (nameLower.startsWith(query)) {
          partialNameMatches.push(v);
        } else if (seriesLower === query) {
          exactSeriesMatches.push(v);
        } else if (seriesLower.startsWith(query)) {
          partialSeriesMatches.push(v);
        } else if (skuLower === query) {
          exactSkuMatches.push(v);
        } else if (skuLower.startsWith(query)) {
          partialSkuOrVariantMatches.push(v);
        }
      });

      const seenSkus = new Set<string>();
      const combinedFiltered: Labubu[] = [];

      const addUniqueAndSort = (arr: Labubu[]) => {
        const sortedArr = applySorting(arr);
        sortedArr.forEach(v => {
          if (!seenSkus.has(v.sku)) {
            combinedFiltered.push(v);
            seenSkus.add(v.sku);
          }
        });
      };

      addUniqueAndSort(exactNameMatches);
      addUniqueAndSort(partialNameMatches);
      addUniqueAndSort(exactSeriesMatches);
      addUniqueAndSort(partialSeriesMatches);
      addUniqueAndSort(exactSkuMatches);
      addUniqueAndSort(partialSkuOrVariantMatches);

      return combinedFiltered;
    } else {
      return applySorting(eligibleVariants);
    }
  }, [variants, searchQuery, selectedRarity, selectedSeries, sortBy, randomOrderSkus]);

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
