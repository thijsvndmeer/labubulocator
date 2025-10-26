import { TrendingDown, TrendingUp } from 'lucide-react';

interface PriceChangeBadgeProps {
  priceChange: number;
}

export const PriceChangeBadge = ({ priceChange }: PriceChangeBadgeProps) => {
  const isPositive = priceChange > 0;
  const isNegative = priceChange < 0;
  const color = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500';
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={`flex items-center text-sm font-medium ${color}`}>
      <Icon className="h-4 w-4 mr-1" />
      <span>{Math.abs(priceChange).toFixed(2)}%</span>
    </div>
  );
};
