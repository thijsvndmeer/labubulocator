import { ContentConfig } from '@/types/admin-config';
import { ConfigField } from '@/components/ui/ConfigField';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentConfigEditorProps {
  value: ContentConfig;
  onChange: (newValue: ContentConfig) => void;
}

const descriptions: Record<string, string> = {
  'hero.title': 'The main title displayed in the hero section of the homepage.',
  'hero.subtitle': 'The secondary text displayed under the hero title.',
  'hero.helpText': 'Additional helper text displayed in the hero section.',
  'footer.disclosure': 'The affiliate disclosure text in the footer.',
  'footer.details': 'Additional details or copyright information in the footer.',
};

export const ContentConfigEditor: React.FC<ContentConfigEditorProps> = ({ value, onChange }) => {
  const handleChange = (section: keyof ContentConfig, field: string, newValue: string | number | boolean) => {
    onChange({
      ...value,
      [section]: {
        ...value[section],
        [field]: newValue,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConfigField
            id="hero-title"
            label="Title"
            type="textarea"
            value={value.hero.title}
            onChange={(val) => handleChange('hero', 'title', val)}
            description={descriptions['hero.title']}
          />
          <ConfigField
            id="hero-subtitle"
            label="Subtitle"
            type="textarea"
            value={value.hero.subtitle}
            onChange={(val) => handleChange('hero', 'subtitle', val)}
            description={descriptions['hero.subtitle']}
          />
          <ConfigField
            id="hero-helpText"
            label="Help Text"
            type="textarea"
            value={value.hero.helpText}
            onChange={(val) => handleChange('hero', 'helpText', val)}
            description={descriptions['hero.helpText']}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConfigField
            id="footer-disclosure"
            label="Disclosure"
            type="textarea"
            value={value.footer.disclosure}
            onChange={(val) => handleChange('footer', 'disclosure', val)}
            description={descriptions['footer.disclosure']}
          />
          <ConfigField
            id="footer-details"
            label="Details"
            type="textarea"
            value={value.footer.details}
            onChange={(val) => handleChange('footer', 'details', val)}
            description={descriptions['footer.details']}
          />
        </CardContent>
      </Card>
    </div>
  );
};