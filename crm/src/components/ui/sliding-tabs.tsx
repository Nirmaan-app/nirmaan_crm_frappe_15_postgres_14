// src/components/ui/sliding-tabs.tsx
// Minimalist animated tab component with sliding pill indicator
// Design: Industrial minimalism - clean, functional, refined motion
// Performance: Uses useLayoutEffect for flicker-free DOM measurements

import React, { useRef, useState, useLayoutEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface TabOption {
  label: string;
  value: string;
}

interface SlidingTabsProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export const SlidingTabs: React.FC<SlidingTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });

  // Use useLayoutEffect for synchronous DOM measurements (prevents flicker)
  useLayoutEffect(() => {
    const activeTabElement = tabRefs.current.get(activeTab);
    const container = containerRef.current;

    if (activeTabElement && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - containerRect.left + container.scrollLeft,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  // Debounced resize handler to prevent excessive updates
  useLayoutEffect(() => {
    let rafId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      // Cancel any pending updates
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);

      // Debounce: wait 100ms after last resize event
      timeoutId = setTimeout(() => {
        rafId = requestAnimationFrame(() => {
          const activeTabElement = tabRefs.current.get(activeTab);
          const container = containerRef.current;

          if (activeTabElement && container) {
            const containerRect = container.getBoundingClientRect();
            const tabRect = activeTabElement.getBoundingClientRect();

            setIndicatorStyle({
              left: tabRect.left - containerRect.left + container.scrollLeft,
              width: tabRect.width,
            });
          }
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [activeTab]);

  // Set ref for each tab
  const setTabRef = (value: string) => (el: HTMLButtonElement | null) => {
    if (el) {
      tabRefs.current.set(value, el);
    } else {
      tabRefs.current.delete(value);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center gap-0.5 p-1 rounded-lg",
        "bg-muted/60 border border-border/50",
        "overflow-x-auto scrollbar-none",
        className
      )}
    >
      {/* Sliding indicator - enhanced with primary accent */}
      {/* Performance: Only animate left/width, not all properties */}
      <div
        className={cn(
          "absolute top-1 bottom-1 rounded-md",
          "bg-background border border-primary/20",
          // Enhanced shadow with primary tint
          "shadow-[0_1px_4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(var(--primary),0.05)]"
        )}
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          opacity: indicatorStyle.width > 0 ? 1 : 0,
          // CSS transitions only on the properties we actually animate
          transition: 'left 200ms ease-out, width 200ms ease-out, opacity 150ms ease-out',
          // Hardware acceleration hint
          willChange: 'left, width',
        }}
      />

      {/* Tab buttons */}
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            ref={setTabRef(tab.value)}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "relative z-10 px-3 py-1.5 rounded-md",
              "text-[11px] uppercase tracking-wider",
              // Performance: Only transition color, not all properties
              "transition-colors duration-150",
              "whitespace-nowrap select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isActive
                ? "text-foreground font-bold"
                : "text-muted-foreground font-medium hover:text-foreground/70"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
