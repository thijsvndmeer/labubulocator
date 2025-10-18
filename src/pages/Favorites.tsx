import { useState, useEffect } from 'react';
import { VariantCard } from '@/components/VariantCard';
import { useVariantFilters } from '@/hooks/useVariantFilters';
import { Heart, Share2 } from 'lucide-react';
import { Variant } from '@/types/variant';
import { getVariantBySku, initializeVariants } from '@/data/variantManager';
import { getFavorites } from '@/lib/favorites';
import { useToast } from '@/components/ui/use-toast';
import { SearchFilters } from '@/components/SearchFilters';
import { Button } from '@/components/ui/button';

export const FavoritesPage = () => {
  const [favoritedVariants, setFavoritedVariants] = useState<Variant[]>([]);
  const [totalFavoritesValue, setTotalFavoritesValue] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>(
    localStorage.getItem('favoritesSearchQuery') || ''
  );
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('favoritesSearchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const loadFavoritedVariants = async () => {
      await initializeVariants();
      const favoriteSkus = getFavorites();
      const variants = favoriteSkus.map(sku => getVariantBySku(sku)).filter(Boolean) as Variant[];
      setFavoritedVariants(variants.reverse());
      const totalValue = variants.reduce((sum, variant) => sum + (variant.estimatedValue || 0), 0);
      setTotalFavoritesValue(totalValue);
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
  } = useVariantFilters(favoritedVariants, searchQuery);

  const handleShare = async () => {
    const favoriteSkus = favoritedVariants.map(v => v.sku);
    const shareableLink = `${window.location.origin}/sharedfavorites?skus=${favoriteSkus.join(',')}`;
    try {
      await navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Favorites link copied!",
        description: "Share this link with others to show off your favorites.",
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Failed to copy link",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-16">
        <section>
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <h2 className="text-3xl font-bold">My Favorites</h2>
                <p className="text-muted-foreground">
                  {favoritedVariants.length} favorited Labubu variants.
                </p>
              </div>
            </div>
            {favoritedVariants.length > 0 && (
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Favorites
              </Button>
            )}
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
              <p className="text-muted-foreground">No favorited variants found.</p>
              <p className="text-muted-foreground">Click the heart icon on a variant's detail page to add it to your favorites.</p>
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
};