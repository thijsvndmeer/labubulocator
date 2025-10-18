import { Badge } from '@/components/ui/badge';
import { StockStatus } from '@/types/variant';
import { CheckCircle2, AlertCircle, XCircle, Clock, Ban } from 'lucide-react';

interface StockStatusBadgeProps {
  status: StockStatus;
}

export const StockStatusBadge = ({ status }: StockStatusBadgeProps) => {
  const config = {
    in_stock: {
      label: 'In Stock',
      icon: CheckCircle2,
      className: 'bg-rarity-uncommon/10 text-rarity-uncommon border-rarity-uncommon/20',
    },
    low_stock: {
      label: 'Low Stock',
      icon: AlertCircle,
      className: 'bg-rarity-legendary/10 text-rarity-legendary border-rarity-legendary/20',
    },
    out_of_stock: {
      label: 'Out of Stock',
      icon: XCircle,
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    pre_order: {
      label: 'Pre-Order',
      icon: Clock,
      className: 'bg-primary/10 text-primary border-primary/20',
    },
    discontinued: {
      label: 'Discontinued',
      icon: Ban,
      className: 'bg-muted text-muted-foreground border-border',
    },
  };

  const badgeConfig = config[status] || {
    label: 'Unknown',
    icon: AlertCircle,
    className: 'bg-muted text-muted-foreground border-border',
  };

  const { label, icon: Icon, className } = badgeConfig;

  return (
    <Badge variant="outline" className={`${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};
