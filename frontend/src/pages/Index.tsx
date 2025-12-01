import { VariantCard } from '@/components/VariantCard';
import { CardSkeleton } from '@/components/CardSkeleton';
import { Gem, Flame, TrendingDown } from 'lucide-react';
import { api, API_ROOT_URL } from '@/lib/api';
import { Labubu } from '@labubu/common';
import { useQuery } from '@tanstack/react-query';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useConfig } from '@/providers/ConfigProvider';
import { MarketDataNotice } from '@/components/MarketDataNotice';

const Index = () => {
  const { copy } = useConfig();
  const heroBanner = copy.heroImage.startsWith('http')
    ? copy.heroImage
    : `${API_ROOT_URL}${copy.heroImage.startsWith('/') ? '' : '/'}${copy.heroImage}`;
  const { data: variants = [], isLoading } = useQuery<Labubu[]>({
    queryKey: ['variants'],
    queryFn: () => api.labubus.get(),
    keepPreviousData: true,
  });

  const trendingVariants = variants
    .sort((a, b) => (b.lowestPrice || 0) - (a.lowestPrice || 0))
    .slice(0, 15);

  const hotVariants = variants
    .filter(v => v.priceChange24h)
    .sort((a, b) => (b.priceChange24h || 0) - (a.priceChange24h || 0))
    .slice(0, 15);

  const biggestLosers = variants
    .filter(v => v.priceChange24h)
    .sort((a, b) => (a.priceChange24h || 0) - (b.priceChange24h || 0))
    .slice(0, 15);

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
              {copy.heroTitle}
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              {copy.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* What's Hot Section */}
        {!isLoading && hotVariants.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Flame className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">What's Hot</h2>
                <p className="text-muted-foreground">Top daily price increases</p>
              </div>
            </div>
            
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="p-1">
                        <CardSkeleton />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  hotVariants.map((variant) => (
                    <CarouselItem key={variant.sku} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="p-1">
                        <VariantCard variant={variant} />
                      </div>
                    </CarouselItem>
                  ))
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}

        {/* Biggest Losers Section */}
        {!isLoading && biggestLosers.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <TrendingDown className="h-8 w-8 text-destructive" />
              <div>
                <h2 className="text-3xl font-bold">Biggest Losers</h2>
                <p className="text-muted-foreground">Top daily price decreases</p>
              </div>
            </div>
            
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="p-1">
                        <CardSkeleton />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  biggestLosers.map((variant) => (
                    <CarouselItem key={variant.sku} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="p-1">
                        <VariantCard variant={variant} />
                      </div>
                    </CarouselItem>
                  ))
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}

        {/* Highest Value Section */}
        {!isLoading && trendingVariants.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Gem className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Highest Value</h2>
                <p className="text-muted-foreground">Highest value {copy.pluralCollectible}</p>
              </div>
            </div>
            
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="p-1">
                        <CardSkeleton />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  trendingVariants.map((variant) => (
                    <CarouselItem key={variant.sku} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="p-1">
                        <VariantCard variant={variant} />
                      </div>
                    </CarouselItem>
                  ))
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t">
          <p className="text-xs text-muted-foreground mt-4">
            <strong>Affiliate Disclosure:</strong> We may earn a commission from purchases made through these links. Prices and availability are subject to change.
          </p>
          <div className="mt-4 text-xs">
            <MarketDataNotice />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
