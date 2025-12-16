import { ThemeModeTokens } from '@/types/admin-config';
import { ConfigColorField } from '@/components/ui/ConfigColorField';
import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';


interface RarityEditorProps {
  value: ThemeModeTokens['rarity'];
  onChange: (newValue: ThemeModeTokens['rarity']) => void;
}

const descriptions: Record<keyof ThemeModeTokens['rarity'], string> = {
  common: 'Color for common rarity items.',
  uncommon: 'Color for uncommon rarity items.',
  rare: 'Color for rare rarity items.',
  epic: 'Color for epic rarity items.',
  legendary: 'Color for legendary rarity items.',
  secret: 'Color for secret rarity items.',
};

export const RarityEditor: React.FC<RarityEditorProps> = ({ value, onChange }) => {
  const handleChange = (field: keyof ThemeModeTokens['rarity'], newValue: string) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  return (
    <>
      <CardHeader className="pl-0 pb-0">
        <CardTitle className="text-lg">Rarity Colors</CardTitle>
      </CardHeader>
      <CardContent className="pl-6 space-y-4 border-l">
        {Object.entries(value).map(([key, val]) => (
          <ConfigColorField
            key={key}
            id={`rarity-${key}`}
            label={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize first letter
            value={val}
            onChange={(newVal) => handleChange(key as keyof ThemeModeTokens['rarity'], newVal as string)}
            description={descriptions[key as keyof ThemeModeTokens['rarity']]}
          />
        ))}
      </CardContent>
    </>
  );
};
