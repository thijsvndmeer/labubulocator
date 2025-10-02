import { Card } from '@/components/ui/card';
import { RarityBadge } from '@/components/RarityBadge';
import { ConfidenceScore } from '@/components/ConfidenceScore';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Variant } from '@/types/variant';
import { Link } from 'react-router-dom';

interface VariantCardProps {
  variant: Variant;
}

export const VariantCard = ({ variant }: VariantCardProps) => {
  const priceChange = Math.random() > 0.5 ? 8.5 : -3.2; // Mock price change

  return (
    <Link to={`/variant/${variant.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-card-hover cursor-pointer">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={variant.images[0]}
            alt={variant.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{variant.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{variant.series}</p>
            </div>
            <RarityBadge rarity={variant.rarity} />
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-primary">
                ${variant.estimatedValue.toFixed(2)}
              </span>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                priceChange > 0 ? 'text-rarity-uncommon' : 'text-destructive'
              }`}>
                {priceChange > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {Math.abs(priceChange)}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Range: ${variant.priceRange.low} - ${variant.priceRange.high}
            </p>
          </div>

          <ConfidenceScore score={variant.confidenceScore} />
        </div>
      </Card>
    </Link>
  );
};
