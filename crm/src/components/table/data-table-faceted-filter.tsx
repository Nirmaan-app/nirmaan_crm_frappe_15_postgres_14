// src/components/table/data-table-faceted-filter.tsx
import * as React from 'react';
import { Column } from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, FilterX, Check } from 'lucide-react'; // Using Check from lucide-react

interface DataTableFacetedFilterProps<TData, TValue> {
    column?: Column<TData, TValue>;
    title?: string;
    options: {
        label: string;
        value: string;
        icon?: React.ComponentType<{ className?: string }>;
    }[];
}

export function DataTableFacetedFilter<TData, TValue>({
    column,
    title,
    options,
}: DataTableFacetedFilterProps<TData, TValue>) {
    if (!column) {
        console.warn("DataTableFacetedFilter: 'column' prop is missing. Faceted filter will not work.");
        return null;
    }

    const selectedValues = React.useMemo(() => {
        const filterValue = column.getFilterValue();
        return new Set<string>(Array.isArray(filterValue) ? filterValue : []);
    }, [column.getFilterValue()]);

    const handleSelect = (value: string) => {
        const currentFilterValue = column.getFilterValue();
        const currentSelectedSet = new Set<string>(Array.isArray(currentFilterValue) ? currentFilterValue : []);

        if (currentSelectedSet.has(value)) {
            currentSelectedSet.delete(value);
        } else {
            currentSelectedSet.add(value);
        }
        column.setFilterValue(currentSelectedSet.size > 0 ? Array.from(currentSelectedSet) : undefined);
    };

    const handleClear = () => {
        column.setFilterValue(undefined);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div
                    className={cn(
                        "cursor-pointer p-1 rounded-md",
                        selectedValues.size > 0 ? "bg-accent text-primary-foreground" : "bg-background text-muted-foreground",
                        "hover:bg-muted transition-colors"
                    )}
                >
                    {selectedValues.size > 0 ? (
                        <FilterX
                            className={cn(
                                "h-3.5 w-3.5 text-destructive", // small-xs icon size
                                selectedValues.size > 0 && "animate-bounce"
                            )}
                        />
                    ) : (
                        <Filter className="h-3.5 w-3.5" /> 
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Filter ${title || column.id}...`} />
                    <div className="relative">
                        <CommandList className={cn("overflow-y-auto", selectedValues.size > 0 && "mb-10")}>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => {
                                    const isSelected = selectedValues.has(option.value);
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() => handleSelect(option.value)}
                                        >
                                            <div
                                                className={cn(
                                                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'opacity-50 [&_svg]:invisible'
                                                )}
                                            >
                                                <Check className={cn('h-4 w-4')} /> {/* Using Check from lucide-react */}
                                            </div>
                                            {option.icon && (
                                                <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span>{option.label}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                        {selectedValues.size > 0 && (
                            <div className="absolute bottom-0 w-full bg-background border-t">
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={handleClear}
                                        className="justify-center text-center text-sm"
                                    >
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </div>
                        )}
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
}