import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminConfig } from '@/types/admin-config';

// Import initial configs
import { themeConfig as initialThemeConfig } from '@/config/theme.config';
import { contentConfig as initialContentConfig } from '@/config/content.config';
import { layoutConfig as initialLayoutConfig } from '@/config/layout.config';
import { catalogConfig as initialCatalogConfig } from '@/config/catalog.config';
import { navigationConfig as initialNavigationConfig } from '@/config/navigation.config';
import { featureFlags as initialFeatureFlags } from '@/config/feature-flags';

// Combine initial configs
const initialConfig: AdminConfig = {
  theme: initialThemeConfig,
  content: initialContentConfig,
  layout: initialLayoutConfig,
  catalog: initialCatalogConfig,
  navigation: initialNavigationConfig,
  featureFlags: initialFeatureFlags,
};

const ConfigContext = createContext<AdminConfig>(initialConfig);

export const useConfig = () => {
  return useContext(ConfigContext);
};

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<AdminConfig>(initialConfig);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic security: check origin if possible, and data structure.
      // For now, we'll be lenient as it's a local dev tool.
      if (event.data && typeof event.data === 'object' && 'theme' in event.data && 'content' in event.data) {
        setConfig(event.data);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};
