import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

interface TooltipManagerProps {
  children: ReactNode;
  content: string | ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  disabled?: boolean;
  shortcut?: string;
}

export function TooltipManager({ 
  children, 
  content, 
  side = "top", 
  align = "center",
  delay = 200,
  disabled = false,
  shortcut
}: TooltipManagerProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip delayDuration={delay}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} align={align} className="max-w-xs">
        <div className="space-y-1">
          <div>{content}</div>
          {shortcut && (
            <div className="text-xs opacity-70 font-mono bg-background/50 px-1 rounded">
              {shortcut}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}