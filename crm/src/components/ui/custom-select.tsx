

// components/ui/custom-select.tsx

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CirclePlus } from 'lucide-react';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import ReactSelect, {
  components as DefaultComponents,
  MenuProps,
  Props as ReactSelectProps,
  StylesConfig,
} from 'react-select';

export interface CustomSelectProps extends ReactSelectProps {
  onAddItemClick?: () => void;
  addButtonLabel?: string;
  menuBottomSpacing?: number; // Optional: padding/margin below last item
}

const CustomSelect = React.forwardRef<any, CustomSelectProps>(
  (
    {
      components = {},
      onAddItemClick,
      addButtonLabel = 'Create/Request New Item',
      className,
      styles,
      menuBottomSpacing,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [buttonHeight, setButtonHeight] = useState(0);

    const additionalBottomSpacing = menuBottomSpacing ?? 32;

    useEffect(() => {
      if (onAddItemClick && buttonRef.current) {
        setButtonHeight(buttonRef.current.offsetHeight);
      } else {
        setButtonHeight(0);
      }
    }, [onAddItemClick]);

    const CustomMenu = (menuProps: MenuProps) => {
      const Menu = DefaultComponents.Menu;
      const MenuList = DefaultComponents.MenuList;

      return (
        <Menu {...menuProps}>
          <div
            style={{
              maxHeight: menuProps.maxMenuHeight - buttonHeight,
              overflowY: 'auto',
              paddingBottom: onAddItemClick ? additionalBottomSpacing : undefined,
            }}
          >
            <MenuList {...menuProps}>{menuProps.children}</MenuList>
          </div>

          {onAddItemClick && (
            <div
              ref={buttonRef}
              className="sticky bottom-0 left-0 right-0 bg-background border-t z-20"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full rounded-none hover:bg-muted/50',
                  'flex items-center justify-center gap-2 text-sm font-medium'
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
        </Menu>
      );
    };

    const mergedStyles: StylesConfig = useMemo(() => {
      return {
        ...styles,
        menu: (base: any) => ({
          ...base,
          position: 'relative',
        }),
      };
    }, [styles]);

    return (
      <ReactSelect
        ref={ref}
        className={cn('text-sm', className)}
        components={{
          ...components,
          Menu: CustomMenu,
        }}
        styles={mergedStyles}
        {...props}
      />
    );
  }
);

CustomSelect.displayName = 'CustomSelect';

export { CustomSelect };

// // components/ui/custom-select.tsx
// import { Button } from '@/components/ui/button';
// import { cn } from '@/lib/utils';
// import { CirclePlus } from 'lucide-react';
// import React from 'react';
// import ReactSelect, {
//   components as DefaultComponents,
//   MenuListProps,
//   Props as ReactSelectProps
// } from 'react-select';

// export interface CustomSelectProps extends ReactSelectProps {
//   onAddItemClick?: () => void;
//   addButtonLabel?: string;
// }

// const CustomSelect = React.forwardRef<any, CustomSelectProps>(
//   ({ 
//     components = {},
//     onAddItemClick,
//     addButtonLabel = 'Create/Request New Item',
//     className,
//     ...props
//   }, ref) => {
    
//     const CustomMenuList = (menuProps: MenuListProps) => {
//       // Use provided MenuList component or fallback to default
//       const MenuList = components.MenuList || DefaultComponents.MenuList;
      
//       return (
//         <div className="relative">
//           <MenuList {...menuProps} className="pb-8">
//             {menuProps.children}
//           </MenuList>
          
//           {onAddItemClick && (
//             <div className="sticky bottom-0 left-0 right-0 bg-background border-t">
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className={cn(
//                   'w-full rounded-none hover:bg-muted/50',
//                   'flex items-center gap-2 text-sm font-medium'
//                 )}
//                 onClick={(e) => {
//                   // e.preventDefault();
//                   // e.stopPropagation();
//                   onAddItemClick();
//                 }}
//               >
//                 <CirclePlus className="h-4 w-4" />
//                 {addButtonLabel}
//               </Button>
//             </div>
//           )}
//         </div>
//       );
//     };

//     return (
//       <ReactSelect
//         ref={ref}
//         className={cn('text-sm', className)}
//         components={{
//           ...components,
//           MenuList: CustomMenuList
//         }}
//         {...props}
//       />
//     );
//   }
// );

// CustomSelect.displayName = 'CustomSelect';

// export { CustomSelect };
