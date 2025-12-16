import { ThemeConfig, ThemeModeTokens } from '@/types/admin-config';
import { themeConfig as staticThemeConfig } from '@/config/theme.config';

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

export function applyThemeConfig(theme?: ThemeConfig) {
  const configToApply = theme || staticThemeConfig;
  if (typeof document === 'undefined' || !configToApply) return;
  const styleId = 'admin-theme-config';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  const lightCss = buildCssBlock(':root', configToApply.modes.light);
  const darkCss = buildCssBlock('.dark', configToApply.modes.dark);
  styleEl.textContent = `${lightCss}\n${darkCss}`;
}
