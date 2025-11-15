import { useEffect, useState, useMemo } from 'react';
import { getCollection } from '@/lib/collection';
import { useLocation } from 'react-router-dom';
import { Share2, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { SearchFilters } from '@/components/SearchFilters';
import { useVariantFilters } from '@/hooks/useVariantFilters';
import { VariantCard } from '@/components/VariantCard';
import { CardSkeleton } from '@/components/CardSkeleton';
import { api } from '@/lib/api';
import { Variant } from '@labubu/common';
import { useQuery } from '@tanstack/react-query';

export default function Collection() {
  const { data: allVariants = [], isLoading, isFetching } = useQuery<Variant[]>({
    queryKey: ['variants'],
    queryFn: () => api.labubus.get(),
    keepPreviousData: true,
  });

  const [collectionSkus, setCollectionSkus] = useState(getCollection());

  useEffect(() => {
    const handleStorageChange = () => {
      setCollectionSkus(getCollection());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const collectedVariants = useMemo(() => {
    return allVariants.filter(variant => collectionSkus.includes(variant.sku));
  }, [allVariants, collectionSkus]);

  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('collectionSearchQuery') || '';
    }
    return '';
  });
  const { toast } = useToast();

  const handleShare = async () => {
    const shareableLink = `${window.location.origin}/sharedcollection?skus=${collectionSkus.join(',')}`;
    try {
      await navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Collection link copied!",
        description: "Share this link with others to show off your collection.",
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('collectionSearchQuery', searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
    } else {
      const storedSearchQuery = localStorage.getItem('collectionSearchQuery');
      if (!storedSearchQuery) {
        setSearchQuery('');
      }
    }
  }, [location.search, setSearchQuery]);

  const { 
    filteredVariants, 
    selectedRarity, 
    setSelectedRarity, 
    selectedSeries, 
    setSelectedSeries, 
    sortBy, 
    setSortBy, 
    allSeries 
  } = useVariantFilters(collectedVariants, searchQuery);

  const showSkeletons = isLoading;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-16">
        <section>
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <Boxes className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Your Collection</h2>
                <p className="text-muted-foreground">
                  {collectedVariants.length} collected variants.
                </p>
              </div>
            </div>
            {collectedVariants.length > 0 && (
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Collection
              </Button>
            )}
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
            />
          </div>

          {showSkeletons ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: collectionSkus.length || 8 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : filteredVariants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No variants found in your collection matching the current filters.</p>
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
}