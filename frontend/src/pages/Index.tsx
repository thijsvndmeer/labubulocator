import { useState, useEffect } from 'react';
import { VariantCard } from '@/components/VariantCard';
import heroBanner from '@/assets/hero-banner.jpg';
import { TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { Labubu } from '@labubu/common';
import { CarouselConfig } from '@/types/admin-config';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useConfig } from '@/context/ConfigContext';

type CarouselSortOption =
  | 'lowestPrice'
  | 'highestPrice'
  | 'biggestLoss24h'
  | 'biggestGain24h'
  | 'newest'
  | 'oldest';

type CarouselWithSorting = CarouselConfig & { sortBy?: CarouselSortOption };

const getSortedVariants = (variants: Labubu[], carousel: CarouselWithSorting) => {
  const sorted = [...variants];
  const sortBy = carousel.sortBy;

  if (sortBy === 'lowestPrice') {
    sorted.sort((a, b) => (b.lowestPrice || 0) - (a.lowestPrice || 0));
  } else if (sortBy === 'highestPrice') {
    sorted.sort((a, b) => (a.lowestPrice || 0) - (b.lowestPrice || 0));
  } else if (sortBy === 'biggestLoss24h') {
    sorted.sort((a, b) => {
      const aChange = a.priceChange24h || 0;
      const bChange = b.priceChange24h || 0;
      return aChange - bChange;
    });
  } else if (sortBy === 'biggestGain24h') {
    sorted.sort((a, b) => {
      const aChange = a.priceChange24h || 0;
      const bChange = b.priceChange24h || 0;
      return bChange - aChange;
    });
  } else if (sortBy === 'newest') {
    sorted.sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateB - dateA;
    });
  } else if (sortBy === 'oldest') {
    sorted.sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateA - dateB;
    });
  }

  const limit = carousel.limit ?? sorted.length;
  return sorted.slice(0, limit);
};

export const Index = () => {
  const { content, layout } = useConfig();
  const [variants, setVariants] = useState<Labubu[]>([]);

  // useEffect to load variants
  useEffect(() => {
    const loadVariants = async () => {
      try {
        const fetchedVariants = await api.labubus.get();
        setVariants(fetchedVariants);
      } catch (error) {
        console.error("Error fetching variants:", error);
      }
    };
    loadVariants();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {layout.homepage.heroOverlay && <div className="absolute inset-0 bg-gradient-primary opacity-90" />}
        <img
          src={heroBanner}
          alt="Labubu Collection"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {content.hero.title}
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              {content.hero.subtitle}
            </p>
            <p className="text-sm text-primary-foreground/70">{content.hero.helpText}</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Carousels Section */}
        {layout.homepage.carousels.map((carousel) => {
          if (!carousel.enabled) return null; // Only render enabled carousels

          const sortedCarouselVariants = getSortedVariants(variants, carousel);

          return (
            <section key={carousel.id}>
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="h-8 w-8 text-primary" /> {/* Using TrendingUp for now */}
                <div>
                  <h2 className="text-3xl font-bold">{carousel.title}</h2>
                  <p className="text-muted-foreground">{carousel.description}</p>
                </div>
              </div>

              <Carousel
                opts={{
                  align: carousel.align as any,
                  loop: carousel.loop,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {sortedCarouselVariants.map((variant) => (
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
          );
        })}

        {/* Footer */}
        <footer className="text-center py-8 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>{content.footer.disclosure.split(':')[0]}:</strong> {content.footer.disclosure.split(':')[1]?.trim()}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {content.footer.details}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
