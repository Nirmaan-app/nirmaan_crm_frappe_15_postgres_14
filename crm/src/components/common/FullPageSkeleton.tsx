import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"; // Ensure correct import path for your Skeleton UI component

interface FullPageSkeletonProps {
    /**
     * Optional: Customize the number of table-like rows to display in the skeleton.
     * Defaults to 5 rows.
     */
    numRows?: number;
}

/**
 * A reusable component that displays a full-page skeleton loading state,
 * typically used for tables or lists that are fetching data.
 * It takes the full width and height of its parent container.
 */
export const FullPageSkeleton: React.FC<FullPageSkeletonProps> = ({ numRows = 5 }) => {
    return (
        <div className="p-4 space-y-4 w-full h-full"> {/* 'w-full h-full' ensures it takes up all available space */}
            <Skeleton className="h-10 w-full" /> {/* Skeleton for a potential header or toolbar */}
            <Skeleton className="h-12 w-full" /> {/* Skeleton for a search bar or filter section */}
            {Array.from({ length: numRows }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" /> 
            ))}
        </div>
    );
};