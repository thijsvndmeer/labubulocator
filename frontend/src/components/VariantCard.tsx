import { Card } from '@/components/ui/card';
import { RarityBadge } from '@/components/RarityBadge';

import { StockStatusBadge } from '@/components/StockStatusBadge';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Labubu } from '@labubu/common';
import { PriceChangeBadge } from './PriceChangeBadge';
import { API_ROOT_URL } from '@/lib/api';
import { featureFlags as staticFeatureFlags } from '@/config/feature-flags';
import { layoutConfig as staticLayoutConfig } from '@/config/layout.config';
import { useConfig } from '@/context/ConfigContext';

interface VariantCardProps {
  variant: Labubu;
  isPopular?: boolean;
  hideStockStatus?: boolean;
  showCollectionStatus?: boolean;
  isCollected?: boolean;
}

export const VariantCard = ({ variant, isPopular, hideStockStatus, showCollectionStatus, isCollected }: VariantCardProps) => {
  const { featureFlags, layout } = useConfig();
  const lowestPrice = variant.lowestPrice || 0;

  const getImageUrl = (variant: Labubu) => {
    return `${API_ROOT_URL}/images/${variant.sku}.png`;
  };

  const cardClasses = [
    "group overflow-hidden transition-all duration-300 hover:shadow-card-hover fade-in",
    layout.cards.showCollectionStatus && featureFlags.collectionGlow && showCollectionStatus && isCollected && "glow-collected",
    layout.cards.showCollectionStatus && featureFlags.collectionGlow && showCollectionStatus && !isCollected && "glow-uncollected",
  ].filter(Boolean).join(' ');

  const shouldShowStock = featureFlags.stockStatus && !hideStockStatus;
  const shouldShowAffiliate = featureFlags.affiliateButtons && variant.affiliateLinks && variant.affiliateLinks.length > 0;
  const shouldShowPriceChange = featureFlags.priceChange && variant.priceChange24h !== undefined;

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

        {isPopular && layout.cards.badgeVariant === 'floating' && (
          <Badge variant="secondary" className="absolute top-2 left-2">Popular</Badge>
        )}

        <Link to={`/variant/${variant.sku}`}>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-primary">
                ${(variant.estimatedValue || 0).toFixed(2)}
              </span>
              {shouldShowPriceChange && (
                <PriceChangeBadge priceChange={variant.priceChange24h!} />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Floor: ${lowestPrice > 0 && lowestPrice !== Infinity ? lowestPrice.toFixed(2) : 'N/A'}
            </p>
          </div>
        </Link>
        {shouldShowStock && <StockStatusBadge status={variant.stockStatus as any} />}
        <div className="flex items-center justify-between gap-0 pt-0">

          {shouldShowAffiliate && (
            <Button
              size="sm"
              variant="outline"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={variant.affiliateLinks![0].url}
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

      </div>
    </Card>
  );
};
