import { useState, useEffect } from 'react';
import { VariantCard } from '@/components/VariantCard';
import heroBanner from '@/assets/hero-banner.svg';
import { TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { Labubu } from '@labubu/common';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { contentConfig } from '@/config/content.config';
import { layoutConfig } from '@/config/layout.config';

const Index = () => {
  const [variants, setVariants] = useState<Labubu[]>([]);

  useEffect(() => {
    const loadVariants = async () => {
      try {
        const variants = await api.labubus.get();
        setVariants(variants);
      } catch (error) {
        console.error("Error fetching variants:", error);
      }
    };
    loadVariants();
  }, []);

  const trendingVariants = variants
    .sort((a, b) => (b.lowestPrice || 0) - (a.lowestPrice || 0))
    .slice(0, 15);

  const carouselConfig = layoutConfig.homepage.trendingCarousel;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {layoutConfig.homepage.heroOverlay && <div className="absolute inset-0 bg-gradient-primary opacity-90" />}
        <img
          src={heroBanner}
          alt="Labubu Collection"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {contentConfig.hero.title}
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              {contentConfig.hero.subtitle}
            </p>
            <p className="text-sm text-primary-foreground/70">{contentConfig.hero.helpText}</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Trending Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">{contentConfig.trending.title}</h2>
              <p className="text-muted-foreground">{contentConfig.trending.description}</p>
            </div>
          </div>

          <Carousel
            opts={{
              align: carouselConfig.align as any,
              loop: carouselConfig.loop,
            }}
            className="w-full"
          >
            <CarouselContent>
              {trendingVariants.map((variant) => (
                <CarouselItem
                  key={variant.sku}
                  className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div className="p-1">
                    <VariantCard variant={variant} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>{contentConfig.footer.disclosure.split(':')[0]}:</strong> {contentConfig.footer.disclosure.split(':')[1]?.trim()}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {contentConfig.footer.details}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
