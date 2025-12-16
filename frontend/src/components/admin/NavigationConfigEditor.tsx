import { NavigationConfig, NavigationLink } from '@/types/admin-config';
import { ConfigField } from '@/components/ui/ConfigField';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';


interface NavigationLinkEditorProps {
  link: NavigationLink;
  onChange: (newLink: NavigationLink) => void;
  onRemove: () => void;
  index: number;
}

const descriptions: Record<string, string> = {
  'link.label': 'The display text for the navigation link.',
  'link.href': 'The URL or path the link points to.',
  'link.external': 'If true, the link will open in a new tab (external website).',
};

const NavigationLinkEditor: React.FC<NavigationLinkEditorProps> = ({ link, onChange, onRemove, index }) => {
  const handleChange = (field: keyof NavigationLink, newValue: string | boolean) => {
    onChange({
      ...link,
      [field]: newValue,
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-md">Link {index + 1}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <ConfigField
          id={`link-${index}-label`}
          label="Label"
          type="string"
          value={link.label}
          onChange={(val) => handleChange('label', val as string)}
          description={descriptions['link.label']}
        />
        <ConfigField
          id={`link-${index}-href`}
          label="Href"
          type="string"
          value={link.href}
          onChange={(val) => handleChange('href', val as string)}
          description={descriptions['link.href']}
        />
        <ConfigField
          id={`link-${index}-external`}
          label="External Link"
          type="boolean"
          value={link.external ?? false} // Default to false if undefined
          onChange={(val) => handleChange('external', val as boolean)}
          description={descriptions['link.external']}
        />
      </CardContent>
    </Card>
  );
};

interface NavigationConfigEditorProps {
  value: NavigationConfig;
  onChange: (newValue: NavigationConfig) => void;
}

export const NavigationConfigEditor: React.FC<NavigationConfigEditorProps> = ({ value, onChange }) => {
  const handleAddLink = (section: keyof NavigationConfig) => {
    onChange({
      ...value,
      [section]: [...value[section], { label: '', href: '' }],
    });
  };

  const handleUpdateLink = (section: keyof NavigationConfig, index: number, newLink: NavigationLink) => {
    const newLinks = [...value[section]];
    newLinks[index] = newLink;
    onChange({
      ...value,
      [section]: newLinks,
    });
  };

  const handleRemoveLink = (section: keyof NavigationConfig, index: number) => {
    const newLinks = value[section].filter((_, i) => i !== index);
    onChange({
      ...value,
      [section]: newLinks,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Primary Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {value.primaryLinks.map((link, index) => (
            <NavigationLinkEditor
              key={index} // Using index as key is generally discouraged but fine for stable lists or simple editors
              link={link}
              index={index}
              onChange={(newLink) => handleUpdateLink('primaryLinks', index, newLink)}
              onRemove={() => handleRemoveLink('primaryLinks', index)}
            />
          ))}
          <Button variant="outline" onClick={() => handleAddLink('primaryLinks')}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Primary Link
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {value.footerLinks.map((link, index) => (
            <NavigationLinkEditor
              key={index}
              link={link}
              index={index}
              onChange={(newLink) => handleUpdateLink('footerLinks', index, newLink)}
              onRemove={() => handleRemoveLink('footerLinks', index)}
            />
          ))}
          <Button variant="outline" onClick={() => handleAddLink('footerLinks')}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Footer Link
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resources Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {value.resources.map((link, index) => (
            <NavigationLinkEditor
              key={index}
              link={link}
              index={index}
              onChange={(newLink) => handleUpdateLink('resources', index, newLink)}
              onRemove={() => handleRemoveLink('resources', index)}
            />
          ))}
          <Button variant="outline" onClick={() => handleAddLink('resources')}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Resource Link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
