import { LayoutConfig } from '@/types/admin-config';
import { ConfigField } from '@/components/ui/ConfigField';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface LayoutConfigEditorProps {
  value: LayoutConfig;
  onChange: (newValue: LayoutConfig) => void;
}

const descriptions: Record<string, string> = {
  'homepage.heroOverlay': 'Display an overlay on the hero section of the homepage.',
  'homepage.showTrendingCarousel': 'Enable or disable the display of the trending carousel on the homepage.',
  'homepage.trendingCarousel.loop': 'Enable continuous looping for the trending carousel.',
  'homepage.trendingCarousel.align': 'Alignment of items in the trending carousel (e.g., "start", "center", "end").',
  'homepage.trendingCarousel.trendingSortBy': 'Criteria to sort items in the trending carousel (e.g., "lowestPrice", "biggestLoss24h", "biggestGain24h").',
  'homepage.trendingCarousel.slidesPerBreakpoint.md': 'Number of slides visible at medium screen sizes.',
  'homepage.trendingCarousel.slidesPerBreakpoint.lg': 'Number of slides visible at large screen sizes.',
  'homepage.trendingCarousel.slidesPerBreakpoint.xl': 'Number of slides visible at extra-large screen sizes.',
  'cards.showCollectionStatus': 'Display collection status on variant cards.',
  'cards.badgeVariant': 'Style of the badge indicating collection status ("floating" or "inline").',
};

export const LayoutConfigEditor: React.FC<LayoutConfigEditorProps> = ({ value, onChange }) => {
  const handleChange = (path: string, newValue: string | number | boolean) => {
    // This is a simplified deep update. For more complex nested structures,
    // a library like 'lodash.set' or a recursive function would be better.
    const newConfig = JSON.parse(JSON.stringify(value)); // Deep copy
    const parts = path.split('.');
    let current: any = newConfig;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = newValue;
    onChange(newConfig);
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
          <ConfigField
            id="homepage-show-trending-carousel"
            label="Show Trending Carousel"
            type="boolean"
            value={value.homepage.showTrendingCarousel}
            onChange={(val) => handleChange('homepage.showTrendingCarousel', val)}
            description={descriptions['homepage.showTrendingCarousel']}
          />
          <CardHeader className="pl-0 pb-0">
            <CardTitle className="text-lg">Trending Carousel</CardTitle>
          </CardHeader>
          <div className="pl-6 space-y-4 border-l">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="trending-carousel-sort-by" className="text-right flex items-center gap-2">
                Sort By
                {descriptions['homepage.trendingCarousel.trendingSortBy'] && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{descriptions['homepage.trendingCarousel.trendingSortBy']}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </Label>
              <Select
                value={value.homepage.trendingCarousel.trendingSortBy}
                onValueChange={(val) => handleChange('homepage.trendingCarousel.trendingSortBy', val)}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Select sort criteria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lowestPrice">Lowest Price</SelectItem>
                  <SelectItem value="biggestLoss24h">Biggest Loss (24h)</SelectItem>
                  <SelectItem value="biggestGain24h">Biggest Gain (24h)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ConfigField
              id="trending-carousel-loop"
              label="Loop Carousel"
              type="boolean"
              value={value.homepage.trendingCarousel.loop}
              onChange={(val) => handleChange('homepage.trendingCarousel.loop', val)}
              description={descriptions['homepage.trendingCarousel.loop']}
            />
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="trending-carousel-align" className="text-right flex items-center gap-2">
                Align
                {descriptions['homepage.trendingCarousel.align'] && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{descriptions['homepage.trendingCarousel.align']}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </Label>
              <Select
                value={value.homepage.trendingCarousel.align}
                onValueChange={(val) => handleChange('homepage.trendingCarousel.align', val)}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Start</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="end">End</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardHeader className="pl-0 pb-0">
              <CardTitle className="text-lg">Slides Per Breakpoint</CardTitle>
            </CardHeader>
            <div className="pl-6 space-y-4 border-l">
              <ConfigField
                id="trending-carousel-md"
                label="Medium"
                type="number"
                value={value.homepage.trendingCarousel.slidesPerBreakpoint.md}
                onChange={(val) => handleChange('homepage.trendingCarousel.slidesPerBreakpoint.md', val)}
                description={descriptions['homepage.trendingCarousel.slidesPerBreakpoint.md']}
              />
              <ConfigField
                id="trending-carousel-lg"
                label="Large"
                type="number"
                value={value.homepage.trendingCarousel.slidesPerBreakpoint.lg}
                onChange={(val) => handleChange('homepage.trendingCarousel.slidesPerBreakpoint.lg', val)}
                description={descriptions['homepage.trendingCarousel.slidesPerBreakpoint.lg']}
              />
              <ConfigField
                id="trending-carousel-xl"
                label="Extra Large"
                type="number"
                value={value.homepage.trendingCarousel.slidesPerBreakpoint.xl}
                onChange={(val) => handleChange('homepage.trendingCarousel.slidesPerBreakpoint.xl', val)}
                description={descriptions['homepage.trendingCarousel.slidesPerBreakpoint.xl']}
              />
            </div>
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