import { Card } from '@/components/ui/card';
import { RarityBadge } from '@/components/RarityBadge';
import { ConfidenceScore } from '@/components/ConfidenceScore';
import { StockStatusBadge } from '@/components/StockStatusBadge';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Labubu } from '@labubu/common/src/types/labubu';

const assetImages = import.meta.glob('/src/assets/**/*.png', { eager: true, query: '?url', import: 'default' });

interface VariantCardProps {
  variant: Labubu;
  isPopular?: boolean;
  hideStockStatus?: boolean;
  showCollectionStatus?: boolean;
  isCollected?: boolean;
}

export const VariantCard = ({ variant, isPopular, hideStockStatus, showCollectionStatus, isCollected }: VariantCardProps) => {
  const lowestPrice = variant.lowestPrice || 0;

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

  const cardClasses = [
    "group overflow-hidden transition-all duration-300 hover:shadow-card-hover fade-in",
    showCollectionStatus && isCollected && "glow-collected",
    showCollectionStatus && !isCollected && "glow-uncollected",
  ].filter(Boolean).join(' ');

  return (
    <Card
      className={cardClasses}
    >
      <Link to={`/variant/${variant.sku}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            key={getImageUrl(variant)}
            src={getImageUrl(variant)}
            alt={variant.name}
            loading="lazy"
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
            <RarityBadge rarity={variant.rarity as any} />
          </div>
        </Link>

        {isPopular && (
          <Badge variant="secondary" className="absolute top-2 left-2">Popular</Badge>
        )}

        <Link to={`/variant/${variant.sku}`}>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-primary">
                ${(variant.estimatedValue || 0).toFixed(2)}
              </span>
              {(variant.priceChange24h || 0) !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-medium ${(variant.priceChange24h || 0) > 0 ? 'text-rarity-uncommon' : 'text-destructive'
                  }`}>
                  {(variant.priceChange24h || 0) > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {Math.abs(variant.priceChange24h || 0)}%
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Floor: ${lowestPrice > 0 && lowestPrice !== Infinity ? lowestPrice.toFixed(2) : 'N/A'} • Range: ${variant.priceRange?.low || 'N/A'}-${variant.priceRange?.high || 'N/A'}
            </p>
          </div>
        </Link>
        {!hideStockStatus && <StockStatusBadge status={variant.stockStatus as any} />}
        <div className="flex items-center justify-between gap-0 pt-0">

          {variant.affiliateLinks && variant.affiliateLinks.length > 0 && (
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
