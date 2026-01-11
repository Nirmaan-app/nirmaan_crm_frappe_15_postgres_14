import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FilterControls } from "@/components/ui/FilterControls";
import { ChevronDown } from "lucide-react";
import ReactSelect, { MultiValue } from 'react-select';

// Define the props this component will accept
interface TaskListHeaderProps {
    filterType: string;
    setFilterType: (value: string) => void;
    // New props for multiselect
    options: { label: string; value: string }[];
    selectedValues: { label: string; value: string }[];
    setSelectedValues: (values: MultiValue<{ label: string; value: string }>) => void;
    
    onDateRangeChange: (range: { from: string; to: string }) => void;
    dateRange: { from: string; to: string };
}

// Define the specific filter options for tasks
const filterOptions = ["By Contact", "By Company", "By Type"];

export const TaskListHeader = ({
    filterType,
    setFilterType,
    options,
    selectedValues,
    setSelectedValues,
    onDateRangeChange,
    dateRange,
}: TaskListHeaderProps) => {
    
    return (
        <div className="space-y-4">
            {/* Top row: Filter type dropdown and search input */}
            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-shrink-0">
                            {filterType} <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        {filterOptions.map(opt => (
                            <DropdownMenuItem key={opt} onClick={() => setFilterType(opt)}>
                                {opt}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="flex-1">
                    <ReactSelect
                        isMulti
                        options={options}
                        value={selectedValues}
                        onChange={setSelectedValues}
                        placeholder={`Select ${filterType.replace("By ", "")}...`}
                        className="text-sm"
                        classNames={{
                            control: () => "min-h-10 border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            menu: () => "bg-popover text-popover-foreground border shadow-md",
                            option: ({ isFocused, isSelected }) => 
                                `px-2 py-1.5 text-sm outline-none cursor-default select-none ${
                                    isSelected ? "bg-accent text-accent-foreground" : 
                                    isFocused ? "bg-accent text-accent-foreground" : ""
                                }`
                        }}
                        styles={{
                            control: (base) => ({
                                ...base,
                                backgroundColor: 'var(--background)',
                                borderColor: 'hsl(var(--input))',
                                color: 'var(--foreground)',
                            }),
                            singleValue: (base) => ({
                                ...base,
                                color: 'var(--foreground)',
                            }),
                            multiValue: (base) => ({
                                ...base,
                                backgroundColor: 'hsl(var(--muted))',
                            }),
                            multiValueLabel: (base) => ({
                                ...base,
                                color: 'hsl(var(--muted-foreground))',
                            }),
                            multiValueRemove: (base) => ({
                                ...base,
                                color: 'hsl(var(--muted-foreground))',
                                ':hover': {
                                    backgroundColor: 'hsl(var(--destructive))',
                                    color: 'hsl(var(--destructive-foreground))',
                                },
                            }),
                        }}
                    />
                </div>
            </div>
            
            {/* Bottom row: Your existing date range filter component */}
            <FilterControls onDateRangeChange={onDateRangeChange} dateRange={dateRange} />
        </div>
    );
};