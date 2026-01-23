import React, { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ConfigField } from './ConfigField';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConfigRadiusFieldProps {
  id: string;
  label: string;
  value: string; // radius string
  onChange: (value: string) => void;
  description?: string;
  className?: string;
}

// Utility to parse radius string
interface RadiusParts {
  value: number;
  unit: string;
}

const parseRadiusString = (radiusString: string): RadiusParts => {
  const defaultParts: RadiusParts = {
    value: 0,
    unit: 'rem',
  };

  const match = radiusString.match(/([\d.]+)(px|rem|em|%)?/);
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2] || 'rem', // Default to rem if no unit specified
    };
  }
  return defaultParts;
};

// Utility to format radius string
const formatRadiusString = (parts: RadiusParts): string => {
  return `${parts.value}${parts.unit}`;
};

export const ConfigRadiusField: React.FC<ConfigRadiusFieldProps> = ({
  id,
  label,
  value,
  onChange,
  description,
  className,
}) => {
  const [radiusParts, setRadiusParts] = useState<RadiusParts>(parseRadiusString(value));

  useEffect(() => {
    setRadiusParts(parseRadiusString(value));
  }, [value]);

  const handlePartChange = (part: keyof RadiusParts, newValue: string | number | boolean) => {
    const newParts = { ...radiusParts, [part]: newValue };
    setRadiusParts(newParts);
    onChange(formatRadiusString(newParts));
  };

  return (
    <div className={`space-y-4 p-4 border rounded-md ${className}`}>
      <Label className="flex items-center gap-2">
        {label}
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Label>
      <div className="pl-4 space-y-3 border-l">
        <ConfigField
          id={`${id}-value`}
          label="Value"
          type="number"
          value={radiusParts.value}
          onChange={(val) => handlePartChange('value', val)}
        />
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor={`${id}-unit`} className="text-right">Unit</Label>
          <Select
            value={radiusParts.unit}
            onValueChange={(val) => handlePartChange('unit', val)}
          >
            <SelectTrigger className="col-span-2">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="px">px</SelectItem>
              <SelectItem value="rem">rem</SelectItem>
              <SelectItem value="em">em</SelectItem>
              <SelectItem value="%">%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
