import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Listing } from '@labubu/common/src/types/labubu';

interface PriceComparisonProps {
  listings: Listing[];
}

export const PriceComparison = ({ listings }: PriceComparisonProps) => {
  const sortedPrices = [...listings].sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0));
  const lowestPrice = sortedPrices[0];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Price Comparison</h3>
        </div>

        {listings.length === 0 && <div>No listings found.</div>}

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
                    <span className="font-medium">{source.vendorName}</span>
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
                    ${source.currentPrice?.toFixed(2)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={source === lowestPrice ? 'default' : 'outline'}
                  asChild
                >
                  <a
                    href={source.productUrl}
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
