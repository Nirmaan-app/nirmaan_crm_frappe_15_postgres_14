// src/components/common/CollapsibleSection.tsx
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have cn utility

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string; // For styling the outer container
    headerClassName?: string; // For styling the header bar
    contentClassName?: string; // For styling the content area
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    children,
    defaultOpen = true,
    className,
    headerClassName,
    contentClassName,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn("rounded-lg border shadow-sm bg-card text-card-foreground", className)}>
            <CollapsibleTrigger asChild>
                <div className={cn(
                    "flex items-center justify-between px-4 py-3 cursor-pointer select-none",
                    "font-semibold text-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100",
                    "hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150",
                    "rounded-t-lg", // Keep top rounded corners
                    !isOpen && "rounded-b-lg", // If closed, keep bottom rounded corners as well
                    headerClassName
                )}>
                    <h3>{title}</h3>
                    {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className={cn("overflow-hidden transition-all duration-300 ease-in-out", contentClassName)}>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700"> {/* Inner padding for content */}
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};