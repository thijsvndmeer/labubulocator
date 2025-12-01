import { Navigation } from "@labubu/common";

export interface SiteConfigurationResponse {
  settings: Record<string, string>;
  content: Record<string, string>;
  navigation: (Navigation & { parsedStructure: NavigationNode[] })[];
}

export interface NavigationNode {
  label: string;
  path: string;
  children?: NavigationNode[];
}

export interface SiteCopy {
  brandName: string;
  brandTagline: string;
  singularCollectible: string;
  pluralCollectible: string;
  catalogLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroImage: string;
  marketDataCopy: string;
}
