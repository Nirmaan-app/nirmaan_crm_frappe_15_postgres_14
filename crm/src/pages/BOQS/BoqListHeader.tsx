// src/pages/BOQS/BoqListHeader.tsx

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FilterControls } from "@/components/ui/FilterControls";
import { ChevronDown, Search } from "lucide-react";
import ReactSelect from 'react-select'; // Import ReactSelect

// Define the props this component will accept from its parent
interface BoqListHeaderProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    filterType: string;
    setFilterType: (value: string) => void;
    onDateRangeChange: (range: { from: string; to: string }) => void;
    dateRange: { from: string; to: string };
    isMobile: boolean; // To handle slight layout differences
    // NEW Props for Multi Select
    selectedBoqs?: string[];
    setSelectedBoqs?: (value: string[]) => void;
    boqOptions?: { label: string; value: string }[];
}


export const BoqListHeader = ({
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    onDateRangeChange,
    dateRange, // Receive as `dateRange`
    isMobile,
    selectedBoqs = [], // Default empty array
    setSelectedBoqs,
    boqOptions = [] // Default empty options
}: BoqListHeaderProps) => {
    const role = localStorage.getItem("role")
    // Ensure "By BOQ" is consistently used
    let filterOptions = ["By BOQ", "By Company", "By Contact", "By Package", "By Status"];

    if (role == "Nirmaan Estimations User Profile") {
        filterOptions = ["By BOQ", "By Company", "By Type"]
    }


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
                    {filterType === 'By BOQ' ? (
                        <div className="w-full">
                            <ReactSelect
                                isMulti
                                options={boqOptions}
                                value={boqOptions.filter(opt => selectedBoqs.includes(opt.value))} // Map selected values back to options
                                onChange={(selectedOptions) => {
                                    const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                                    setSelectedBoqs && setSelectedBoqs(values);
                                }}
                                placeholder="Select BOQs..."
                                className="text-sm"
                                menuPosition="fixed"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '36px', // Match button height
                                        borderColor: 'hsl(var(--input))',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        zIndex: 50
                                    })
                                }}
                            />
                        </div>
                    ) : (
                        <>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </>
                    )}
                </div>
            </div>
            <FilterControls onDateRangeChange={onDateRangeChange} dateRange={dateRange} />
        </div>
    );

};