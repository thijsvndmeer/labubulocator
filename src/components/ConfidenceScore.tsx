import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ConfidenceScoreProps {
  score: number;
  className?: string;
}

export const ConfidenceScore = ({ score, className }: ConfidenceScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-rarity-uncommon';
    if (score >= 70) return 'text-rarity-legendary';
    return 'text-rarity-common';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'High';
    if (score >= 70) return 'Medium';
    return 'Low';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-1.5 cursor-help', className)}>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <span className={cn('text-sm font-semibold', getScoreColor(score))}>
                {score}% {getScoreLabel(score)}
              </span>
            </div>
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs">
            Based on {score >= 85 ? 'high' : score >= 70 ? 'moderate' : 'limited'} sales volume, 
            multiple verified sources, and recent market activity.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
