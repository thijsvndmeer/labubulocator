import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
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

interface ConfigColorFieldProps {
  id: string;
  label: string;
  value: string;
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
  const [color, setColor] = useState(value);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    if (/^#([A-Fa-f0-9]{3,4}){1,2}$/.test(newColor)) { // Basic hex validation
      onChange(newColor);
    }
  };

  const handlePickerChange = (newColor: string) => {
    setColor(newColor);
    onChange(newColor);
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
          value={color}
          onChange={handleHexChange}
          placeholder="#RRGGBB"
          className="flex-1"
        />
        <Popover>
          <PopoverTrigger asChild>
            <div
              className="w-8 h-8 rounded-md border cursor-pointer"
              style={{ backgroundColor: color }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <HexColorPicker color={color} onChange={handlePickerChange} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};