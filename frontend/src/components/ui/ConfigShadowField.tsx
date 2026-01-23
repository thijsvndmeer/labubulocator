import React, { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ConfigField } from './ConfigField';
import { ConfigColorField } from './ConfigColorField';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ConfigShadowFieldProps {
  id: string;
  label: string;
  value: string; // box-shadow string
  onChange: (value: string) => void;
  description?: string;
  className?: string;
}

// Utility to parse box-shadow string
interface ShadowParts {
  inset: boolean;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadRadius: number;
  color: string;
  unit: string; // Assuming px for now for numerical values
}

const parseShadowString = (shadowString: string): ShadowParts => {
  const defaultParts: ShadowParts = {
    inset: false,
    offsetX: 0,
    offsetY: 0,
    blurRadius: 0,
    spreadRadius: 0,
    color: '0 0% 0% / 0.5',
    unit: 'px',
  };

  const match = shadowString.match(/(inset\s*)?(-?\d+)(\w*)\s+(-?\d+)(\w*)\s+(-?\d+)(\w*)\s+(-?\d+)(\w*)\s*(.*)/);
  if (match) {
    const inset = !!match[1];
    const offsetX = parseFloat(match[2]);
    const offsetY = parseFloat(match[4]);
    const blurRadius = parseFloat(match[6]);
    const spreadRadius = parseFloat(match[8]);
    const color = match[10].trim();
    const unit = match[3] || 'px'; // Assuming all units are the same for simplicity

    return {
      inset,
      offsetX,
      offsetY,
      blurRadius,
      spreadRadius,
      color,
      unit,
    };
  }
  return defaultParts;
};

// Utility to format box-shadow string
const formatShadowString = (parts: ShadowParts): string => {
  const inset = parts.inset ? 'inset ' : '';
  const unit = parts.unit || 'px';
  return `${inset}${parts.offsetX}${unit} ${parts.offsetY}${unit} ${parts.blurRadius}${unit} ${parts.spreadRadius}${unit} ${parts.color}`;
};

export const ConfigShadowField: React.FC<ConfigShadowFieldProps> = ({
  id,
  label,
  value,
  onChange,
  description,
  className,
}) => {
  const [shadowParts, setShadowParts] = useState<ShadowParts>(parseShadowString(value));

  useEffect(() => {
    setShadowParts(parseShadowString(value));
  }, [value]);

  const handlePartChange = (part: keyof ShadowParts, newValue: string | number | boolean) => {
    const newParts = { ...shadowParts, [part]: newValue };
    setShadowParts(newParts);
    onChange(formatShadowString(newParts));
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
          id={`${id}-inset`}
          label="Inset"
          type="boolean"
          value={shadowParts.inset}
          onChange={(val) => handlePartChange('inset', val)}
        />
        <ConfigField
          id={`${id}-offset-x`}
          label="Offset X (px)"
          type="number"
          value={shadowParts.offsetX}
          onChange={(val) => handlePartChange('offsetX', val)}
        />
        <ConfigField
          id={`${id}-offset-y`}
          label="Offset Y (px)"
          type="number"
          value={shadowParts.offsetY}
          onChange={(val) => handlePartChange('offsetY', val)}
        />
        <ConfigField
          id={`${id}-blur-radius`}
          label="Blur Radius (px)"
          type="number"
          value={shadowParts.blurRadius}
          onChange={(val) => handlePartChange('blurRadius', val)}
        />
        <ConfigField
          id={`${id}-spread-radius`}
          label="Spread Radius (px)"
          type="number"
          value={shadowParts.spreadRadius}
          onChange={(val) => handlePartChange('spreadRadius', val)}
        />
        <ConfigColorField
          id={`${id}-color`}
          label="Color"
          value={shadowParts.color}
          onChange={(val) => handlePartChange('color', val)}
        />
      </div>
    </div>
  );
};
