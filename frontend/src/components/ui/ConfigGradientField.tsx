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

interface ConfigGradientFieldProps {
  id: string;
  label: string;
  value: string; // linear-gradient string
  onChange: (value: string) => void;
  description?: string;
  className?: string;
}

// Utility to parse linear-gradient string
interface GradientParts {
  angle: number;
  color1: string;
  color2: string;
}

const parseGradientString = (gradientString: string): GradientParts => {
  const defaultParts: GradientParts = {
    angle: 0,
    color1: '0 0% 0%',
    color2: '0 0% 100%',
  };

  const match = gradientString.match(/linear-gradient\((\d+)deg,\s*(.+?),\s*(.+?)\)/);
  if (match) {
    return {
      angle: parseFloat(match[1]),
      color1: match[2].trim(),
      color2: match[3].trim(),
    };
  }
  return defaultParts;
};

// Utility to format linear-gradient string
const formatGradientString = (parts: GradientParts): string => {
  return `linear-gradient(${parts.angle}deg, ${parts.color1}, ${parts.color2})`;
};

export const ConfigGradientField: React.FC<ConfigGradientFieldProps> = ({
  id,
  label,
  value,
  onChange,
  description,
  className,
}) => {
  const [gradientParts, setGradientParts] = useState<GradientParts>(parseGradientString(value));

  useEffect(() => {
    setGradientParts(parseGradientString(value));
  }, [value]);

  const handlePartChange = (part: keyof GradientParts, newValue: string | number | boolean) => {
    const newParts = { ...gradientParts, [part]: newValue };
    setGradientParts(newParts);
    onChange(formatGradientString(newParts));
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
          id={`${id}-angle`}
          label="Angle (deg)"
          type="number"
          value={gradientParts.angle}
          onChange={(val) => handlePartChange('angle', val)}
        />
        <ConfigColorField
          id={`${id}-color1`}
          label="Color Stop 1"
          value={gradientParts.color1}
          onChange={(val) => handlePartChange('color1', val)}
        />
        <ConfigColorField
          id={`${id}-color2`}
          label="Color Stop 2"
          value={gradientParts.color2}
          onChange={(val) => handlePartChange('color2', val)}
        />
      </div>
    </div>
  );
};
