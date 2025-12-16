import { ThemeModeTokens } from '@/types/admin-config';
import { ConfigField } from '@/components/ui/ConfigField';
import { ConfigColorField } from '@/components/ui/ConfigColorField';
import { SidebarEditor } from './SidebarEditor';
import { RarityEditor } from './RarityEditor';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';


interface ThemeModeEditorProps {
  mode: 'light' | 'dark';
  value: ThemeModeTokens;
  onChange: (newValue: ThemeModeTokens) => void;
}

const descriptions: Record<keyof Omit<ThemeModeTokens, 'rarity' | 'sidebar'>, string> = {
  background: 'Background color for this theme mode (e.g., HSL or hex).',
  foreground: 'Foreground (text) color for this theme mode.',
  card: 'Card background color.',
  cardForeground: 'Card foreground (text) color.',
  popover: 'Popover background color.',
  popoverForeground: 'Popover foreground (text) color.',
  primary: 'Primary brand color.',
  primaryForeground: 'Primary brand foreground (text) color.',
  primaryGlow: 'Primary brand glow color (e.g., for hover effects).',
  secondary: 'Secondary brand color.',
  secondaryForeground: 'Secondary brand foreground (text) color.',
  muted: 'Muted background color.',
  mutedForeground: 'Muted foreground (text) color.',
  accent: 'Accent background color.',
  accentForeground: 'Accent foreground (text) color.',
  destructive: 'Destructive action background color (e.g., for error messages).',
  destructiveForeground: 'Destructive action foreground (text) color.',
  border: 'Border color.',
  input: 'Input field background color.',
  ring: 'Ring color (e.g., for focus states).',
  gradientPrimary: 'CSS gradient string for primary elements.',
  gradientSecondary: 'CSS gradient string for secondary elements.',
  gradientSubtle: 'CSS gradient string for subtle backgrounds.',
  shadowCard: 'CSS box-shadow value for cards.',
  shadowCardHover: 'CSS box-shadow value for cards on hover.',
  transitionSmooth: 'CSS transition property for smooth animations.',
  radius: 'Border radius for elements (e.g., "0.5rem").',
};

export const ThemeModeEditor: React.FC<ThemeModeEditorProps> = ({ mode, value, onChange }) => {
  const handleChange = (field: keyof ThemeModeTokens, newValue: string | number | boolean) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const handleRarityChange = (newRarity: ThemeModeTokens['rarity']) => {
    onChange({
      ...value,
      rarity: newRarity,
    });
  };

  const handleSidebarChange = (newSidebar: ThemeModeTokens['sidebar']) => {
    onChange({
      ...value,
      sidebar: newSidebar,
    });
  };

  const directProps = Object.keys(descriptions) as Array<keyof Omit<ThemeModeTokens, 'rarity' | 'sidebar'>>;

  const nonColorProps = [
    'gradientPrimary',
    'gradientSecondary',
    'gradientSubtle',
    'shadowCard',
    'shadowCardHover',
    'transitionSmooth',
    'radius',
  ];

  return (
    <Card className="space-y-6">
      <CardHeader>
        <CardTitle>{mode === 'light' ? 'Light Theme' : 'Dark Theme'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {directProps.map((key) => {
          const isColorField = !nonColorProps.includes(key);
          const FieldComponent = isColorField ? ConfigColorField : ConfigField;
          const fieldType = (key.includes('gradient') || key.includes('shadow') || key === 'transitionSmooth' || key === 'radius') ? 'textarea' : 'string';

          return (
            <FieldComponent
              key={key}
              id={`${mode}-${key}`}
              label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              type={isColorField ? undefined : fieldType}
              value={value[key] as string}
              onChange={(val) => handleChange(key, val as string)}
              description={descriptions[key]}
            />
          );
        })}

        <RarityEditor value={value.rarity} onChange={handleRarityChange} />
        <SidebarEditor value={value.sidebar} onChange={handleSidebarChange} />
      </CardContent>
    </Card>
  );
};
