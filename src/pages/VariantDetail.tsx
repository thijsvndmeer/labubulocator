import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVariantById, initializeVariants, updateVariantWithScrapedData } from '@/data/variantManager';
import { Variant } from '@/types/variant';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RarityBadge } from '@/components/RarityBadge';
import { ConfidenceScore } from '@/components/ConfidenceScore';
import { StockStatusBadge } from '@/components/StockStatusBadge';
import { PriceComparison } from '@/components/PriceComparison';
import { PriceHistoryChart } from '@/components/PriceHistoryChart';
import { ArrowLeft, Bell, Heart, ExternalLink, Package, Tag } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { getAmazonPrice, getEbayPrice, getStockXPrice } from '@/lib/api';

const assetImages = import.meta.glob('/src/assets/**/*.png', { eager: true, query: '?url', import: 'default' });

export default function VariantDetail() {
  const { sku } = useParams();
  const [variant, setVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: amazonPrice } = useQuery({
    queryKey: ['amazonPrice', variant?.name],
    queryFn: () => getAmazonPrice(variant!.name),
    enabled: !!variant,
  });
  const { data: stockxPrice } = useQuery({
    queryKey: ['stockxPrice', variant?.name],
    queryFn: () => getStockXPrice(variant!.name),
    enabled: !!variant,
  });
  const { data: ebayPrice } = useQuery({
    queryKey: ['ebayPrice', variant?.name],
    queryFn: () => getEbayPrice(variant!.name),
    enabled: !!variant,
  });

  useEffect(() => {
    const loadVariant = async () => {
      await initializeVariants();
      const variantData = getVariantBySku(sku!);
      if (variantData) {
        setVariant(variantData);
      }
      setLoading(false);
    };
    loadVariant();
  }, [sku]);

  useEffect(() => {
    if (variant && (amazonPrice || stockxPrice || ebayPrice)) {
      const scrapedPrices = [amazonPrice, stockxPrice, ebayPrice].filter(p => p).map(p => p!);
      const updatedVariant = updateVariantWithScrapedData(variant.sku, scrapedPrices);
      if(updatedVariant) {
        setVariant(updatedVariant);
      }
    }
  }, [variant, amazonPrice, stockxPrice, ebayPrice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Variant not found</h1>
            <Link to="/">
              <Button>Back to Catalog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getImageUrl = (variant: Variant) => {
    let skuToMatch = variant.sku.toLowerCase();

    // Normalize SKU for 'Big Into Energy' series if necessary
    if (skuToMatch.includes('lbb-bii-')) {
      skuToMatch = skuToMatch.replace('lbb-bii-', 'lbb-bie-');
    }

    let foundImagePath = Object.keys(assetImages).find(path => {
      const filename = path.split('/').pop()?.toLowerCase() || '';
      return filename.includes(skuToMatch);
    });

    if (foundImagePath && assetImages[foundImagePath]) {
      return assetImages[foundImagePath];
    }
    return '/placeholder.svg';
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <Card className="overflow-hidden">
            <div className="aspect-square bg-muted p-8">
              <img
                src={getImageUrl(variant.sku)}
                alt={variant.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </Card>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-1">{variant.name}</h1>
                  <p className="text-lg text-muted-foreground">{variant.series}</p>
                  {variant.variant && (
                    <p className="text-sm text-muted-foreground">{variant.variant}</p>
                  )}
                </div>
                <RarityBadge rarity={variant.rarity} />
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="font-mono">
                  <Tag className="h-3 w-3 mr-1" />
                  {variant.sku}
                </Badge>
                <StockStatusBadge status={variant.stockStatus} />
              </div>
            </div>

            <p className="text-muted-foreground">{variant.description}</p>

            {/* Price Info */}
            <Card className="p-6 bg-gradient-primary">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-primary-foreground/80 mb-1">Estimated Market Value</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary-foreground">
                      ${variant.estimatedValue?.toFixed(2)}
                    </span>
                    <span className="text-sm text-primary-foreground/80">
                      Floor: ${variant.floorPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-primary-foreground/90">
                  <div>
                    <span className="text-primary-foreground/70">MSRP: </span>
                    <span className="font-semibold">${variant.msrp.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-primary-foreground/70">Last Sale: </span>
                    <span className="font-semibold">${variant.lastSalePrice?.toFixed(2)}</span>
                  </div>
                </div>

                <ConfidenceScore score={variant.confidenceScore || 0} className="text-primary-foreground/90" />
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {variant.affiliateLinks.slice(0, 2).map((link) => (
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
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Attributes */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(variant.attributes).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Price Comparison */}
        <div className="mt-8">
          <PriceComparison variantName={variant.name} msrp={variant.msrp} />
        </div>

        {/* Price History */}
        <div className="mt-8">
          <PriceHistoryChart history={variant.priceHistory || []} currentPrice={variant.estimatedValue || 0} />
        </div>

        {/* Recent Sales */}
        <Card className="mt-8 p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Sales</h2>
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
              {variant.recentSales?.map((sale, index) => (
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
          <p className="text-xs text-muted-foreground mt-4">
            Sales data aggregated from eBay, StockX, Mercari, and verified resellers. All prices converted to USD.
          </p>
        </Card>
      </div>
    </div>
  );
}
