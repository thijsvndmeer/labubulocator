import { useState, useEffect, useMemo } from 'react';
import { VariantCard } from '@/components/VariantCard';
import { CardSkeleton } from '@/components/CardSkeleton';
import { useVariantFilters } from '@/hooks/useVariantFilters';
import { Heart, Share2 } from 'lucide-react';
import { getFavorites } from '@/lib/favorites';
import { useToast } from '@/components/ui/use-toast';
import { SearchFilters } from '@/components/SearchFilters';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Labubu } from '@labubu/common/src/types/labubu';
import { useQuery } from '@tanstack/react-query';
import { useConfig } from '@/providers/ConfigProvider';
import { MarketDataNotice } from '@/components/MarketDataNotice';

export const FavoritesPage = () => {
  const { copy } = useConfig();
  const { data: allVariants = [], isLoading, isFetching } = useQuery<Labubu[]>({
    queryKey: ['variants'],
    queryFn: () => api.labubus.get(),
    keepPreviousData: true,
  });

  const [favoriteSkus, setFavoriteSkus] = useState(getFavorites());

  useEffect(() => {
    const handleStorageChange = () => {
      setFavoriteSkus(getFavorites());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const favoritedVariants = useMemo(() => {
    return allVariants.filter(variant => favoriteSkus.includes(variant.sku)).reverse();
  }, [allVariants, favoriteSkus]);

  const [searchQuery, setSearchQuery] = useState<string>(
    localStorage.getItem('favoritesSearchQuery') || ''
  );
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('favoritesSearchQuery', searchQuery);
  }, [searchQuery]);

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

  const showSkeletons = isLoading;

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
                  {favoritedVariants.length} favorited {copy.pluralCollectible}.
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

          {showSkeletons ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: favoriteSkus.length || 4 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : filteredVariants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVariants.map((variant) => (
                <VariantCard key={variant.sku} variant={variant} />
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
        <p className="text-xs text-muted-foreground mt-4">
          <strong>Affiliate Disclosure:</strong> We may earn a commission from purchases made through these links. Prices and availability are subject to change.
        </p>
        <div className="mt-4 text-xs">
          <MarketDataNotice />
        </div>
        </footer>
      </div>
    </div>
  );
};
