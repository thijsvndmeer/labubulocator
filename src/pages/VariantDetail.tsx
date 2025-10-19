import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RarityBadge } from '@/components/RarityBadge';
import { ConfidenceScore } from '@/components/ConfidenceScore';
import { StockStatusBadge } from '@/components/StockStatusBadge';
import { PriceComparison } from '@/components/PriceComparison';
import { PriceHistoryChart } from '@/components/PriceHistoryChart';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Bell, Heart, ExternalLink, Package, Tag, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { isFavorite, addFavorite, removeFavorite } from '@/lib/favorites';
import { isCollected, addCollection, removeCollection } from '@/lib/collection';
import { Labubu, Listing, PriceEntry } from '@labubu/common/src/types/labubu';

const assetImages = import.meta.glob('/src/assets/**/*.png', { eager: true, query: '?url', import: 'default' });

export default function VariantDetail() {
  const navigate = useNavigate();
  const { sku } = useParams();
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isCollectedState, setIsCollectedState] = useState<boolean>(false);

  const { data: variant, isLoading: isLoadingVariant, isFetching: isFetchingVariant, refetch: refetchVariant } = useQuery({
    queryKey: ['variant', sku],
    queryFn: async () => {
      if (!sku) throw new Error('SKU is required');
      const baseVariantData = await api.labubus.getBySku(sku);
      return baseVariantData;
    },
    enabled: !!sku,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (variant) {
      setIsFavorited(isFavorite(variant.sku));
      setIsCollectedState(isCollected(variant.sku));
    }
  }, [variant]);

  const handleFavoriteToggle = () => {
    if (!variant) return;
    if (isFavorited) {
      removeFavorite(variant.sku);
    } else {
      addFavorite(variant.sku);
    }
    setIsFavorited(!isFavorited);
  };

  const handleCollectionToggle = () => {
    if (!variant) return;
    if (isCollectedState) {
      removeCollection(variant.sku);
    } else {
      addCollection(variant.sku);
    }
    setIsCollectedState(!isCollectedState);
  };

  const { data: listings, isFetching: isFetchingListings } = useQuery({
    queryKey: ['listings', sku],
    queryFn: () => api.listings.get({ filter: { labubuSku: sku } }),
    enabled: !!sku && !!variant,
    keepPreviousData: true,
    refetchInterval: 30000,
  });

  const { data: priceHistory, isFetching: isFetchingPriceHistory } = useQuery({
    queryKey: ['priceHistory', sku],
    queryFn: () => listings && listings.length > 0 ? api.listings.getPriceHistory(listings[0].id) : Promise.resolve([]),
    enabled: !!sku && !!variant && !!listings,
    keepPreviousData: true,
    refetchInterval: 30000,
  });

  const isRefreshing = isFetchingVariant || isFetchingListings || isFetchingPriceHistory;

  const mergedVariant = useMemo(() => {
    if (!variant) return null;
    return {
      ...variant,
      estimatedValue: listings?.[0]?.currentPrice || variant.estimatedValue,
      priceHistory: priceHistory || [],
    };
  }, [variant, listings, priceHistory]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

              {/* Attributes Skeleton */}
              <Card className="p-4">
                <Skeleton className="h-6 w-40 mb-3" /> {/* Product Details Header */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            </div>
          </div>

          {/* Price History Skeleton */}
          <Card className="mt-8 p-6">
            <Skeleton className="h-8 w-48 mb-4" /> {/* Price History Header */}
            <Skeleton className="h-64 w-full" /> {/* Chart area */}
          </Card>

          {/* Recent Sales Skeleton */}
          <Card className="mt-8 p-6">
            <Skeleton className="h-8 w-48 mb-4" /> {/* Recent Sales Header */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" /> {/* Table Header */}
              <Skeleton className="h-10 w-full" /> {/* Table Row 1 */}
              <Skeleton className="h-10 w-full" /> {/* Table Row 2 */}
              <Skeleton className="h-10 w-full" /> {/* Table Row 3 */}
            </div>
            <Skeleton className="h-4 w-3/4 mt-4" /> {/* Sales data aggregated text */}
          </Card>
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

  const getImageUrl = (variant: Labubu) => {
    let skuToMatch = variant.sku.toLowerCase();

    // Normalize SKU for 'Big Into Energy' series if necessary
    if (skuToMatch.includes('lbb-bii-')) {
      skuToMatch = skuToMatch.replace('lbb-bii-', 'lbb-bie-');
    }

    const foundImagePath = Object.keys(assetImages).find(path => {
      const filename = path.split('/').pop()?.toLowerCase() || '';
      return filename.includes(skuToMatch);
    });

    if (foundImagePath && assetImages[foundImagePath]) {
      return assetImages[foundImagePath] as string;
    }
    return variant.image || '/placeholder.svg';
  };

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
                src={getImageUrl(mergedVariant)}
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
                <RarityBadge rarity={mergedVariant.rarity} />
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="font-mono">
                  <Tag className="h-3 w-3 mr-1" />
                  {mergedVariant.sku}
                </Badge>
                <StockStatusBadge status={mergedVariant.stockStatus} />
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
                                  ${mergedVariant.estimatedValue?.toFixed(2) || '--.--'}
                                </span>
                                <span className="text-sm text-primary-foreground/80">
                                  Floor: ${mergedVariant.lowestPrice?.toFixed(2) || '--.--'}
                                </span>
                              </div>
                            </div>
          
                            <div className="flex items-center gap-4 text-sm text-primary-foreground/90">
                              <div>
                                <span className="text-primary-foreground/70">MSRP: </span>
                                <span className="font-semibold">${mergedVariant.msrp?.toFixed(2)}</span>
                              </div>
                            </div>
          
                            <ConfidenceScore score={mergedVariant.confidenceScore || 0} className="text-primary-foreground/90" />
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

            

                        <div className="flex gap-3">

                          <Button variant="outline" size="lg" className="flex-1">

                            <Bell className="h-4 w-4 mr-2" />

                            Watch This Variant

                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleFavoriteToggle}
                            className={isFavorited ? 'text-red-500 hover:text-red-600' : ''}
                          >
                            <Heart className={isFavorited ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCollectionToggle}
                            className={isCollectedState ? 'text-blue-500 hover:text-blue-600' : ''}
                          >
                            <Package className={isCollectedState ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                          </Button>
                        </div>

            

                        {/* Attributes */}

                        <Card className="p-4">

                          <h3 className="font-semibold mb-3 flex items-center gap-2">

                            <Package className="h-4 w-4" />

                            Product Details

                          </h3>

                          <div className="grid grid-cols-2 gap-3 text-sm">

                            {mergedVariant.attributes && Object.entries(mergedVariant.attributes).map(([key, value]) => (

                              <div key={key}>

                                                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                                <span className="font-medium">{value}</span>

                              </div>

                            ))}

                          </div>

                        </Card>

                      </div>

                    </div>

            

                    {/* Price History */}

                    <div className="mt-8">
                      <PriceHistoryChart history={mergedVariant.priceHistory || []} currentPrice={mergedVariant.estimatedValue || 0} />
                    </div>

            

                    {/* Recent Sales */}

                    <Card className="mt-8 p-6">

                      <h2 className="text-2xl font-bold mb-4">Recent Sales</h2>

                        {(mergedVariant.recentSales && mergedVariant.recentSales.length > 0) ? (
                          <Table>

                            <TableHeader>

                              <TableRow>

                                <TableHead>Date</TableHead>

                                <TableHead>Source</TableHead>

                                <TableHead>Price</TableHead>

                                <TableHead>Currency</TableHead>

                                <TableHead></TableHead>

                              </TableRow>

                            </TableHeader>

                            <TableBody>

                              {mergedVariant.recentSales?.map((sale, index) => (

                                <TableRow key={index}>

                                  <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>

                                  <TableCell>{sale.source}</TableCell>

                                  <TableCell className="font-semibold">${sale.price.toFixed(2)}</TableCell>

                                  <TableCell>{sale.currency}</TableCell>

                                  <TableCell>

                                    <Button variant="ghost" size="sm" asChild>

                                      <a href={sale.url} target="_blank" rel="noopener noreferrer">

                                        View <ExternalLink className="h-3 w-3 ml-1" />

                                      </a>

                                    </Button>

                                  </TableCell>

                                </TableRow>

                              ))}

                            </TableBody>

                          </Table>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No recent sales data available.</p>
                          </div>
                        )}

                      <p className="text-xs text-muted-foreground mt-4">

                        Sales data aggregated from eBay, StockX, Mercari, and verified resellers. All prices converted to USD.

                      </p>

                    </Card>

                  </div>

                </div>
)}