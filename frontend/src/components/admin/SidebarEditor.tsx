import { ThemeModeTokens } from '@/types/admin-config';
import { ConfigColorField } from '@/components/ui/ConfigColorField';
import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';


interface SidebarEditorProps {
  value: ThemeModeTokens['sidebar'];
  onChange: (newValue: ThemeModeTokens['sidebar']) => void;
}

const descriptions: Record<keyof ThemeModeTokens['sidebar'], string> = {
  background: 'Background color of the sidebar.',
  foreground: 'Foreground (text) color of the sidebar.',
  primary: 'Primary color used in the sidebar.',
  primaryForeground: 'Foreground color for primary elements in the sidebar.',
  accent: 'Accent color used in the sidebar.',
  accentForeground: 'Foreground color for accent elements in the sidebar.',
  border: 'Border color of the sidebar.',
  ring: 'Ring color (e.g., for focus states) in the sidebar.',
};

export const SidebarEditor: React.FC<SidebarEditorProps> = ({ value, onChange }) => {
  const handleChange = (field: keyof ThemeModeTokens['sidebar'], newValue: string) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  return (
    <>
      <CardHeader className="pl-0 pb-0">
        <CardTitle className="text-lg">Sidebar Colors</CardTitle>
      </CardHeader>
      <CardContent className="pl-6 space-y-4 border-l">
        {Object.entries(value).map(([key, val]) => (
          <ConfigColorField
            key={key}
            id={`sidebar-${key}`}
            label={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize first letter
            value={val}
            onChange={(newVal) => handleChange(key as keyof ThemeModeTokens['sidebar'], newVal as string)}
            description={descriptions[key as keyof ThemeModeTokens['sidebar']]}
          />
        ))}
      </CardContent>
    </>
  );
};
