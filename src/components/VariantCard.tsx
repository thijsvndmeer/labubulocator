import { Card } from '@/components/ui/card';
import { RarityBadge } from '@/components/RarityBadge';
import { Variant } from '@/types/variant';
import { Link } from 'react-router-dom';
import { Labubu } from '@labubu/common/src/types/labubu';

interface VariantCardProps {
  variant: Labubu;
}

export const VariantCard = ({ variant }: VariantCardProps) => {
  const getImageUrl = (variant: Labubu) => {
    return variant.image || '/placeholder.svg';
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-card-hover fade-in">
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
            </div>
            <RarityBadge rarity={variant.rarity} />
          </div>
        </Link>

        <Link to={`/variant/${variant.sku}`}>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-primary">
                ${(variant.lowestPrice || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </Card>
  );
};
