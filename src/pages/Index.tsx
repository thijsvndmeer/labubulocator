import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { VariantCard } from '@/components/VariantCard';
import { SearchFilters } from '@/components/SearchFilters';
import { useVariantFilters } from '@/hooks/useVariantFilters';
import heroBanner from '@/assets/hero-banner.jpg';
import { TrendingUp } from 'lucide-react';
import { Variant } from '@/types/variant';
import { getAllVariants, initializeVariants } from '@/data/variantManager';

const Index = () => {
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    const loadVariants = async () => {
      await initializeVariants();
      setVariants(getAllVariants());
    };
    loadVariants();
  }, []);

  const {
    filteredVariants,
    selectedRarity,
    setSelectedRarity,
    selectedSeries,
    setSelectedSeries,
    sortBy,
    setSortBy,
    allSeries
  } = useVariantFilters(variants, ""); // Pass empty string for search query

  const trendingVariants = variants
    .sort((a, b) => Math.abs(b.priceChange24h || 0) - Math.abs(a.priceChange24h || 0))
    .slice(0, 4);

  return (
    <div className="min-h-screen">

      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-90" />
        <img
          src={heroBanner}
          alt="Labubu Collection"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Track Your Labubu Collection Value
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Real-time pricing from Amazon, eBay, StockX, and trusted resellers
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Trending Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Trending Now</h2>
              <p className="text-muted-foreground">Biggest price movers in the last 24 hours</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingVariants.map((variant) => (
              <VariantCard key={variant.id} variant={variant} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Affiliate Disclosure:</strong> We may earn a commission from purchases made through our links.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Price data aggregated from Pop Mart, Amazon, eBay, StockX, and verified resellers.
            Updated every 30 minutes. All prices in USD unless noted.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;