import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { PriceSnapshot } from '@/types/variant';

interface PriceHistoryChartProps {
  history: PriceSnapshot[];
  currentPrice: number;
}

export const PriceHistoryChart = ({ history, currentPrice }: PriceHistoryChartProps) => {
  if (history.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold">Price History</h3>
        <div className="flex items-center justify-center h-24">
          <p className="text-muted-foreground">No price history available.</p>
        </div>
      </Card>
    );
  }

  const latest = history[0];
  const oldest = history[history.length - 1];
  const priceChange = ((latest.median30d - oldest.median30d) / oldest.median30d) * 100;
  const isPositive = priceChange > 0;

  // Simple sparkline visualization
  const values = history.map(h => h.median30d);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Price History</h3>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-rarity-uncommon' : 'text-destructive'
          }`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(priceChange).toFixed(1)}%
          </div>
        </div>

        {/* Simple sparkline */}
        <div className="relative h-24 flex items-end gap-1">
          {values.map((value, index) => {
            const height = range > 0 ? ((value - min) / range) * 100 : 50;
            return (
              <div
                key={index}
                className="flex-1 bg-primary rounded-t transition-all hover:opacity-80"
                style={{ height: `${height}%` }}
                title={`$${value.toFixed(2)}`}
              />
            );
          })}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">30 Day Avg</p>
            <p className="text-lg font-semibold">${latest.median30d.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">90 Day Avg</p>
            <p className="text-lg font-semibold">${latest.median90d.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="text-lg font-semibold">{latest.volume}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
