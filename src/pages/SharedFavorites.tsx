import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { SearchFilters } from '@/components/SearchFilters';
import { useVariantFilters } from '@/hooks/useVariantFilters';
import { VariantCard } from '@/components/VariantCard';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { Labubu } from '@labubu/common/src/types/labubu';

export default function SharedFavorites() {
  const [favoritedVariants, setFavoritedVariants] = useState<Labubu[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery("");
    }
  }, [location.search]);

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      try {
        const allVariants = await api.labubus.get();
        const params = new URLSearchParams(location.search);
        const sharedSkusParam = params.get("skus");
        let skusToLoad: string[] = [];

        if (sharedSkusParam) {
          skusToLoad = sharedSkusParam.split(',');
        }

        const variants = allVariants.filter(variant => skusToLoad.includes(variant.sku));
        setFavoritedVariants(variants);
      } catch (error) {
        console.error('Favorites: Error loading favorites:', error);
        setFavoritedVariants([]);
      }
      setIsLoading(false);
    };
    loadFavorites();
  }, [location.search]);

  const { 
    filteredVariants, 
    selectedRarity, 
    setSelectedRarity, 
    selectedSeries, 
    setSelectedSeries, 
    sortBy, 
    setSortBy, 
    allSeries 
  } = useVariantFilters(favoritedVariants, searchQuery);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12 space-y-16">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <h2 className="text-3xl font-bold">Shared Favorites</h2>
                <p className="text-muted-foreground">Loading shared Labubu variants...</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="h-64 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-16">
        <section>
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <h2 className="text-3xl font-bold">Shared Favorites</h2>
                <p className="text-muted-foreground">
                  {favoritedVariants.length} shared Labubu variants.
                </p>
              </div>
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

          {filteredVariants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No Labubus found in this shared favorite list matching the current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVariants.map((variant) => (
                <VariantCard key={variant.sku} variant={variant} />
              ))}
            </div>
          )}
        </section>

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
}