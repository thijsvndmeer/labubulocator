import { Card } from '@/components/ui/card';
import { RarityBadge } from '@/components/RarityBadge';
import { ConfidenceScore } from '@/components/ConfidenceScore';
import { StockStatusBadge } from '@/components/StockStatusBadge';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { Variant } from '@/types/variant';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface VariantCardProps {
  variant: Variant;
}

const assetImages = import.meta.glob('/src/assets/**/*.png', { eager: true, query: '?url', import: 'default' });

export const VariantCard = ({ variant }: VariantCardProps) => {
  const lowestPrice = Math.min(...(variant.priceSources || []).map(s => s.price));

  const getImageUrl = (variant: Variant) => {
    const sku = variant.sku.toLowerCase();

    const foundImagePath = Object.keys(assetImages).find(path => {
      const filename = path.split('/').pop()?.toLowerCase() || '';
      return filename.includes(sku);
    });

    if (foundImagePath && assetImages[foundImagePath]) {
      return assetImages[foundImagePath];
    }
    return '/placeholder.svg';
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-card-hover">
      <Link to={`/variant/${variant.sku}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={getImageUrl(variant)}
            alt={variant.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </Link>
      
      <div className="p-4 space-y-3">
        <Link to={`/variant/${variant.sku}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{variant.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{variant.series}</p>
              {variant.variant && (
                <p className="text-xs text-muted-foreground truncate">{variant.variant}</p>
              )}
            </div>
            <RarityBadge rarity={variant.rarity} />
          </div>
        </Link>

        <Link to={`/variant/${variant.sku}`}>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-primary">
                ${(variant.estimatedValue || 0).toFixed(2)}
              </span>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                (variant.priceChange24h || 0) > 0 ? 'text-rarity-uncommon' : 'text-destructive'
              }`}>
                {(variant.priceChange24h || 0) > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {Math.abs(variant.priceChange24h || 0)}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Floor: ${lowestPrice > 0 && lowestPrice !== Infinity ? lowestPrice.toFixed(2) : 'N/A'} • Range: ${variant.priceRange?.low || 'N/A'}-${variant.priceRange?.high || 'N/A'}
            </p>
          </div>
        </Link>

        <div className="flex items-center justify-between gap-2 pt-2">
          <StockStatusBadge status={variant.stockStatus} />
          {variant.affiliateLinks.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={variant.affiliateLinks[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                Buy Now
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>

        <Link to={`/variant/${variant.sku}`}>
          <ConfidenceScore score={variant.confidenceScore || 0} />
        </Link>
      </div>
    </Card>
  );
};
