import { useState, useEffect, useMemo } from 'react';
import { VariantCard } from '@/components/VariantCard';
<<<<<<< HEAD
import { CardSkeleton } from '@/components/CardSkeleton';
import { Gem } from 'lucide-react';
import { api, API_ROOT_URL } from '@/lib/api';
const heroBanner = `${API_ROOT_URL}/images/hero-banner.jpg`;
=======
import heroBanner from '@/assets/hero-banner.jpg';
import { TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
>>>>>>> ff1567965961f00da574fed1b25c29819849ee56
import { Labubu } from '@labubu/common';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useConfig } from '@/context/ConfigContext';

const Index = () => {
  const { content, layout } = useConfig();
  const [variants, setVariants] = useState<Labubu[]>([]);

<<<<<<< HEAD
  const trendingVariants = variants
    .sort((a, b) => (b.lowestPrice || 0) - (a.lowestPrice || 0))
    .slice(0, 15);



  return (
    <div className="min-h-screen">


=======
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
>>>>>>> ff1567965961f00da574fed1b25c29819849ee56
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
<<<<<<< HEAD


        {/* Highest Value Section */}
        {!isLoading && trendingVariants.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Gem className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Highest Value</h2>
                <p className="text-muted-foreground">Current highest value Labubus</p>
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
=======
        {/* Carousels Section */}
        {layout.homepage.carousels.map((carousel) => {
          if (!carousel.enabled) return null; // Only render enabled carousels

          const sortedCarouselVariants = useMemo(() => {
            let sorted = [...variants];
            const { baseVariable, sortDirection } = carousel;

            const compare = (a: Labubu, b: Labubu, variable: typeof baseVariable) => {
              let valA: any, valB: any;

              if (variable === 'releaseDate') {
                valA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
                valB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
              } else {
                // Ensure the property exists on Labubu and handle potential undefined values
                valA = (a as any)[variable] !== undefined ? (a as any)[variable] : (sortDirection === 'ASC' ? Infinity : -Infinity);
                valB = (b as any)[variable] !== undefined ? (b as any)[variable] : (sortDirection === 'ASC' ? Infinity : -Infinity);
              }

              if (sortDirection === 'ASC') {
                return valA - valB;
              } else { // DESC
                return valB - valA;
              }
            };

            sorted.sort((a, b) => compare(a, b, baseVariable));
            return sorted.slice(0, carousel.limit);
          }, [variants, carousel.baseVariable, carousel.sortDirection, carousel.limit]);

          return (
            <section key={carousel.id}>
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="h-8 w-8 text-primary" /> {/* Re-enabled */}
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
>>>>>>> ff1567965961f00da574fed1b25c29819849ee56
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
<<<<<<< HEAD
          <p className="text-xs text-muted-foreground mt-4">
            <strong>Affiliate Disclosure:</strong> We may earn a commission from purchases made through these links.
            Prices and availability are subject to change.
            <br></br>
            <br></br>Estimated values shown on Labubu Locator are generated using an algorithm that analyzes historical sales, current listings, and market trends. These figures are approximations and not guaranteed market prices.
            <br></br>
            <br></br>
            StockX prices are algorithmically estimated. Labubu Locator does not communicate with or receive data directly from StockX. eBay data is retrieved via the official eBay Browse API.
            <br></br>
            <br></br>
            While we strive for accuracy, estimates may vary due to limited data, market volatility, item uniqueness, or other factors. Values provided are for informational purposes only and should not be relied upon as financial or investment advice.
=======
          <p className="text-sm text-muted-foreground">
            <strong>{content.footer.disclosure.split(':')[0]}:</strong> {content.footer.disclosure.split(':')[1]?.trim()}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {content.footer.details}
>>>>>>> ff1567965961f00da574fed1b25c29819849ee56
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;