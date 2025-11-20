export interface ContentDefinition {
  key: string;
  label: string;
  description: string;
  defaultValue: string;
}

export const siteContentDefinitions: ContentDefinition[] = [
  {
    key: "site.header.brand",
    label: "Header Brand",
    description: "Primary site name that appears in the top navigation.",
    defaultValue: "Labubu Locator",
  },
  {
    key: "site.header.searchPlaceholder",
    label: "Search Placeholder",
    description: "Helper text that appears inside the search input.",
    defaultValue: "Search in catalog...",
  },
  {
    key: "site.header.catalogButton",
    label: "Catalog Button Label",
    description: "Text for the quick access catalog button in the header.",
    defaultValue: "Catalog",
  },
  {
    key: "homepage.hero.title",
    label: "Homepage Hero Title",
    description: "Main headline displayed on the homepage hero section.",
    defaultValue: "Track Your Labubu Collection Value",
  },
  {
    key: "homepage.hero.subtitle",
    label: "Homepage Hero Subtitle",
    description: "Supporting copy shown beneath the hero headline.",
    defaultValue: "Real-time value estimates and price comparisons for your Labubu collection.",
  },
  {
    key: "homepage.hero.image",
    label: "Homepage Hero Background",
    description: "Fully qualified URL for the hero banner background image.",
    defaultValue: "/images/hero-banner.jpg",
  },
  {
    key: "homepage.sections.hot.title",
    label: "Hot Section Title",
    description: "Heading used for the 'What’s Hot' carousel.",
    defaultValue: "What's Hot",
  },
  {
    key: "homepage.sections.hot.subtitle",
    label: "Hot Section Subtitle",
    description: "Short description for the 'What’s Hot' carousel.",
    defaultValue: "Top daily price increases",
  },
  {
    key: "homepage.sections.losers.title",
    label: "Biggest Losers Title",
    description: "Heading used for the biggest daily decliners.",
    defaultValue: "Biggest Losers",
  },
  {
    key: "homepage.sections.losers.subtitle",
    label: "Biggest Losers Subtitle",
    description: "Short description for the biggest losers carousel.",
    defaultValue: "Top daily price decreases",
  },
  {
    key: "homepage.sections.highest.title",
    label: "Highest Value Title",
    description: "Heading used for the highest value carousel.",
    defaultValue: "Highest Value",
  },
  {
    key: "homepage.sections.highest.subtitle",
    label: "Highest Value Subtitle",
    description: "Short description for the highest value carousel.",
    defaultValue: "Highest value Labubus",
  },
  {
    key: "footer.disclaimer",
    label: "Footer Disclaimer",
    description: "Footer disclosure content. Supports multi-line text separated by blank lines.",
    defaultValue: `Affiliate Disclosure: We may earn a commission from purchases made through these links. Prices and availability are subject to change.\n\nEstimated values shown on Labubu Locator are generated using an algorithm that analyzes historical sales, current listings, and market trends. These figures are approximations and not guaranteed market prices.\n\nStockX prices are algorithmically estimated. Labubu Locator does not communicate with or receive data directly from StockX. eBay data is retrieved via the official eBay Browse API.`,
  },
];

export const defaultSiteContent = siteContentDefinitions.reduce<Record<string, string>>((acc, def) => {
  acc[def.key] = def.defaultValue;
  return acc;
}, {});

export const siteContentDefinitionMap = siteContentDefinitions.reduce<Record<string, ContentDefinition>>((acc, def) => {
  acc[def.key] = def;
  return acc;
}, {});
