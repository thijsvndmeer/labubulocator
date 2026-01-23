import { CarouselConfig } from '@/types/admin-config';
import { ConfigField } from '@/components/ui/ConfigField';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface CarouselEditorProps {
  value: CarouselConfig;
  onChange: (newValue: CarouselConfig) => void;
  onRemove: () => void;
  index: number;
}

const descriptions: Record<string, string> = {
  id: 'Unique identifier for this carousel.',
  title: 'Title displayed above the carousel.',
  description: 'Short description for the carousel.',
  enabled: 'Toggle to enable or disable this carousel on the homepage.',
  loop: 'Enable continuous looping for the carousel.',
  align: 'Alignment of items in the carousel (e.g., "start", "center", "end").',
  baseVariable: 'The base variable used for sorting carousel items.',
  sortDirection: 'The direction of sorting (ascending or descending).',
  'slidesPerBreakpoint.md': 'Number of slides visible at medium screen sizes (768px and up).',
  'slidesPerBreakpoint.lg': 'Number of slides visible at large screen sizes (1024px and up).',
  'slidesPerBreakpoint.xl': 'Number of slides visible at extra-large screen sizes (1280px and up).',
  limit: 'Maximum number of items to display in the carousel.',
};

export const CarouselEditor: React.FC<CarouselEditorProps> = ({ value, onChange, onRemove, index }) => {
  const handleChange = (path: string, newValue: string | number | boolean) => {
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
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-md">Carousel {index + 1}: {value.title || 'New Carousel'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <ConfigField
          id={`carousel-${index}-id`}
          label="ID"
          type="string"
          value={value.id}
          onChange={(val) => handleChange('id', val)}
          description={descriptions.id}
        />
        <ConfigField
          id={`carousel-${index}-title`}
          label="Title"
          type="string"
          value={value.title}
          onChange={(val) => handleChange('title', val)}
          description={descriptions.title}
        />
        <ConfigField
          id={`carousel-${index}-description`}
          label="Description"
          type="textarea"
          value={value.description}
          onChange={(val) => handleChange('description', val)}
          description={descriptions.description}
        />
        <ConfigField
          id={`carousel-${index}-enabled`}
          label="Enabled"
          type="boolean"
          value={value.enabled}
          onChange={(val) => handleChange('enabled', val)}
          description={descriptions.enabled}
        />
        <ConfigField
          id={`carousel-${index}-limit`}
          label="Limit"
          type="number"
          value={value.limit}
          onChange={(val) => handleChange('limit', val)}
          description={descriptions.limit}
        />
        <ConfigField
          id={`carousel-${index}-loop`}
          label="Loop Carousel"
          type="boolean"
          value={value.loop}
          onChange={(val) => handleChange('loop', val)}
          description={descriptions.loop}
        />
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor={`carousel-${index}-align`} className="text-right flex items-center gap-2">
            Align
            {descriptions.align && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{descriptions.align}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
          <Select
            value={value.align}
            onValueChange={(val) => handleChange('align', val)}
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
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor={`carousel-${index}-base-variable`} className="text-right flex items-center gap-2">
            Base Variable
            {descriptions.baseVariable && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{descriptions.baseVariable}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
          <Select
            value={value.baseVariable}
            onValueChange={(val) => handleChange('baseVariable', val)}
          >
            <SelectTrigger className="col-span-2">
              <SelectValue placeholder="Select base variable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="estimatedValue">Estimated Value</SelectItem>
              <SelectItem value="lowestPrice">Lowest Price</SelectItem>
              <SelectItem value="highestPrice">Highest Price</SelectItem>
              <SelectItem value="priceChange24h">24h Price Change</SelectItem>
              <SelectItem value="releaseDate">Release Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor={`carousel-${index}-sort-direction`} className="text-right flex items-center gap-2">
            Sort Direction
            {descriptions.sortDirection && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{descriptions.sortDirection}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
          <Select
            value={value.sortDirection}
            onValueChange={(val) => handleChange('sortDirection', val)}
          >
            <SelectTrigger className="col-span-2">
              <SelectValue placeholder="Select sort direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASC">Ascending</SelectItem>
              <SelectItem value="DESC">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardHeader className="pl-0 pb-0">
          <CardTitle className="text-md">Slides Per Breakpoint</CardTitle>
        </CardHeader>
        <div className="pl-6 space-y-4 border-l">
          <ConfigField
            id={`carousel-${index}-md`}
            label="Medium"
            type="number"
            value={value.slidesPerBreakpoint.md}
            onChange={(val) => handleChange('slidesPerBreakpoint.md', val)}
            description={descriptions['slidesPerBreakpoint.md']}
          />
          <ConfigField
            id={`carousel-${index}-lg`}
            label="Large"
            type="number"
            value={value.slidesPerBreakpoint.lg}
            onChange={(val) => handleChange('slidesPerBreakpoint.lg', val)}
            description={descriptions['slidesPerBreakpoint.lg']}
          />
          <ConfigField
            id={`carousel-${index}-xl`}
            label="Extra Large"
            type="number"
            value={value.slidesPerBreakpoint.xl}
            onChange={(val) => handleChange('slidesPerBreakpoint.xl', val)}
            description={descriptions['slidesPerBreakpoint.xl']}
          />
        </div>
      </CardContent>
    </Card>
  );
};