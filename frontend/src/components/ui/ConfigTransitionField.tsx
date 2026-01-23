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

interface ConfigTransitionFieldProps {
  id: string;
  label: string;
  value: string; // transition string
  onChange: (value: string) => void;
  description?: string;
  className?: string;
}

// Utility to parse transition string
interface TransitionParts {
  property: string;
  duration: number;
  durationUnit: string;
  timingFunction: string;
}

const parseTransitionString = (transitionString: string): TransitionParts => {
  const defaultParts: TransitionParts = {
    property: 'all',
    duration: 0.3,
    durationUnit: 's',
    timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  };

  // Example: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  const match = transitionString.match(/(\w+)\s*([\d.]+)(ms|s)\s*(.*)/);
  if (match) {
    return {
      property: match[1],
      duration: parseFloat(match[2]),
      durationUnit: match[3],
      timingFunction: match[4].trim(),
    };
  }
  return defaultParts;
};

// Utility to format transition string
const formatTransitionString = (parts: TransitionParts): string => {
  return `${parts.property} ${parts.duration}${parts.durationUnit} ${parts.timingFunction}`;
};

export const ConfigTransitionField: React.FC<ConfigTransitionFieldProps> = ({
  id,
  label,
  value,
  onChange,
  description,
  className,
}) => {
  const [transitionParts, setTransitionParts] = useState<TransitionParts>(parseTransitionString(value));

  useEffect(() => {
    setTransitionParts(parseTransitionString(value));
  }, [value]);

  const handlePartChange = (part: keyof TransitionParts, newValue: string | number | boolean) => {
    const newParts = { ...transitionParts, [part]: newValue };
    setTransitionParts(newParts);
    onChange(formatTransitionString(newParts));
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
          id={`${id}-property`}
          label="Property"
          type="string"
          value={transitionParts.property}
          onChange={(val) => handlePartChange('property', val)}
        />
        <ConfigField
          id={`${id}-duration`}
          label="Duration (s)"
          type="number"
          value={transitionParts.duration}
          onChange={(val) => handlePartChange('duration', val)}
        />
        <ConfigField
          id={`${id}-timing-function`}
          label="Timing Function"
          type="string"
          value={transitionParts.timingFunction}
          onChange={(val) => handlePartChange('timingFunction', val)}
        />
      </div>
    </div>
  );
};
