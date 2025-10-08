import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { VariantCard } from '@/components/VariantCard';
import { SearchFilters } from '@/components/SearchFilters';
import { useVariantFilters } from '@/hooks/useVariantFilters';
import heroBanner from '@/assets/hero-banner.jpg';
import { TrendingUp, Package } from 'lucide-react';
import Papa from 'papaparse';
import { Variant } from '@/types/variant';

const Index = () => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchVariants = async () => {
      const response = await fetch('/labubus.csv');
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csv = decoder.decode(result.value);

      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedVariants = results.data.map((row: any) => ({
            ...row,
            images: JSON.parse(row.images),
            msrp: parseFloat(row.msrp),
            lastSalePrice: parseFloat(row.lastSalePrice),
            floorPrice: parseFloat(row.floorPrice),
            priceSources: JSON.parse(row.priceSources),
            affiliateLinks: JSON.parse(row.affiliateLinks),
            attributes: JSON.parse(row.attributes),
            estimatedValue: parseFloat(row.estimatedValue),
            priceRange: JSON.parse(row.priceRange),
            confidenceScore: Number(row.confidenceScore),
            priceChange24h: parseFloat(row.priceChange24h),
            recentSales: JSON.parse(row.recentSales),
            priceHistory: JSON.parse(row.priceHistory),
          }));
          setVariants(parsedVariants as Variant[]);
        },
      });
    };

    fetchVariants();
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
  } = useVariantFilters(variants, searchQuery);

  const trendingVariants = variants
    .sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
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

        {/* All Variants Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Complete Catalog</h2>
              <p className="text-muted-foreground">
                Tracking {variants.length} Labubu variants across all series
              </p>
            </div>
          </div>

          <div className="mb-8">
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedRarity={selectedRarity}
              onRarityChange={setSelectedRarity}
              selectedSeries={selectedSeries}
              onSeriesChange={setSelectedSeries}
              sortBy={sortBy}
              onSortChange={setSortBy}
              allSeries={allSeries}
            />
          </div>

          {filteredVariants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVariants.map((variant) => (
                <VariantCard key={variant.id} variant={variant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No variants found matching your filters.</p>
            </div>
          )}
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