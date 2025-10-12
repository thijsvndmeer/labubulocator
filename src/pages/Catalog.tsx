import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { VariantCard } from '@/components/VariantCard';
import { SearchFilters } from '@/components/SearchFilters';
import { useVariantFilters } from '@/hooks/useVariantFilters';
import { Package } from 'lucide-react';
import { Variant } from '@/types/variant';
import { getAllVariants, initializeVariants } from '@/data/variantManager';
import { Link } from 'react-router-dom';

interface CatalogPageProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const CatalogPage = ({ searchQuery, setSearchQuery }: CatalogPageProps) => {
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    const loadVariants = async () => {
      await initializeVariants();
      setVariants(getAllVariants());
    };
    loadVariants();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-subtle">
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
            />
          </div>

          {filteredVariants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVariants.map((variant) => (
                <VariantCard key={variant.id} variant={variant} />
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