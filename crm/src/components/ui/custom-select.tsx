
// components/ui/custom-select.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CirclePlus } from 'lucide-react';
import React from 'react';
import ReactSelect, {
  components as DefaultComponents,
  MenuListProps,
  Props as ReactSelectProps
} from 'react-select';

export interface CustomSelectProps extends ReactSelectProps {
  onAddItemClick?: () => void;
  addButtonLabel?: string;
}

const CustomSelect = React.forwardRef<any, CustomSelectProps>(
  ({ 
    components = {},
    onAddItemClick,
    addButtonLabel = 'Create/Request New Item',
    className,
    ...props
  }, ref) => {
    
    const CustomMenuList = (menuProps: MenuListProps) => {
      // Use provided MenuList component or fallback to default
      const MenuList = components.MenuList || DefaultComponents.MenuList;
      
      return (
        <div className="relative">
          <MenuList {...menuProps} className="pb-8">
            {menuProps.children}
          </MenuList>
          
          {onAddItemClick && (
            <div className="sticky bottom-0 left-0 right-0 bg-background border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full rounded-none hover:bg-muted/50',
                  'flex items-center gap-2 text-sm font-medium'
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddItemClick();
                }}
              >
                <CirclePlus className="h-4 w-4" />
                {addButtonLabel}
              </Button>
            </div>
          )}
        </div>
      );
    };

    return (
      <ReactSelect
        ref={ref}
        className={cn('text-sm', className)}
        components={{
          ...components,
          MenuList: CustomMenuList
        }}
        {...props}
      />
    );
  }
);

CustomSelect.displayName = 'CustomSelect';

export { CustomSelect };
