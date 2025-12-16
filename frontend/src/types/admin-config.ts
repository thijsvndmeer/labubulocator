export interface ThemeModeTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  primaryGlow: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  gradientPrimary: string;
  gradientSecondary: string;
  gradientSubtle: string;
  shadowCard: string;
  shadowCardHover: string;
  transitionSmooth: string;
  radius: string;
  rarity: Record<string, string>;
  sidebar: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    ring: string;
  };
}

export interface ThemeConfig {
  modes: {
    light: ThemeModeTokens;
    dark: ThemeModeTokens;
  };
}

export interface ContentConfig {
  hero: {
    title: string;
    subtitle: string;
    helpText: string;
  };
  trending: {
    title: string;
    description: string;
  };
  footer: {
    disclosure: string;
    details: string;
  };
}

export interface LayoutConfig {
  homepage: {
    heroOverlay: boolean;
    showTrendingCarousel: boolean;
    trendingCarousel: {
      loop: boolean;
      align: "start" | "center" | "end";
      trendingSortBy: "lowestPrice" | "biggestLoss24h" | "biggestGain24h";
      slidesPerBreakpoint: {
        md: number;
        lg: number;
        xl: number;
      };
    };
  };
  cards: {
    showCollectionStatus: boolean;
    badgeVariant: "floating" | "inline";
  };
}

export interface CatalogConfig {
  csvPath: string;
  fieldMappings: {
    name: string;
    sku: string;
    series: string;
    variant: string;
    rarity: string;
    lowestPrice: string;
    stockStatus: string;
  };
  display: {
    showMsrp: boolean;
    showVariant: boolean;
  };
}

export interface NavigationLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavigationConfig {
  primaryLinks: NavigationLink[];
  footerLinks: NavigationLink[];
  resources: NavigationLink[];
}

export interface FeatureFlags {
  affiliateButtons: boolean;
  stockStatus: boolean;
  priceChange: boolean;
  collectionGlow: boolean;
}

export interface AdminConfig {
  theme: ThemeConfig;
  content: ContentConfig;
  layout: LayoutConfig;
  catalog: CatalogConfig;
  navigation: NavigationConfig;
  featureFlags: FeatureFlags;
}
