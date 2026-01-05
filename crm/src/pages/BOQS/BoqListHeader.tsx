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

    selectedCompanies?: string[];
    setSelectedCompanies?: (value: string[]) => void;
    companyOptions?: { label: string; value: string }[];

    selectedContacts?: string[];
    setSelectedContacts?: (value: string[]) => void;
    contactOptions?: { label: string; value: string }[];

    selectedStatuses?: string[];
    setSelectedStatuses?: (value: string[]) => void;
    statusOptions?: { label: string; value: string }[];
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
    boqOptions = [], // Default empty options
    
    selectedCompanies = [],
    setSelectedCompanies,
    companyOptions = [],

    selectedContacts = [],
    setSelectedContacts,
    contactOptions = [],

    selectedStatuses = [],
    setSelectedStatuses,
    statusOptions = []
}: BoqListHeaderProps) => {
    const role = localStorage.getItem("role")
    // Ensure "By BOQ" is consistently used
    let filterOptions = ["By BOQ", "By Company", "By Contact", "By Package", "By Status"];

    if (role == "Nirmaan Estimations User Profile") {
        filterOptions = ["By BOQ", "By Company", "By Type"]
    }

    const renderMultiSelect = (
        options: { label: string; value: string }[],
        selectedValues: string[],
        setSelectedValues: ((value: string[]) => void) | undefined,
        placeholder: string
    ) => (
        <ReactSelect
            isMulti
            options={options}
            value={options.filter(opt => selectedValues.includes(opt.value))}
            onChange={(selectedOptions) => {
                const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                setSelectedValues && setSelectedValues(values);
            }}
            placeholder={placeholder}
            className="text-sm"
            menuPosition="fixed"
            styles={{
                control: (base) => ({
                    ...base,
                    minHeight: '36px',
                    borderColor: 'hsl(var(--input))',
                }),
                menu: (base) => ({
                    ...base,
                    zIndex: 50
                })
            }}
        />
    );


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
                           {renderMultiSelect(boqOptions, selectedBoqs, setSelectedBoqs, "Select BOQs...")}
                        </div>
                    ) : filterType === 'By Company' ? (
                        <div className="w-full">
                            {renderMultiSelect(companyOptions, selectedCompanies, setSelectedCompanies, "Select Companies...")}
                        </div>
                    ) : filterType === 'By Contact' ? (
                        <div className="w-full">
                            {renderMultiSelect(contactOptions, selectedContacts, setSelectedContacts, "Select Contacts...")}
                        </div>
                    ) : filterType === 'By Status' ? (
                        <div className="w-full">
                            {renderMultiSelect(statusOptions, selectedStatuses, setSelectedStatuses, "Select Statuses...")}
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