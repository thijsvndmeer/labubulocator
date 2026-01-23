import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RarityBadge } from '@/components/RarityBadge';

import { StockStatusBadge } from '@/components/StockStatusBadge';
import { PriceComparison } from '@/components/PriceComparison';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Heart, ExternalLink, Package, Tag, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { api, API_ROOT_URL } from '@/lib/api';
import { isFavorite, addFavorite, removeFavorite } from '@/lib/favorites';
import { isCollected, addCollection, removeCollection } from '@/lib/collection';
import { Labubu, Listing } from '@labubu/common';
import { BackendStartupMessage } from '@/components/BackendStartupMessage';

export default function VariantDetail() {
  const navigate = useNavigate();
  const { sku } = useParams();
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isCollectedState, setIsCollectedState] = useState<boolean>(false);

  const { data: variant, isLoading: isLoadingVariant, isFetching: isFetchingVariant, refetch: refetchVariant, isError } = useQuery({
    queryKey: ['variant', sku],
    queryFn: async () => {
      if (!sku) throw new Error('SKU is required');
      const baseVariantData = await api.labubus.getBySku(sku);
      return baseVariantData;
    },
    enabled: !!sku,
  });

  useEffect(() => {
    if (variant) {
      setIsFavorited(isFavorite((variant as Labubu).sku));
      setIsCollectedState(isCollected((variant as Labubu).sku));
    }
  }, [variant]);

  const handleFavoriteToggle = () => {
    if (!variant) return;
    const v = variant as Labubu;
    if (isFavorited) {
      removeFavorite(v.sku);
    } else {
      addFavorite(v.sku);
    }
    setIsFavorited(!isFavorited);
  };

  const handleCollectionToggle = () => {
    if (!variant) return;
    const v = variant as Labubu;
    if (isCollectedState) {
      removeCollection(v.sku);
    } else {
      addCollection(v.sku);
    }
    setIsCollectedState(!isCollectedState);
  };

  const { data: listings, isFetching: isFetchingListings } = useQuery({
    queryKey: ['listings', sku],
    queryFn: () => api.listings.get({ filter: { labubuSku: sku } }),
    enabled: !!sku && !!variant,
    refetchInterval: 30000,
  });



  const isRefreshing = isFetchingVariant || isFetchingListings;

  const mergedVariant = useMemo(() => {
    if (!variant) return null;
    const v = variant as Labubu;
    const l = listings as Listing[] | undefined;
    return {
      ...v,
      estimatedValue: l?.[0]?.currentPrice || v.estimatedValue,
    };
  }, [variant, listings]);

  const hasStockxSource = !!mergedVariant?.kicksdevId;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isError) {
    return <BackendStartupMessage />;
  }

  if (isLoadingVariant && !mergedVariant) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-24 mb-6" /> {/* Go Back button */}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Skeleton */}
            <Card className="overflow-hidden">
              <div className="aspect-square bg-muted p-8">
                <Skeleton className="h-full w-full" />
              </div>
            </Card>

            {/* Details Skeleton */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-10 w-3/4" /> {/* Title */}
                    <Skeleton className="h-6 w-1/2" /> {/* Series */}
                    <Skeleton className="h-5 w-1/3" /> {/* Variant */}
                  </div>
                  <Skeleton className="h-8 w-20" /> {/* RarityBadge */}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Skeleton className="h-6 w-24" /> {/* SKU Badge */}
                  <Skeleton className="h-6 w-28" /> {/* StockStatusBadge */}
                </div>
              </div>

              <Skeleton className="h-20 w-full" /> {/* Description */}

              {/* Price Info Skeleton */}
              <Card className="p-6 bg-gradient-primary">
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-40 mb-1" /> {/* Estimated Market Value label */}
                    <div className="flex items-baseline gap-3">
                      <Skeleton className="h-10 w-32" /> {/* Estimated Market Value */}
                      <Skeleton className="h-5 w-24" /> {/* Floor Price */}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <Skeleton className="h-5 w-20" /> {/* MSRP */}
                    <Skeleton className="h-5 w-24" /> {/* Last Sale */}
                  </div>

                  <Skeleton className="h-5 w-48" /> {/* Confidence Score */}
                </div>
              </Card>

              {/* Action Buttons Skeleton */}
              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-12" />
              </div>


            </div>
          </div>


        </div>
      </div>
    );
  }

  if (!mergedVariant && !isLoadingVariant) {
    return (
      <div className="min-h-screen">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Variant not found</h1>
            <Button onClick={() => navigate(-1)}>Back</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!mergedVariant) {
    return null; // Should not happen based on the logic above, but as a safeguard.
  }



  return (
    <div className="min-h-screen">
      {isRefreshing && (
        <div className="fixed top-4 right-4 z-50">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <Card className="overflow-hidden">
            <div className="aspect-square bg-muted p-8">
              <img
                src={`${API_ROOT_URL}/images/${mergedVariant.sku}.png`}
                alt={mergedVariant.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </Card>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-1">{mergedVariant.name}</h1>
                  <Link to={`/catalog?series=${encodeURIComponent(mergedVariant.series)}`} className="text-lg text-muted-foreground hover:text-primary transition-colors">
                    {mergedVariant.series}
                  </Link>
                  {mergedVariant.variant && (
                    <p className="text-sm text-muted-foreground">{mergedVariant.variant}</p>
                  )}
                </div>
                <RarityBadge rarity={mergedVariant.rarity as any} />
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="font-mono">
                  <Tag className="h-3 w-3 mr-1" />
                  {mergedVariant.sku}
                </Badge>
                <StockStatusBadge status={mergedVariant.stockStatus as any} />
              </div>
            </div>

            <p className="text-muted-foreground">{mergedVariant.description}</p>



            {/* Price Info */}

            <Card className="p-6 bg-gradient-primary relative">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-primary-foreground/80 mb-1">Estimated Market Value</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary-foreground">
                      {typeof mergedVariant.estimatedValue === 'number' ? `$${mergedVariant.estimatedValue.toFixed(2)}` : '--.--'}
                    </span>
                    <span className="text-sm text-primary-foreground/80">
                      Floor: {typeof mergedVariant.lowestPrice === 'number' ? `$${mergedVariant.lowestPrice.toFixed(2)}` : '--.--'}
                    </span>
                  </div>
                </div>

                {mergedVariant.priceRange && (
                  <div className="flex items-center gap-4 text-sm text-primary-foreground/90">
                    <div>
                      <span className="text-primary-foreground/70">Past Week Range: </span>
                      <span className="font-semibold">{typeof mergedVariant.priceRange.low === 'number' ? `$${mergedVariant.priceRange.low.toFixed(2)}` : '--.--'} - {typeof mergedVariant.priceRange.high === 'number' ? `$${mergedVariant.priceRange.high.toFixed(2)}` : '--.--'}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-primary-foreground/90">
                  <div>
                    <span className="text-primary-foreground/70">MSRP: </span>
                    <span className="font-semibold">{typeof mergedVariant.msrp === 'number' ? `$${mergedVariant.msrp.toFixed(2)}` : '--.--'}</span>
                  </div>
                </div>


              </div>
            </Card>



            {/* Action Buttons */}

            <div className="flex gap-3">

              {mergedVariant.affiliateLinks && mergedVariant.affiliateLinks.slice(0, 2).map((link) => (

                <Button key={link.id} size="lg" className="flex-1" asChild>

                  <a href={link.url} target="_blank" rel="noopener noreferrer">

                    {link.displayName}

                    <ExternalLink className="h-4 w-4 ml-2" />

                  </a>

                </Button>

              ))}

            </div>



            {/* StockX and eBay Windows */}
            <div className={`grid grid-cols-1 ${typeof mergedVariant.stockxPrice === 'number' && mergedVariant.kicksdevId ? 'md:grid-cols-2' : ''} gap-4`}>
              {/* StockX Window */}
              {typeof mergedVariant.stockxPrice === 'number' && mergedVariant.kicksdevId && (
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">StockX</h4>
                    {mergedVariant.msrp && mergedVariant.stockxPrice && (
                      <span className={`text-sm font-medium text-gray-500`}>
                        {typeof mergedVariant.stockxPrice === 'number' && typeof mergedVariant.msrp === 'number' ? `${((mergedVariant.stockxPrice - mergedVariant.msrp) / mergedVariant.msrp * 100).toFixed(0)}% vs MSRP` : '--.--'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{typeof mergedVariant.stockxPrice === 'number' ? `$${mergedVariant.stockxPrice.toFixed(2)}` : '--.--'}</span>
                    <Button size="sm" asChild>
                      <a href={`https://stockx.com/${mergedVariant.kicksdevId}`} target="_blank" rel="noopener noreferrer">
                        View on StockX
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </Card>
              )}

              {/* eBay Window */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">eBay</h4>
                  {mergedVariant.msrp && mergedVariant.ebayLowestPrice && (
                    <span className={`text-sm font-medium text-gray-500`}>
                      {((mergedVariant.ebayLowestPrice - mergedVariant.msrp) / mergedVariant.msrp * 100).toFixed(0)}% vs MSRP
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{typeof mergedVariant.ebayLowestPrice === 'number' ? `$${mergedVariant.ebayLowestPrice.toFixed(2)}` : 'Not Found'}</span>
                  <Button size="sm" asChild>
                    <a href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent((mergedVariant.name || '') + ' labubu')}&_sacat=246&LH_ItemCondition=1000&_sop=15&mkcid=1&mkrid=711-53200-19255-0&siteid=0&numpt=0&toolid=10001&campid=5339126898&customid=&mkevt=1`} target="_blank" rel="noopener noreferrer">
                      Search on eBay
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </Card>
            </div>



            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleFavoriteToggle}
                className={`flex-1 ${isFavorited ? 'text-red-500 hover:text-red-600' : ''}`}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                Favorite
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleCollectionToggle}
                className={`flex-1 ${isCollectedState ? 'text-blue-500 hover:text-blue-600' : ''}`}
              >
                <Package className={`h-4 w-4 mr-2 ${isCollectedState ? 'fill-current' : ''}`} />
                Collection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}