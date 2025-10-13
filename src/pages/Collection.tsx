import { useEffect, useState } from 'react';
import { getCollection } from '@/lib/collection';
import { getVariantBySku, initializeVariants } from '@/data/variantManager';
import { Variant } from '@/types/variant';
import { Link, useLocation } from 'react-router-dom';
import { Share2, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { SearchFilters } from '@/components/SearchFilters';
import { useVariantFilters } from '@/hooks/useVariantFilters';
import { VariantCard } from '@/components/VariantCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Collection() {
  const [collectedVariants, setCollectedVariants] = useState<Variant[]>([]);
  const [totalCollectionValue, setTotalCollectionValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleShare = async () => {
    const collectionSkus = collectedVariants.map(v => v.sku);
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
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery("");
    }
  }, [location.search]);

  useEffect(() => {
    const loadCollection = async () => {
      setIsLoading(true);
      try {
        await initializeVariants();
        const params = new URLSearchParams(location.search);
        const sharedSkusParam = params.get("skus");
        let skusToLoad: string[] = [];

        if (sharedSkusParam) {
          skusToLoad = sharedSkusParam.split(',');
        } else {
          skusToLoad = getCollection();
        }

        console.log('Collection SKUs to load:', skusToLoad);
        const variants = skusToLoad.map(sku => {
          const foundVariant = getVariantBySku(sku);
          if (!foundVariant) {
            console.warn('Collection: Variant not found for SKU:', sku);
          }
          return foundVariant;
        }).filter(Boolean) as Variant[];
        console.log('Collected variants after filtering:', variants);
        setCollectedVariants(variants);
        const totalValue = variants.reduce((sum, variant) => sum + (variant.estimatedValue || 0), 0);
        setTotalCollectionValue(totalValue);
      } catch (error) {
        console.error('Collection: Error initializing variants or loading collection:', error);
        setCollectedVariants([]);
        setTotalCollectionValue(0);
      }
      setIsLoading(false);
    };
    loadCollection();
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
  } = useVariantFilters(collectedVariants, searchQuery);

  const getImageUrl = (variant: Variant) => {
    let skuToMatch = variant.sku.toLowerCase();

    if (skuToMatch.includes('lbb-bii-')) {
      skuToMatch = skuToMatch.replace('lbb-bii-', 'lbb-bie-');
    }

    const foundImagePath = Object.keys(assetImages).find(path => {
      const filename = path.split('/').pop()?.toLowerCase() || '';
      return filename.includes(skuToMatch);
    });

    if (foundImagePath && assetImages[foundImagePath]) {
      return assetImages[foundImagePath];
    }
    return '/placeholder.svg';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12 space-y-16">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Boxes className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Your Collection</h2>
                <p className="text-muted-foreground">Loading your collected Labubu variants...</p>
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
              <Boxes className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Your Collection</h2>
                <p className="text-muted-foreground">
                  {collectedVariants.length} collected Labubu variants. Estimated Value: <span className="font-bold text-primary">${totalCollectionValue.toFixed(2)}</span>
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
              <p className="text-muted-foreground">No Labubus found in your collection matching the current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVariants.map((variant) => (
                <VariantCard key={variant.sku} variant={variant} hideStockStatus={true} />
              ))}            </div>
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
  );}