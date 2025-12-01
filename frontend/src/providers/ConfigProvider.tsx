import { createContext, ReactNode, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { NavigationNode, SiteConfigurationResponse, SiteCopy } from "@/types/config";

type ConfigContextValue = {
  config?: SiteConfigurationResponse;
  loading: boolean;
  copy: SiteCopy;
  navigation: NavigationNode[];
};

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

const defaultCopy: SiteCopy = {
  brandName: "Collector Control",
  brandTagline: "Track and manage every collectible in one place",
  singularCollectible: "Collectible",
  pluralCollectible: "Collectibles",
  catalogLabel: "Catalog",
  heroTitle: "Track Your Collection Value",
  heroSubtitle: "Real-time value estimates and price comparisons for your collectibles.",
  heroCtaLabel: "Browse the catalog",
  heroImage: "/images/hero-banner.jpg",
  marketDataCopy:
    "Estimated values are generated from historical sales, current listings, and market trends. They are approximations and not guaranteed market prices.",
};

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useQuery<SiteConfigurationResponse>({
    queryKey: ["site-configuration"],
    queryFn: () => api.config.get(),
  });

  const copy = useMemo<SiteCopy>(() => {
    const settings = data?.settings ?? {};
    const content = data?.content ?? {};

    return {
      brandName: settings["brand.name"] || defaultCopy.brandName,
      brandTagline: settings["brand.tagline"] || defaultCopy.brandTagline,
      singularCollectible: settings["collectible.singular"] || defaultCopy.singularCollectible,
      pluralCollectible: settings["collectible.plural"] || defaultCopy.pluralCollectible,
      catalogLabel: settings["collectible.catalogLabel"] || defaultCopy.catalogLabel,
      heroTitle: content["hero.title"] || defaultCopy.heroTitle,
      heroSubtitle: content["hero.subtitle"] || defaultCopy.heroSubtitle,
      heroCtaLabel: content["hero.ctaLabel"] || defaultCopy.heroCtaLabel,
      heroImage: content["hero.image"] || defaultCopy.heroImage,
      marketDataCopy: content["copy.marketData"] || defaultCopy.marketDataCopy,
    };
  }, [data]);

  const navigation = useMemo<NavigationNode[]>(() => {
    if (!data?.navigation?.length) return [];
    return data.navigation[0]?.parsedStructure ?? [];
  }, [data?.navigation]);

  return (
    <ConfigContext.Provider value={{ config: data, loading: isLoading, copy, navigation }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};

