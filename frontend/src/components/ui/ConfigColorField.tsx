import React, { useState, useEffect } from 'react';
import { HslaColorPicker } from 'react-colorful';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

type Hsla = { h: number; s: number; l: number; a: number };

// Converts "280 10% 10%" or "280 10% 10% / 0.5" to { h: 280, s: 10, l: 10, a: 0.5 }
const parseHslaString = (hslaString: string): Hsla => {
  const match = hslaString.match(/(\d+)\s+(\d+)%\s+(\d+)%(?:\s*\/\s*([\d.]+))?/);
  if (match) {
    return {
      h: parseFloat(match[1]),
      s: parseFloat(match[2]),
      l: parseFloat(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1,
    };
  }
  return { h: 0, s: 0, l: 0, a: 1 }; // Default fallback
};

// Converts { h: 280, s: 10, l: 10, a: 1 } to "280 10% 10%" or "280 10% 10% / 0.5"
const formatHslaString = (hsla: Hsla): string => {
  const { h, s, l, a } = hsla;
  if (a === 1) {
    return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
  }
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}% / ${a}`;
};

interface ConfigColorFieldProps {
  id: string;
  label: string;
  value: string; // Expects HSL string format
  onChange: (value: string) => void;
  description?: string;
  className?: string;
}

export const ConfigColorField: React.FC<ConfigColorFieldProps> = ({
  id,
  label,
  value,
  onChange,
  description,
  className,
}) => {
  const [internalHsla, setInternalHsla] = useState<Hsla>(parseHslaString(value));
  const [textValue, setTextValue] = useState(value);

  useEffect(() => {
    setInternalHsla(parseHslaString(value));
    setTextValue(value);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setTextValue(newText);
    // Attempt to parse new text value to update picker
    const parsed = parseHslaString(newText);
    if (parsed) {
      setInternalHsla(parsed);
      onChange(formatHslaString(parsed));
    } else {
        // If text is invalid, maybe only update internal text field and not the picker/output
        // or provide a visual cue for invalid input
    }
  };

  const handlePickerChange = (newHsla: Hsla) => {
    setInternalHsla(newHsla);
    const formatted = formatHslaString(newHsla);
    setTextValue(formatted);
    onChange(formatted);
  };

  return (
    <div className={`grid grid-cols-3 items-center gap-4 ${className}`}>
      <Label htmlFor={id} className="text-right flex items-center gap-2">
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
      <div className="col-span-2 flex items-center gap-2">
        <Input
          id={id}
          type="text"
          value={textValue}
          onChange={handleTextChange}
          placeholder="H S% L% [/ A]"
          className="flex-1"
        />
        <Popover>
          <PopoverTrigger asChild>
            <div
              className="w-8 h-8 rounded-md border cursor-pointer"
              style={{ backgroundColor: `hsla(${internalHsla.h}, ${internalHsla.s}%, ${internalHsla.l}%, ${internalHsla.a})` }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <HslaColorPicker color={internalHsla} onChange={handlePickerChange} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};