// src/components/ui/sliding-tabs.tsx
// Minimalist animated tab component with sliding pill indicator
// Design: Industrial minimalism - clean, functional, refined motion

import React, { useRef, useState, useEffect, useCallback } from 'react';
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

  // Calculate indicator position based on active tab
  const updateIndicator = useCallback(() => {
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

  // Update indicator on mount and when active tab changes
  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  // Update on resize
  useEffect(() => {
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateIndicator]);

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
      <div
        className={cn(
          "absolute top-1 bottom-1 rounded-md",
          "bg-background border border-primary/20",
          "transition-all duration-300 ease-out",
          // Enhanced shadow with primary tint
          "shadow-[0_1px_4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(var(--primary),0.05)]"
        )}
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          // Prevent indicator from showing before first calculation
          opacity: indicatorStyle.width > 0 ? 1 : 0,
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
              "transition-all duration-200",
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
