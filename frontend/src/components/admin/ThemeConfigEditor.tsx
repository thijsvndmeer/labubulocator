import { ThemeConfig } from '@/types/admin-config';
import { ThemeModeEditor } from './ThemeModeEditor';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ThemeConfigEditorProps {
  value: ThemeConfig;
  onChange: (newValue: ThemeConfig) => void;
}

export const ThemeConfigEditor: React.FC<ThemeConfigEditorProps> = ({ value, onChange }) => {
  const handleModeChange = (mode: 'light' | 'dark', newModeValue: ThemeConfig['modes']['light']) => {
    onChange({
      modes: {
        ...value.modes,
        [mode]: newModeValue,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Modes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ThemeModeEditor
            mode="light"
            value={value.modes.light}
            onChange={(newLightMode) => handleModeChange('light', newLightMode)}
          />
          <ThemeModeEditor
            mode="dark"
            value={value.modes.dark}
            onChange={(newDarkMode) => handleModeChange('dark', newDarkMode)}
          />
        </CardContent>
      </Card>
    </div>
  );
};
