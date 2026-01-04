// src/components/ui/touch-tooltip.tsx
// Touch-friendly tooltip that works on both hover (desktop) and tap (mobile)

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

interface TouchTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
  contentClassName?: string;
  delayDuration?: number;
}

/**
 * TouchTooltip - A tooltip that works on both desktop (hover) and mobile (tap)
 *
 * Behavior:
 * - Desktop: Hover to show (standard tooltip behavior)
 * - Mobile/Touch: Tap to toggle open/close
 * - Clicking outside closes the tooltip
 *
 * Uses controlled state with pointer event detection to handle both interaction modes.
 */
export function TouchTooltip({
  children,
  content,
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  className,
  contentClassName,
  delayDuration = 100,
}: TouchTooltipProps) {
  const [open, setOpen] = React.useState(false);
  const [isTouch, setIsTouch] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Detect touch device on first touch event
  React.useEffect(() => {
    const handleTouchStart = () => {
      setIsTouch(true);
    };

    // Also check for touch capability on mount
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true);
    }

    document.addEventListener('touchstart', handleTouchStart, { once: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // Close on outside click for touch devices
  React.useEffect(() => {
    if (!isTouch || !open) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    // Small delay to prevent immediate close on the tap that opened it
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isTouch, open]);

  const handleTriggerClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isTouch) {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  // For desktop, let Radix handle hover behavior
  const handleOpenChange = (newOpen: boolean) => {
    if (!isTouch) {
      setOpen(newOpen);
    }
  };

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <TooltipPrimitive.Trigger
          ref={triggerRef}
          asChild
          onClick={handleTriggerClick}
          className={className}
        >
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            className={cn(
              'z-50 rounded-md border bg-popover px-3 py-2 text-popover-foreground shadow-lg',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              contentClassName
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

// Simpler hook for checking touch capability
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}
