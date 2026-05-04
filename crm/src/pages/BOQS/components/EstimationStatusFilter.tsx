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
import { Filter, ChevronDown, Check } from 'lucide-react';

interface EstimationStatusFilterProps {
    label: string;
    options: { label: string; value: string }[];
    value: string[];
    onChange: (next: string[]) => void;
}

export function EstimationStatusFilter({
    label,
    options,
    value,
    onChange,
}: EstimationStatusFilterProps) {
    const [open, setOpen] = React.useState(false);
    const selectedValues = new Set(value);
    const isActive = selectedValues.size > 0;

    const handleToggle = (option: string) => {
        const next = new Set(value);
        if (next.has(option)) next.delete(option);
        else next.add(option);
        onChange(Array.from(next));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm transition-colors",
                        isActive
                            ? "border-accent bg-accent/40 text-foreground"
                            : "border-border/60 bg-background text-foreground/80 hover:bg-muted/40",
                        open && "ring-1 ring-accent"
                    )}
                >
                    <Filter className="h-3.5 w-3.5" />
                    <span className="font-medium whitespace-nowrap">{label}</span>
                    {isActive && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-foreground text-background text-[11px] font-semibold tabular-nums">
                            {selectedValues.size}
                        </span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Filter ${label.toLowerCase()}...`} />
                    <div className="relative">
                        <CommandList className={cn("overflow-y-auto", isActive && "mb-10")}>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => {
                                    const isSelected = selectedValues.has(option.value);
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() => handleToggle(option.value)}
                                        >
                                            <div
                                                className={cn(
                                                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'opacity-50 [&_svg]:invisible'
                                                )}
                                            >
                                                <Check className="h-4 w-4" />
                                            </div>
                                            <span>{option.label}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                        {isActive && (
                            <div className="absolute bottom-0 w-full bg-background border-t">
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => onChange([])}
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
