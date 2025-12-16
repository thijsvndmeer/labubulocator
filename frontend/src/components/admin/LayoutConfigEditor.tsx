import { LayoutConfig, CarouselConfig } from '@/types/admin-config';
import { ConfigField } from '@/components/ui/ConfigField';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarouselEditor } from './CarouselEditor';

interface LayoutConfigEditorProps {
  value: LayoutConfig;
  onChange: (newValue: LayoutConfig) => void;
}

const descriptions: Record<string, string> = {
  'homepage.heroOverlay': 'Display an overlay on the hero section of the homepage.',
  'cards.showCollectionStatus': 'Display collection status on variant cards.',
  'cards.badgeVariant': 'Style of the badge indicating collection status ("floating" or "inline").',
};

export const LayoutConfigEditor: React.FC<LayoutConfigEditorProps> = ({ value, onChange }) => {
  const handleChange = (path: string, newValue: string | number | boolean) => {
    // This is a simplified deep update for properties outside the carousels array
    const newConfig = JSON.parse(JSON.stringify(value)); // Deep copy
    const parts = path.split('.');
    let current: any = newConfig;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = newValue;
    onChange(newConfig);
  };

  const handleAddCarousel = () => {
    const newCarousel: CarouselConfig = {
      id: `carousel-${Date.now()}`,
      title: 'New Carousel',
      description: '',
      enabled: true,
      loop: true,
      align: 'start',
      sortBy: 'lowestPrice',
      slidesPerBreakpoint: { md: 2, lg: 3, xl: 4 },
      limit: 15,
    };
    onChange({
      ...value,
      homepage: {
        ...value.homepage,
        carousels: [...value.homepage.carousels, newCarousel],
      },
    });
  };

  const handleUpdateCarousel = (index: number, updatedCarousel: CarouselConfig) => {
    const newCarousels = [...value.homepage.carousels];
    newCarousels[index] = updatedCarousel;
    onChange({
      ...value,
      homepage: {
        ...value.homepage,
        carousels: newCarousels,
      },
    });
  };

  const handleRemoveCarousel = (index: number) => {
    const newCarousels = value.homepage.carousels.filter((_, i) => i !== index);
    onChange({
      ...value,
      homepage: {
        ...value.homepage,
        carousels: newCarousels,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Homepage Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConfigField
            id="homepage-hero-overlay"
            label="Hero Overlay"
            type="boolean"
            value={value.homepage.heroOverlay}
            onChange={(val) => handleChange('homepage.heroOverlay', val)}
            description={descriptions['homepage.heroOverlay']}
          />

          <CardHeader className="pl-0 pb-0">
            <CardTitle className="text-lg">Homepage Carousels</CardTitle>
          </CardHeader>
          <div className="pl-6 space-y-4 border-l">
            {value.homepage.carousels.map((carousel, index) => (
              <CarouselEditor
                key={carousel.id}
                value={carousel}
                onChange={(updatedCarousel) => handleUpdateCarousel(index, updatedCarousel)}
                onRemove={() => handleRemoveCarousel(index)}
                index={index}
              />
            ))}
            <Button variant="outline" onClick={handleAddCarousel}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Carousel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Card Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConfigField
            id="cards-show-collection-status"
            label="Show Collection Status"
            type="boolean"
            value={value.cards.showCollectionStatus}
            onChange={(val) => handleChange('cards.showCollectionStatus', val)}
            description={descriptions['cards.showCollectionStatus']}
          />
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="cards-badge-variant" className="text-right flex items-center gap-2">
              Badge Variant
              {descriptions['cards.badgeVariant'] && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{descriptions['cards.badgeVariant']}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Label>
            <Select
              value={value.cards.badgeVariant}
              onValueChange={(val) => handleChange('cards.badgeVariant', val)}
            >
              <SelectTrigger className="col-span-2">
                <SelectValue placeholder="Select badge variant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="floating">Floating</SelectItem>
                <SelectItem value="inline">Inline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
