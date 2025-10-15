import { Badge } from '@/components/ui/badge';
import { Rarity } from '@/types/variant';
import { cn } from '@/lib/utils';

interface RarityBadgeProps {
  rarity: Rarity;
  className?: string;
}

export const RarityBadge = ({ rarity, className }: RarityBadgeProps) => {
  const rarityConfig: Record<Rarity, { label: string; className: string }> = {
    common: { label: 'Labubu', className: 'bg-rarity-common/20 text-rarity-common border-rarity-common/30' },
    uncommon: { label: 'Zimomo', className: 'bg-rarity-uncommon/20 text-rarity-uncommon border-rarity-uncommon/30' },
    rare: { label: 'Mokoko', className: 'bg-rarity-rare/20 text-rarity-rare border-rarity-rare/30' },
    epic: { label: 'Plush Labubu', className: 'bg-rarity-epic/20 text-rarity-epic border-rarity-epic/30' },
    legendary: { label: 'Legendary', className: 'bg-rarity-legendary/20 text-rarity-legendary border-rarity-legendary/30' },
    secret: { label: 'Secret', className: 'bg-rarity-secret/20 text-rarity-secret border-rarity-secret/30' },
  };

  const config = rarityConfig[rarity];

  return (
    <Badge variant="outline" className={cn('font-semibold border', config.className, className)}>
      {config.label}
    </Badge>
  );
};
