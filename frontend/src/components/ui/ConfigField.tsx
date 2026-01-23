import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import React from "react";

interface ConfigFieldProps {
  id: string;
  label: string;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  type: "string" | "number" | "boolean" | "textarea";
  description?: string;
  className?: string;
}

export const ConfigField: React.FC<ConfigFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type,
  description,
  className,
}) => {
  const renderInput = () => {
    switch (type) {
      case "string":
        return (
          <Input
            id={id}
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="col-span-2"
          />
        );
      case "number":
        return (
          <Input
            id={id}
            type="number"
            value={value as number}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="col-span-2"
          />
        );
      case "boolean":
        return (
          <div className="flex items-center space-x-2 col-span-2">
            <Switch
              id={id}
              checked={value as boolean}
              onCheckedChange={onChange}
            />
          </div>
        );
      case "textarea":
        return (
          <Textarea
            id={id}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="col-span-2 min-h-[100px]"
          />
        );
      default:
        return null;
    }
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
      {renderInput()}
    </div>
  );
};
