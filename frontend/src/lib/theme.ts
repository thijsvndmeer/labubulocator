import { ThemeModeTokens } from '@/types/admin-config';
import { themeConfig } from '@/config/theme.config';

const VARIABLE_MAP: Record<string, keyof ThemeModeTokens> = {
  '--background': 'background',
  '--foreground': 'foreground',
  '--card': 'card',
  '--card-foreground': 'cardForeground',
  '--popover': 'popover',
  '--popover-foreground': 'popoverForeground',
  '--primary': 'primary',
  '--primary-foreground': 'primaryForeground',
  '--primary-glow': 'primaryGlow',
  '--secondary': 'secondary',
  '--secondary-foreground': 'secondaryForeground',
  '--muted': 'muted',
  '--muted-foreground': 'mutedForeground',
  '--accent': 'accent',
  '--accent-foreground': 'accentForeground',
  '--destructive': 'destructive',
  '--destructive-foreground': 'destructiveForeground',
  '--border': 'border',
  '--input': 'input',
  '--ring': 'ring',
  '--gradient-primary': 'gradientPrimary',
  '--gradient-secondary': 'gradientSecondary',
  '--gradient-subtle': 'gradientSubtle',
  '--shadow-card': 'shadowCard',
  '--shadow-card-hover': 'shadowCardHover',
  '--transition-smooth': 'transitionSmooth',
  '--radius': 'radius',
};

const RARITY_KEYS = [
  '--rarity-common',
  '--rarity-uncommon',
  '--rarity-rare',
  '--rarity-epic',
  '--rarity-legendary',
  '--rarity-secret',
];

const SIDEBAR_KEYS: Record<string, keyof ThemeModeTokens['sidebar']> = {
  '--sidebar-background': 'background',
  '--sidebar-foreground': 'foreground',
  '--sidebar-primary': 'primary',
  '--sidebar-primary-foreground': 'primaryForeground',
  '--sidebar-accent': 'accent',
  '--sidebar-accent-foreground': 'accentForeground',
  '--sidebar-border': 'border',
  '--sidebar-ring': 'ring',
};

function buildCssBlock(selector: string, tokens: ThemeModeTokens) {
  const lines: string[] = [];
  Object.entries(VARIABLE_MAP).forEach(([cssVar, key]) => {
    const value = tokens[key];
    if (value !== undefined) {
      lines.push(`${cssVar}: ${value};`);
    }
  });

  RARITY_KEYS.forEach((cssVar) => {
    const rarityKey = cssVar.replace('--rarity-', '');
    const value = tokens.rarity[rarityKey];
    if (value) {
      lines.push(`${cssVar}: ${value};`);
    }
  });

  Object.entries(SIDEBAR_KEYS).forEach(([cssVar, key]) => {
    const value = tokens.sidebar[key];
    if (value) {
      lines.push(`${cssVar}: ${value};`);
    }
  });

  return `${selector} {${lines.join('')}}`;
}

export function applyThemeConfig() {
  if (typeof document === 'undefined') return;
  const styleId = 'admin-theme-config';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  const lightCss = buildCssBlock(':root', themeConfig.modes.light);
  const darkCss = buildCssBlock('.dark', themeConfig.modes.dark);
  styleEl.textContent = `${lightCss}\n${darkCss}`;
}
