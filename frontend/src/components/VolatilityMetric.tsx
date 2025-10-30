import { Badge } from '@/components/ui/badge';

interface VolatilityMetricProps {
  volatility: number;
}

export const VolatilityMetric = ({ volatility }: VolatilityMetricProps) => {
  const getVolatilityColor = () => {
    if (volatility < 20) return 'bg-green-500';
    if (volatility < 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getVolatilityText = () => {
    if (volatility < 20) return 'Low';
    if (volatility < 50) return 'Medium';
    return 'High';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Volatility:</span>
      <Badge className={`${getVolatilityColor()} text-white`}>{getVolatilityText()}</Badge>
    </div>
  );
};