import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { PriceData } from '@/types/variant';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getAmazonPrice, getStockXPrice, getEbayPrice } from '@/lib/api';

interface PriceComparisonProps {
  variantName: string;
  msrp: number;
}

export const PriceComparison = ({ variantName, msrp }: PriceComparisonProps) => {
  const { data: amazonPrice, isLoading: amazonLoading, isError: amazonError } = useQuery({
    queryKey: ['amazonPrice', variantName],
    queryFn: () => getAmazonPrice(variantName),
  });

  const { data: stockxPrice, isLoading: stockxLoading, isError: stockxError } = useQuery({
    queryKey: ['stockxPrice', variantName],
    queryFn: () => getStockXPrice(variantName),
  });

  const { data: ebayPrice, isLoading: ebayLoading, isError: ebayError } = useQuery({
    queryKey: ['ebayPrice', variantName],
    queryFn: () => getEbayPrice(variantName),
  });

  const isLoading = amazonLoading || stockxLoading || ebayLoading;

  const prices = [amazonPrice, stockxPrice, ebayPrice].filter((p): p is PriceData => !!p);
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedPrices[0];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Price Comparison</h3>
          <Badge variant="outline" className="text-xs">
            MSRP: ${msrp.toFixed(2)}
          </Badge>
        </div>

        {isLoading && <div>Loading prices...</div>}

        <div className="space-y-3">
          {sortedPrices.map((source, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                source === lowestPrice
                  ? 'border-rarity-uncommon bg-rarity-uncommon/5'
                  : 'border-border hover:border-muted-foreground/20'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{source.site}</span>
                    {source === lowestPrice && (
                      <Badge className="bg-rarity-uncommon text-white text-xs">
                        Best Price
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xl font-bold">
                    ${source.price.toFixed(2)}
                  </div>
                  {source.price > msrp && (
                    <div className="text-xs text-muted-foreground">
                      +{(((source.price - msrp) / msrp) * 100).toFixed(0)}% vs MSRP
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={source === lowestPrice ? 'default' : 'outline'}
                  asChild
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          <strong>Affiliate Disclosure:</strong> We may earn a commission from purchases made through these links.
          Prices and availability are subject to change.
        </p>
      </div>
    </Card>
  );
};
