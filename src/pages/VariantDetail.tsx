import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RarityBadge } from '@/components/RarityBadge';
import { PriceComparison } from '@/components/PriceComparison';
import { PriceHistoryChart } from '@/components/PriceHistoryChart';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Labubu, Listing, PriceEntry } from '@labubu/common/src/types/labubu';

export default function VariantDetail() {
  const navigate = useNavigate();
  const { sku } = useParams();
  const [variant, setVariant] = useState<Labubu | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!sku) return;
      setIsLoading(true);
      try {
        const variantData = await api.labubus.getBySku(sku);
        setVariant(variantData);
        const listingData = await api.listings.get({ filter: { labubuSku: sku } });
        setListings(listingData);
        if (listingData.length > 0) {
          const priceHistoryData = await api.listings.getPriceHistory(listingData[0].id);
          setPriceHistory(priceHistoryData);
        }
      } catch (error) {
        console.error("Error fetching variant details:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [sku]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading && !variant) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="overflow-hidden">
              <div className="aspect-square bg-muted p-8">
                <Skeleton className="h-full w-full" />
              </div>
            </Card>
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <Card className="p-6 bg-gradient-primary">
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-40 mb-1" />
                    <div className="flex items-baseline gap-3">
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <Card className="mt-8 p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!variant && !isLoading) {
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

  if (!variant) {
    return null;
  }

  const getImageUrl = (variant: Labubu) => {
    return variant.image || '/placeholder.svg';
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="overflow-hidden">
            <div className="aspect-square bg-muted p-8">
              <img
                src={getImageUrl(variant)}
                alt={variant.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </Card>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-1">{variant.name}</h1>
                  <Link to={`/catalog?series=${encodeURIComponent(variant.series)}`} className="text-lg text-muted-foreground hover:text-primary transition-colors">
                    {variant.series}
                  </Link>
                </div>
                <RarityBadge rarity={variant.rarity} />
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="font-mono">
                  <Tag className="h-3 w-3 mr-1" />
                  {variant.sku}
                </Badge>
              </div>
            </div>

            <p className="text-muted-foreground">{variant.description}</p>

            <Card className="p-6 bg-gradient-primary relative">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-primary-foreground/80 mb-1">Estimated Market Value</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary-foreground">
                      ${variant.lowestPrice?.toFixed(2) || '--.--'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-primary-foreground/90">
                  <div>
                    <span className="text-primary-foreground/70">MSRP: </span>
                    <span className="font-semibold">${variant.msrp?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <PriceHistoryChart history={priceHistory || []} currentPrice={variant.lowestPrice || 0} />
        </div>

        <div className="mt-8">
          <PriceComparison listings={listings || []} />
        </div>
      </div>
    </div>
  );
}