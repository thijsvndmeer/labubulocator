import { Header } from '@/components/Header';
import { VariantCard } from '@/components/VariantCard';
import { mockVariants } from '@/data/mockVariants';
import { TrendingUp, Sparkles } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';

const Index = () => {
  const trendingVariants = mockVariants.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
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
              Real-time market prices backed by completed sales data. 
              Discover values, track trends, and build your dream collection.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <Sparkles className="h-5 w-5 text-secondary ml-auto" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingVariants.map((variant) => (
            <VariantCard key={variant.id} variant={variant} />
          ))}
        </div>
      </section>

      {/* All Variants Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">All Variants</h2>
          <p className="text-sm text-muted-foreground">
            {mockVariants.length} variants tracked
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockVariants.map((variant) => (
            <VariantCard key={variant.id} variant={variant} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            Price data aggregated from verified marketplace sales. 
            Values update continuously based on completed transactions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
