import { Card } from '@/components/ui/card';
import { PriceEntry } from '@labubu/common';

interface PriceHistoryChartProps {
  history: PriceEntry[];
}

export const PriceHistoryChart = ({ history }: PriceHistoryChartProps) => {
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

  const values = history.map(h => h.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Price History</h3>
        </div>

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
      </div>
    </Card>
  );
};
