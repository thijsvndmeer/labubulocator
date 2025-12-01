import { useConfig } from "@/providers/ConfigProvider";

export const MarketDataNotice = () => {
  const { copy } = useConfig();

  return (
    <p className="text-sm text-muted-foreground leading-relaxed">
      {copy.marketDataCopy}
    </p>
  );
};

