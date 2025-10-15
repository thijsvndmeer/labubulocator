import { useState, useEffect } from 'react';
import { VariantCard } from '@/components/VariantCard';
import { useVariantFilters } from '@/hooks/useVariantFilters';
import { Heart } from 'lucide-react';
import { Variant } from '@/types/variant';
import { getVariantBySku, initializeVariants } from '@/data/variantManager';
import { getFavorites } from '@/lib/favorites';

export const FavoritesPage = () => {
  const [favoritedVariants, setFavoritedVariants] = useState<Variant[]>([]);

  useEffect(() => {
    const loadFavoritedVariants = async () => {
      await initializeVariants();
      const favoriteSkus = getFavorites();
      const variants = favoriteSkus.map(sku => getVariantBySku(sku)).filter(Boolean) as Variant[];
      setFavoritedVariants(variants.reverse());
    };

    loadFavoritedVariants();

    const handleStorageChange = () => {
      loadFavoritedVariants();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
  } = useVariantFilters(favoritedVariants, ''); // Pass favoritedVariants and empty search query

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* My Favorites Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-red-500" />
            <div>
              <h2 className="text-3xl font-bold">My Favorites</h2>
              <p className="text-muted-foreground">
                {favoritedVariants.length} favorited Labubu variants
              </p>
            </div>
          </div>

          {/* SearchFilters are not needed for favorites, but we can keep the useVariantFilters hook for sorting/filtering if desired */}
          {/* If we want to allow filtering/sorting of favorites, we would re-introduce SearchFilters here */}

          {filteredVariants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVariants.map((variant) => (
                <VariantCard key={variant.id} variant={variant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No favorited variants found.</p>
              <p className="text-muted-foreground">Click the heart icon on a variant's detail page to add it to your favorites.</p>
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