// src/pages/BOQS/BoqListHeader.tsx

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FilterControls } from "@/components/ui/FilterControls";
import { ChevronDown, Search } from "lucide-react";

// Define the props this component will accept from its parent
interface BoqListHeaderProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    filterType: string;
    setFilterType: (value: string) => void;
    onDateRangeChange: (range: { from: string; to: string }) => void;
    isMobile: boolean; // To handle slight layout differences
}

const filterOptions = ["By Company", "By Contact", "By BOQ", "By Type"];

export const BoqListHeader = ({
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    onDateRangeChange,
    isMobile
}: BoqListHeaderProps) => {
    
   
        return (
            <div className="space-y-4">
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-shrink-0">
                                {filterType} <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {filterOptions.map(opt => <DropdownMenuItem key={opt} onClick={() => setFilterType(opt)}>{opt}</DropdownMenuItem>)}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>
                <FilterControls onDateRangeChange={onDateRangeChange} />
            </div>
        );
    
};