import { useState, useEffect } from 'react';
import { VariantCard } from '@/components/VariantCard';
import { CardSkeleton } from '@/components/CardSkeleton';
import { SearchFilters } from '@/components/SearchFilters';
import { useVariantFilters } from '@/hooks/useVariantFilters';
import { Package } from 'lucide-react';
import { api } from '@/lib/api';
import { useLocation } from 'react-router-dom';
import { getCollection } from '@/lib/collection';
import { Labubu } from '@labubu/common';
import { useQuery } from '@tanstack/react-query';
import { useConfig } from '@/context/ConfigContext';

interface CatalogPageProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const CatalogPage = ({ searchQuery, setSearchQuery }: CatalogPageProps) => {
  const { layout } = useConfig();
  const { data: variants = [], isLoading, isFetching } = useQuery<Labubu[]>({
    queryKey: ['variants'],
    queryFn: () => api.labubus.get(),
    placeholderData: (previousData) => previousData,
  });

  const [popularVariantIds, setPopularVariantIds] = useState<Set<string>>(new Set());
  const [showCollectionStatus, setShowCollectionStatus] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('showCollectionStatus');
      if (stored !== null) return stored === 'true';
    }
    return layout.cards.showCollectionStatus;
  });
  const [userCollection, setUserCollection] = useState<Set<string>>(new Set());
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showCollectionStatus', String(showCollectionStatus));
    }
  }, [showCollectionStatus]);

  useEffect(() => {
    setUserCollection(new Set(getCollection()));
  }, [showCollectionStatus]);

  const {
    filteredVariants,
    selectedRarity,
    setSelectedRarity,
    selectedSeries,
    setSelectedSeries,
    sortBy,
    setSortBy,
    allSeries
  } = useVariantFilters(variants, searchQuery);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const series = params.get('series');
    if (series) {
      setSelectedSeries(series);
    }
  }, [location.search, setSelectedSeries]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-16">
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Complete Catalog</h2>
              <p className="text-muted-foreground">
                Tracking {variants.length} Labubu variants across all series
              </p>
            </div>
          </div>

          <div className="mb-8">
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedRarity={selectedRarity as any}
              onRarityChange={setSelectedRarity as any}
              selectedSeries={selectedSeries}
              onSeriesChange={setSelectedSeries}
              sortBy={sortBy}
              onSortChange={setSortBy}
              allSeries={allSeries}
              showCollectionStatus={showCollectionStatus}
              onShowCollectionStatusChange={setShowCollectionStatus}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : filteredVariants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVariants.map((variant) => (
                <VariantCard
                  key={variant.sku}
                  variant={variant}
                  isPopular={popularVariantIds.has(variant.sku)}
                  showCollectionStatus={showCollectionStatus}
                  isCollected={userCollection.has(variant.sku)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No variants found matching your filters.</p>
            </div>
          )}
        </section>

        <footer className="text-center py-8 border-t">
          <p className="text-xs text-muted-foreground mt-4">
            <strong>Affiliate Disclosure:</strong> We may earn a commission from purchases made through these links.
            Prices and availability are subject to change.
            <br></br>
            <br></br>Estimated values shown on Labubu Locator are generated using an algorithm that analyzes historical sales, current listings, and market trends. These figures are approximations and not guaranteed market prices.
            <br></br>
            <br></br>
            StockX prices are algorithmically estimated. Labubu Locator does not communicate with or receive data directly from StockX. eBay data is retrieved via the official eBay Browse API.
            <br></br>
            <br></br>
            While we strive for accuracy, estimates may vary due to limited data, market volatility, item uniqueness, or other factors. Values provided are for informational purposes only and should not be relied upon as financial or investment advice.
          </p>
        </footer>
      </div>
    </div>
  );
};
