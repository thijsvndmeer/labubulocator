import { useEffect } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { applyThemeConfig } from '@/lib/theme';
import { ThemeConfig } from '@/types/admin-config';

export const ThemeUpdater = () => {
  const { theme } = useConfig();

  useEffect(() => {
    applyThemeConfig(theme as ThemeConfig);
  }, [theme]);

  return null;
};
