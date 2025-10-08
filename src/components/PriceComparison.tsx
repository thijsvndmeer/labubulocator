import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { PriceSource } from '@/types/variant';
import { Badge } from '@/components/ui/badge';

interface PriceComparisonProps {
  sources: PriceSource[];
  msrp: number;
}

export const PriceComparison = ({ sources, msrp }: PriceComparisonProps) => {
  const sortedSources = [...sources].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedSources[0];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Price Comparison</h3>
          <Badge variant="outline" className="text-xs">
            MSRP: ${msrp.toFixed(2)}
          </Badge>
        </div>

        <div className="space-y-3">
          {sortedSources.map((source, index) => (
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
                    <span className="font-medium">{source.source}</span>
                    {source === lowestPrice && (
                      <Badge className="bg-rarity-uncommon text-white text-xs">
                        Best Price
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(source.timestamp).toLocaleDateString()}
                    </span>
                    {source.inStock ? (
                      <div className="flex items-center gap-1 text-xs text-rarity-uncommon">
                        <CheckCircle2 className="h-3 w-3" />
                        In Stock
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <XCircle className="h-3 w-3" />
                        Out of Stock
                      </div>
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
