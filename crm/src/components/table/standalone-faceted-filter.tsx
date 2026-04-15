import * as React from 'react';
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
import { Filter, FilterX, Check } from 'lucide-react';

interface StandaloneFacetedFilterProps {
    title?: string;
    options: {
        label: string;
        value: string;
        icon?: React.ComponentType<{ className?: string }>;
    }[];
    value: string[];
    onChange: (value: string[]) => void;
}

export function StandaloneFacetedFilter({
    title,
    options,
    value,
    onChange,
}: StandaloneFacetedFilterProps) {
    const selectedValues = new Set<string>(value);

    const handleSelect = (selectedValue: string) => {
        const currentSelectedSet = new Set<string>(value);

        if (currentSelectedSet.has(selectedValue)) {
            currentSelectedSet.delete(selectedValue);
        } else {
            currentSelectedSet.add(selectedValue);
        }
        onChange(Array.from(currentSelectedSet));
    };

    const handleClear = () => {
        onChange([]);
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
                                "h-3.5 w-3.5 text-destructive",
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
                    <CommandInput placeholder={`Filter ${title}...`} />
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
                                                <Check className={cn('h-4 w-4')} />
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
