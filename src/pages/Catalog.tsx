import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { VariantCard } from '@/components/VariantCard';
import { SearchFilters } from '@/components/SearchFilters';
import { useVariantFilters } from '@/hooks/useVariantFilters';
import { Package } from 'lucide-react';
import { Variant } from '@/types/variant';
import { getAllVariants, initializeVariants } from '@/data/variantManager';
import { getPopularVariants } from '@/lib/api';
import { Link, useLocation } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getCollection } from '@/lib/collection';

interface CatalogPageProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const CatalogPage = ({ searchQuery, setSearchQuery }: CatalogPageProps) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [popularVariantIds, setPopularVariantIds] = useState<Set<string>>(new Set());
  const [showCollectionStatus, setShowCollectionStatus] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('showCollectionStatus') === 'true';
    }
    return false;
  });
  const [userCollection, setUserCollection] = useState<Set<string>>(new Set());
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showCollectionStatus', String(showCollectionStatus));
    }
  }, [showCollectionStatus]);

  useEffect(() => {
    const loadVariantsAndPopularity = async () => {
      await initializeVariants();
      setVariants(getAllVariants());

      try {
        const popular = await getPopularVariants();
        const ids = new Set(popular.map(v => v.variantId));
        setPopularVariantIds(ids);
      } catch (error) {
        console.error("Error fetching popular variants:", error);
      }
    };
    loadVariantsAndPopularity();
  }, []);

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
      {/* Header is now handled by App.tsx */}

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* All Variants Section */}
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
              selectedRarity={selectedRarity}
              onRarityChange={setSelectedRarity}
              selectedSeries={selectedSeries}
              onSeriesChange={setSelectedSeries}
              sortBy={sortBy}
              onSortChange={setSortBy}
              allSeries={allSeries}
              showCollectionStatus={showCollectionStatus}
              onShowCollectionStatusChange={setShowCollectionStatus}
            />
          </div>

          {filteredVariants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVariants.map((variant) => (
                <VariantCard
                  key={variant.id}
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

        {/* Footer */}
        <footer className="text-center py-8 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Affiliate Disclosure:</strong> We may earn a commission from purchases made through our links.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Price data aggregated from Pop Mart, Amazon, eBay, StockX, and verified resellers.
            Updated every 30 minutes. All prices in USD unless noted.
          </p>
        </footer>
      </div>
    </div>
  );
};