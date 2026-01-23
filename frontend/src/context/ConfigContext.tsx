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
      // Filter out messages not originating from the current window (e.g., extensions)
      // And ensure the message has our specific type identifier
      if (event.origin !== window.location.origin || !event.data || event.data.type !== 'config-update') {
          return;
      }

      // ... (rest of the existing validation and error handling) ...
      if (
        event.data &&
        typeof event.data === 'object' &&
        'theme' in event.data &&
        'content' in event.data &&
        'layout' in event.data &&
        'catalog' in event.data &&
        'navigation' in event.data &&
        'featureFlags' in event.data
      ) {
        try {
          const newConfig = event.data as AdminConfig; // Type assertion

          // Further check for required properties in newConfig, e.g. for layout.homepage.carousels
          if (!newConfig.layout || !newConfig.layout.homepage || !Array.isArray(newConfig.layout.homepage.carousels)) {
            console.error("ConfigProvider: Incoming config is missing required layout.homepage.carousels", newConfig);
            return;
          }

          setConfig(newConfig);
        } catch (error) {
          console.error("ConfigProvider: Error setting config from postMessage:", error, event.data);
        }
      } else {
        console.warn("ConfigProvider: Received invalid message data format:", event.data);
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
