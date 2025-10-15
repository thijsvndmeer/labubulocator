import { useState, useMemo, useEffect } from 'react';
import { Variant, Rarity } from '@/types/variant';
import { getPopularVariants } from '@/lib/api';
import { shuffleArray } from '@/lib/utils';

export const useVariantFilters = (variants: Variant[], searchQuery: string) => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('selectedRarity') as Rarity | 'all') || 'all';
    }
    return 'all';
  });
  const [selectedSeries, setSelectedSeries] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedSeries') || 'all';
    }
    return 'all';
  });
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sortBy') || 'newest';
    }
    return 'newest';
  });
  const [popularVariants, setPopularVariants] = useState<{ variantId: string; viewCount: number }[]>([]);
  const [randomOrderSkus, setRandomOrderSkus] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const storedOrder = sessionStorage.getItem('randomLabubuOrder');
      return storedOrder ? JSON.parse(storedOrder) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedRarity', selectedRarity);
    }
  }, [selectedRarity]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedSeries', selectedSeries);
    }
  }, [selectedSeries]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sortBy', sortBy);
    }
  }, [sortBy]);

  useEffect(() => {
    if (sortBy === 'most-popular') {
      const fetchPopularity = async () => {
        const data = await getPopularVariants();
        setPopularVariants(data);
      };
      fetchPopularity();
    }
  }, [sortBy]); // Refetch when sortBy changes, especially if it becomes 'most-popular'

  useEffect(() => {
    if (sortBy === 'random') {
      if (randomOrderSkus.length === 0 && variants.length > 0) {
        const shuffled = shuffleArray(variants.map(v => v.sku));
        setRandomOrderSkus(shuffled);
        sessionStorage.setItem('randomLabubuOrder', JSON.stringify(shuffled));
      } else if (randomOrderSkus.length > 0) {
        sessionStorage.setItem('randomLabubuOrder', JSON.stringify(randomOrderSkus));
      }
    } else {
      setRandomOrderSkus([]);
      sessionStorage.removeItem('randomLabubuOrder');
    }
  }, [sortBy, variants, randomOrderSkus]);

  const allSeries = useMemo(() => {
    const series = new Set(variants.map(v => v.series));
    return Array.from(series).sort();
  }, [variants]);

    const filteredVariants = useMemo(() => {

      let eligibleVariants = [...variants];

  

      // Apply rarity filter first

      if (selectedRarity !== 'all') {

        eligibleVariants = eligibleVariants.filter(v => v.rarity === selectedRarity);

      }

  

      // Apply series filter

      if (selectedSeries !== 'all') {

        eligibleVariants = eligibleVariants.filter(v => v.series === selectedSeries);

      }

  

          let searchPrioritizedVariants = [...eligibleVariants];

  

      

  

          // Function to apply sorting to a given array of variants

  

          const applySorting = (arr: Variant[]) => {

  

            switch (sortBy) {

  

              case 'price-low':

  

                arr.sort((a, b) => (a.estimatedValue || 0) - (b.estimatedValue || 0));

  

                break;

  

              case 'price-high':

  

                arr.sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0));

  

                break;

  

              case 'rarity': {

  

                const rarityOrder: Rarity[] = ['secret', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

  

                arr.sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));

  

                break;

  

              }

  

              case 'most-popular':

  

                arr.sort((a, b) => {

  

                  const aPopularity = popularVariants.findIndex(p => p.variantId === a.sku);

  

                  const bPopularity = popularVariants.findIndex(p => p.variantId === b.sku);

  

                  return (aPopularity === -1 ? Infinity : aPopularity) - (bPopularity === -1 ? Infinity : bPopularity);

  

                });

  

                break;

  

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

  

                // Keep original order or sort by a default if 'newest' is not defined

  

                break;

  

            }

  

            return arr;

  

          };

  

      

  

          // Apply search filter with prioritization

  

          if (searchQuery) {

  

                        const query = searchQuery.toLowerCase();

  

                        const exactNameMatches: Variant[] = [];

  

                        const partialNameMatches: Variant[] = [];

  

                        const exactSeriesMatches: Variant[] = [];

  

                        const partialSeriesMatches: Variant[] = [];

  

                        const exactSkuMatches: Variant[] = [];

  

                        const partialSkuOrVariantMatches: Variant[] = [];

  

                  

  

                        eligibleVariants.forEach(v => {

  

                          const nameLower = v.name.toLowerCase();

  

                          const seriesLower = v.series.toLowerCase();

  

                          const skuLower = v.sku.toLowerCase();

  

                          const variantLower = v.variant?.toLowerCase() || '';

  

                  

  

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

  

                  

  

                                  } else if (skuLower.startsWith(query) || variantLower.startsWith(query)) {

  

                  

  

                                    partialSkuOrVariantMatches.push(v);

  

                  

  

                                  }

  

                        });

  

                  

  

                              const seenSkus = new Set<string>();

  

                  

  

                              const combinedFiltered: Variant[] = [];

  

                  

  

                        

  

                  

  

                              const addUniqueAndSort = (arr: Variant[]) => {

  

                  

  

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

  

                  

  

                        

  

                  

  

                              searchPrioritizedVariants = combinedFiltered;

  

                  

  

                            } else {

  

                  

  

                              // If no search query, just apply general sorting to eligible variants

  

                  

  

                              searchPrioritizedVariants = applySorting(eligibleVariants);

  

                  

  

                            }

  

                  

  

                        

  

                  

  

                            return searchPrioritizedVariants;

  

                  

  

                          }, [variants, searchQuery, selectedRarity, selectedSeries, sortBy, popularVariants, randomOrderSkus]);

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
