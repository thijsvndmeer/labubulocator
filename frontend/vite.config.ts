import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

type ThemeModeTokens = {
  [key: string]: any;
  rarity: Record<string, string>;
  sidebar: Record<string, string>;
};

type AdminConfig = {
  theme: { modes: { light: ThemeModeTokens; dark: ThemeModeTokens } };
  content: Record<string, any>;
  layout: Record<string, any>;
  catalog: Record<string, any>;
  navigation: {
    primaryLinks: Array<{ label: string; href: string; external?: boolean }>;
    footerLinks: Array<{ label: string; href: string; external?: boolean }>;
    resources: Array<{ label: string; href: string; external?: boolean }>;
  };
  featureFlags: Record<string, boolean>;
};

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const configDir = path.resolve(__dirname, 'src', 'config');
const defaultsDir = path.resolve(repoRoot, 'docs', 'admin-defaults');
const changeLogPath = path.resolve(repoRoot, 'docs', 'admin-change-log.md');

const CONFIG_MAP: Record<keyof AdminConfig, string> = {
  theme: 'theme.config.json',
  content: 'content.config.json',
  layout: 'layout.config.json',
  catalog: 'catalog.config.json',
  navigation: 'navigation.config.json',
  featureFlags: 'feature-flags.json',
};

const requiredThemeKeys = [
  'background', 'foreground', 'card', 'cardForeground', 'popover', 'popoverForeground', 'primary', 'primaryForeground',
  'primaryGlow', 'secondary', 'secondaryForeground', 'muted', 'mutedForeground', 'accent', 'accentForeground',
  'destructive', 'destructiveForeground', 'border', 'input', 'ring', 'gradientPrimary', 'gradientSecondary',
  'gradientSubtle', 'shadowCard', 'shadowCardHover', 'transitionSmooth', 'radius'
];

const rarityKeys = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'secret'];
const sidebarKeys = ['background', 'foreground', 'primary', 'primaryForeground', 'accent', 'accentForeground', 'border', 'ring'];

function ensureLocalhost(req: any, res: any) {
  const hostHeader = (req.headers.host || '').split(':')[0];
  const remote = req.socket?.remoteAddress || '';
  const allowedHosts = ['localhost', '127.0.0.1', '::1'];
  const isLoopback = allowedHosts.includes(hostHeader) || remote.endsWith('127.0.0.1') || remote === '::1' || remote === '::ffff:127.0.0.1';
  if (!isLoopback) {
    res.statusCode = 403;
    res.end('Admin API available on localhost only.');
    return false;
  }
  return true;
}

function ensureToken(req: any, res: any) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return true;
  const provided = req.headers['x-admin-token'];
  if (provided !== expected) {
    res.statusCode = 401;
    res.end('Invalid admin token');
    return false;
  }
  return true;
}

async function readJson(filePath: string) {
  const contents = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(contents);
}

async function loadConfigFromDisk(baseDir: string): Promise<AdminConfig> {
  return {
    theme: await readJson(path.join(baseDir, CONFIG_MAP.theme)),
    content: await readJson(path.join(baseDir, CONFIG_MAP.content)),
    layout: await readJson(path.join(baseDir, CONFIG_MAP.layout)),
    catalog: await readJson(path.join(baseDir, CONFIG_MAP.catalog)),
    navigation: await readJson(path.join(baseDir, CONFIG_MAP.navigation)),
    featureFlags: await readJson(path.join(baseDir, CONFIG_MAP.featureFlags)),
  } as AdminConfig;
}

function validateThemeMode(mode: any, label: string) {
  if (!mode || typeof mode !== 'object') throw new Error(`${label} must be an object`);
  requiredThemeKeys.forEach((key) => {
    if (typeof mode[key] !== 'string') {
      throw new Error(`${label}.${key} must be a string`);
    }
  });
  if (!mode.rarity || typeof mode.rarity !== 'object') {
    throw new Error(`${label}.rarity must be an object`);
  }
  rarityKeys.forEach((key) => {
    if (typeof mode.rarity[key] !== 'string') {
      throw new Error(`${label}.rarity.${key} must be a string`);
    }
  });
  if (!mode.sidebar || typeof mode.sidebar !== 'object') {
    throw new Error(`${label}.sidebar must be an object`);
  }
  sidebarKeys.forEach((key) => {
    if (typeof mode.sidebar[key] !== 'string') {
      throw new Error(`${label}.sidebar.${key} must be a string`);
    }
  });
}

function validateConfig(payload: AdminConfig): AdminConfig {
  if (!payload || typeof payload !== 'object') throw new Error('Payload must be an object');
  validateThemeMode((payload as any).theme?.modes?.light, 'theme.modes.light');
  validateThemeMode((payload as any).theme?.modes?.dark, 'theme.modes.dark');

  // Validate ContentConfig
  ['hero', 'footer'].forEach((key) => {
    if (!(payload as any).content?.[key]) throw new Error(`content.${key} is required`);
  });

  // Validate LayoutConfig
  const homepage = (payload as any).layout?.homepage;
  if (!homepage) throw new Error('layout.homepage is required');
  if (typeof homepage.heroOverlay !== 'boolean') {
    throw new Error('layout.homepage.heroOverlay must be a boolean');
  }
  if (!Array.isArray(homepage.carousels)) {
    throw new Error('layout.homepage.carousels must be an array');
  }
  homepage.carousels.forEach((carousel: any, index: number) => {
    if (typeof carousel.id !== 'string' || carousel.id.length === 0) {
      throw new Error(`Carousel ${index}: id must be a non-empty string`);
    }
    if (typeof carousel.title !== 'string' || carousel.title.length === 0) {
      throw new Error(`Carousel ${index}: title must be a non-empty string`);
    }
    if (typeof carousel.description !== 'string') {
      throw new Error(`Carousel ${index}: description must be a string`);
    }
    if (typeof carousel.enabled !== 'boolean') {
      throw new Error(`Carousel ${index}: enabled must be a boolean`);
    }
    if (typeof carousel.loop !== 'boolean') {
      throw new Error(`Carousel ${index}: loop must be a boolean`);
    }
    if (!['start', 'center', 'end'].includes(carousel.align)) {
      throw new Error(`Carousel ${index}: align must be 'start', 'center', or 'end'`);
    }
    const validBaseVariables = ['estimatedValue', 'lowestPrice', 'highestPrice', 'priceChange24h', 'releaseDate'];
    if (!validBaseVariables.includes(carousel.baseVariable)) {
      throw new Error(`Carousel ${index}: baseVariable must be one of ${validBaseVariables.join(', ')}`);
    }
    if (!['ASC', 'DESC'].includes(carousel.sortDirection)) {
      throw new Error(`Carousel ${index}: sortDirection must be 'ASC' or 'DESC'`);
    }
    const sbp = carousel.slidesPerBreakpoint;
    if (!sbp || typeof sbp.md !== 'number' || typeof sbp.lg !== 'number' || typeof sbp.xl !== 'number') {
      throw new Error(`Carousel ${index}: slidesPerBreakpoint must have md, lg, xl numbers`);
    }
    if (typeof carousel.limit !== 'number' || carousel.limit <= 0) {
      throw new Error(`Carousel ${index}: limit must be a positive number`);
    }
  });


  const catalog = (payload as any).catalog;
  if (!catalog || typeof catalog !== 'object') throw new Error('catalog is required');
  ['csvPath', 'fieldMappings'].forEach((key) => {
    if (!catalog[key]) throw new Error(`catalog.${key} is required`);
  });

  const navigation = (payload as any).navigation;
  if (!navigation || !Array.isArray(navigation.primaryLinks)) throw new Error('navigation.primaryLinks must be an array');
  const navKeys: Array<keyof AdminConfig['navigation']> = ['primaryLinks', 'footerLinks', 'resources'];
  navKeys.forEach((navKey) => {
    const list = (navigation as any)[navKey];
    if (!Array.isArray(list)) throw new Error(`navigation.${navKey} must be an array`);
    list.forEach((item: any, index: number) => {
      if (typeof item.label !== 'string' || typeof item.href !== 'string') {
        throw new Error(`navigation.${navKey}[${index}] must include label and href`);
      }
    });
  });

  Object.entries((payload as any).featureFlags || {}).forEach(([key, value]) => {
    if (typeof value !== 'boolean') {
      throw new Error(`featureFlags.${key} must be a boolean`);
    }
  });

  return payload;
}

async function writeConfig(config: AdminConfig) {
  await fs.mkdir(configDir, { recursive: true });
  const entries: Array<[keyof AdminConfig, string]> = Object.entries(CONFIG_MAP) as any;
  for (const [key, fileName] of entries) {
    const filePath = path.join(configDir, fileName);
    await fs.writeFile(filePath, `${JSON.stringify((config as any)[key], null, 2)}\n`, 'utf-8');
  }
}

async function appendChangeLog(updatedKeys: string[]) {
  const timestamp = new Date().toISOString();
  const entry = `- ${timestamp} updated sections: ${updatedKeys.join(', ')}\n`;
  await fs.appendFile(changeLogPath, entry, 'utf-8');
}

async function parseBody(req: any) {
  return new Promise<any>((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function createAdminHandler() {
  return async function handler(req: any, res: any, next: any) {
    if (!req.url?.startsWith('/admin-api/')) return next();
    if (!ensureLocalhost(req, res) || !ensureToken(req, res)) return;

    try {
      if (req.method === 'GET' && req.url === '/admin-api/config') {
        const config = await loadConfigFromDisk(configDir);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(config));
        return;
      }

      if (req.method === 'GET' && req.url === '/admin-api/defaults') {
        const defaults = await loadConfigFromDisk(defaultsDir);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(defaults));
        return;
      }

      if (req.method === 'POST' && req.url === '/admin-api/save') {
        const payload = await parseBody(req);
        const validated = validateConfig(payload as AdminConfig);
        await writeConfig(validated);
        await appendChangeLog(Object.keys(CONFIG_MAP));
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(validated));
        return;
      }

      if (req.method === 'POST' && req.url === '/admin-api/reset') {
        const defaults = await loadConfigFromDisk(defaultsDir);
        await writeConfig(defaults);
        await appendChangeLog(['reset-to-defaults']);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(defaults));
        return;
      }

      res.statusCode = 404;
      res.end('Not found');
    } catch (error) {
      res.statusCode = 400;
      res.end((error as Error).message);
    }
  };
}

const adminConfigPlugin = (): PluginOption => {
  const handler = createAdminHandler();
  return {
    name: 'local-admin-config-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler as any);
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  plugins: [adminConfigPlugin(), react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./frontend/src/setupTests.ts",
  },
}));
