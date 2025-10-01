import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { cn } from '@/lib/utils';
import { SearchResultItem } from '@/types/NirmaanCRM/Search';
import { useViewport } from "@/hooks/useViewPort";

const MIN_SEARCH_LENGTH = 2;

export const GlobalSearchInput: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { isMobile } = useViewport();
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    error,
    hasResults,
    currentUserRole,
    isUserLoading,
    clearSearch,
  } = useGlobalSearch();

  const mobileDetailPaths: { [key: string]: string } = {
    "CRM Contacts": "/contacts/contact",
    "CRM Company": "/companies/company",
    "CRM BOQ": "/boqs/boq",
    "CRM Task": "/tasks/task",
    "CRM Users": "/team/details",
  };

  const desktopBasePaths: { [key: string]: string } = {
    "CRM Contacts": "/contacts/contact",
    "CRM Company": "/companies/company",
    "CRM BOQ": "/boqs/boq",
    "CRM Task": "/tasks/task",
    "CRM Users": "/team/details",
  };

  const handleSelectResult = (item: SearchResultItem) => {
    const base = isMobile ? mobileDetailPaths[item.doctype] : desktopBasePaths[item.doctype];
    navigate(`${base}?id=${item.name}`);
    setOpen(false);
    clearSearch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Open popover when user starts typing with minimum length
    if (value.length >= MIN_SEARCH_LENGTH && currentUserRole && !open) {
      setOpen(true);
    } else if (value.length < MIN_SEARCH_LENGTH && open) {
      setOpen(false);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      clearSearch();
      inputRef.current?.blur();
    }
    // Don't close on Enter - let user continue typing
  };

  const handleClearSearch = () => {
    clearSearch();
    setOpen(false);
    inputRef.current?.focus(); // Keep focus on input after clearing
  };

  // Global keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
          setOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Click outside handler - more specific to avoid unwanted closes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking on the input itself
      if (inputRef.current?.contains(target)) {
        return;
      }
      
      // Don't close if clicking inside the popover content
      const popoverContent = document.querySelector('[role="dialog"]');
      if (popoverContent?.contains(target)) {
        return;
      }
      
      // Close only if clicking truly outside
      if (open && !popoverRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const showLoadingIcon = isSearching && searchQuery?.length >= MIN_SEARCH_LENGTH;
  const showClearIcon = searchQuery?.length > 0 && !showLoadingIcon;

  return (
    <div ref={popoverRef} className={cn("relative", className)}>
      <Popover open={open}>
        <PopoverTrigger asChild>
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder={isUserLoading ? "Loading user permissions..." : "Search Something..."}
              className="w-full pl-9 pr-8"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => {
                if (searchQuery.length >= MIN_SEARCH_LENGTH && currentUserRole) {
                  setOpen(true);
                }
              }}
              disabled={isUserLoading || !currentUserRole}
              autoComplete="off"
            />
            {showLoadingIcon && (
              <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
            )}
            {showClearIcon && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 h-7 w-7 rounded-full text-muted-foreground hover:bg-transparent"
                onClick={handleClearSearch}
                onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        
        {open && (
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0 md:max-w"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()} // Prevent focus stealing
            onInteractOutside={(e) => {
              // Prevent closing when interacting with the input
              if (inputRef.current?.contains(e.target as Node)) {
                e.preventDefault();
              }
            }}
          >
            <Command shouldFilter={false} className="h-auto rounded-lg border-none bg-transparent text-foreground">
              <CommandList className="max-h-[min(50vh,400px)] overflow-y-auto">
                {isSearching && searchQuery.length >= MIN_SEARCH_LENGTH && (
                  <CommandEmpty className="py-6 text-center text-sm">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2">Searching...</p>
                  </CommandEmpty>
                )}
                
                {error && searchQuery.length >= MIN_SEARCH_LENGTH && (
                  <CommandEmpty className="py-6 text-center text-sm text-destructive">
                    <p>Error: {error}</p>
                  </CommandEmpty>
                )}
                
                {isUserLoading && searchQuery.length >= MIN_SEARCH_LENGTH && (
                  <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                    Loading user permissions...
                  </CommandEmpty>
                )}
                
                {!isSearching && searchQuery?.length >= MIN_SEARCH_LENGTH && !hasResults && !error && !isUserLoading && (
                  <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                    No results found for "{searchQuery}".
                  </CommandEmpty>
                )}

                {Object.entries(searchResults || {}).map(([doctype, items]) => (
                  items && items.length > 0 && (
                    <CommandGroup heading={doctype} key={doctype} className="border-b last:border-b-0">
                      {items.map((item) => (
                        <CommandItem
                          key={`${item.doctype}-${item.name}`}
                          value={`${item.doctype}-${item.name}`}
                          onSelect={() => handleSelectResult(item)}
                          className="cursor-pointer text-sm py-2"
                          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss when clicking
                        >
                          <span dangerouslySetInnerHTML={{ __html: item.title }} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
};

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Search, Loader2, X } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { useGlobalSearch } from '@/hooks/useGlobalSearch';
// import { cn } from '@/lib/utils';
// // import { navigateToDoc } from '@/utils/LinkNavigate'; // --- CORRECTLY IMPORTED ---
// import { SearchResultItem } from '@/types/NirmaanCRM/Search'; // --- CORRECTLY IMPORTED ---
// import { useViewport } from "@/hooks/useViewPort";


// const MIN_SEARCH_LENGTH = 2;

// export const GlobalSearchInput: React.FC<{ className?: string }> = ({ className }) => {
//   const navigate = useNavigate();
//   const [open, setOpen] = useState(false); // Local state for Popover visibility
//   const {isMobile}=useViewport()

//   const {
//     searchQuery,
//     setSearchQuery,
//     searchResults,
//     isSearching,
//     error,
//     hasResults,
//     currentUserRole,
//     isUserLoading,
//     clearSearch,
//   } = useGlobalSearch();

//   const triggerRef = useRef<HTMLDivElement>(null);

//   const mobileDetailPaths: { [key: string]: string } = {
//     "CRM Contacts": "/contacts/contact",
//     "CRM Company": "/companies/company",
//     "CRM BOQ": "/boqs/boq",
//     "CRM Task": "/tasks/task",
//     "CRM Users": "/team/details", // Assuming /team/details is the mobile user detail page
//   };
//  const desktopBasePaths: { [key: string]: string } = {
//     "CRM Contacts": "/contacts",
//     "CRM Company": "/companies",
//     "CRM BOQ": "/boqs",
//     "CRM Task": "/tasks",
//     "CRM Users": "/team", // Assuming /team is your desktop user list page
//   };

//   // --- CORRECTLY USES navigateToDoc ---
//   const handleSelectResult = (item: SearchResultItem) => {
//     // navigateToDoc(item.doctype, item.name, navigate); // Use the centralized navigation
//     const base = isMobile?mobileDetailPaths[item.doctype]:desktopBasePaths[item.doctype]

//     navigate(
//       `${base}?id=${item.name}`
//     )
//     setOpen(false);
//     clearSearch();
//   };

//   const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
//     if (event.key === 'Escape') {
//       setOpen(false);
//       clearSearch();
//     } else if (event.key === 'Enter' && searchQuery.length >= MIN_SEARCH_LENGTH && !hasResults && !isSearching) {
//       setOpen(false);
//       clearSearch();
//     }
//   };

//   // Local keyboard listener for Cmd+K / Ctrl+K
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
//         event.preventDefault();
//         setOpen((prev) => !prev);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, []);

//   // Close popover when clicking outside the PopoverContent or Trigger
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         triggerRef.current && 
//         !triggerRef.current.contains(event.target as Node) &&
//         !(event.target as HTMLElement).closest('.popover-content')
//       ) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Automatically open the popover if a search query is typed and results are loading/available.
//   useEffect(() => {
//     if (searchQuery.length >= MIN_SEARCH_LENGTH && currentUserRole) {
//       setOpen(true);
//     } else if (searchQuery.length < MIN_SEARCH_LENGTH && open) {
//       setOpen(false);
//     }
//   }, [searchQuery, currentUserRole, open]);


//   const showLoadingIcon = isSearching && searchQuery?.length >= MIN_SEARCH_LENGTH;
//   const showClearIcon = (searchQuery?.length > 0 || isSearching) && !showLoadingIcon;

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <div className={cn("relative flex items-center", className)} ref={triggerRef}>
//           <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder={isUserLoading ? "Loading user permissions..." : "Search Something..."}
//             className="w-full pl-9 pr-8"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             onKeyDown={handleInputKeyDown}
//             aria-expanded={open}
//             aria-controls="global-search-results"
//             disabled={isUserLoading || !currentUserRole}
//           />
//           {showLoadingIcon && (
//             <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
//           )}
//           {showClearIcon && (
//             <Button
//               variant="ghost"
//               size="icon"
//               className="absolute right-1 h-7 w-7 rounded-full text-muted-foreground hover:bg-transparent"
//               onClick={clearSearch}
//               aria-label="Clear search"
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           )}
//         </div>
//       </PopoverTrigger>
//       <PopoverContent
//         id="global-search-results"
//         className="popover-content w-[--radix-popover-trigger-width] p-0 md:max-w-md"
//         align="start"
//       >
//         <Command shouldFilter={false} className="h-auto rounded-lg border-none bg-transparent text-foreground">
//           <CommandList className="max-h-[min(50vh,400px)] overflow-y-auto">
//             {isSearching && searchQuery.length >= MIN_SEARCH_LENGTH && (
//               <CommandEmpty className="py-6 text-center text-sm">
//                 <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
//                 <p className="mt-2">Searching...</p>
//               </CommandEmpty>
//             )}
//             {error && searchQuery.length >= MIN_SEARCH_LENGTH && (
//               <CommandEmpty className="py-6 text-center text-sm text-destructive">
//                 <p>Error: {error}</p>
//               </CommandEmpty>
//             )}
//             {isUserLoading && searchQuery.length >= MIN_SEARCH_LENGTH && (
//               <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
//                 Loading user permissions...
//               </CommandEmpty>
//             )}
//             {!isSearching && searchQuery?.length >= MIN_SEARCH_LENGTH && !hasResults && !error && !isUserLoading && (
//               <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
//                 No results found for "{searchQuery}".
//               </CommandEmpty>
//             )}

//             {Object.entries(searchResults || {}).map(([doctype, items]) => (
//               items && items.length > 0 && (
//                 <CommandGroup heading={doctype} key={doctype} className="border-b last:border-b-0">
//                   {items.map((item) => (
//                     <CommandItem
//                       key={`${item.doctype}-${item.name}`}
//                       value={`${item.doctype}-${item.name}`}
//                       onSelect={() => handleSelectResult(item)}
//                       className="cursor-pointer text-sm py-2"
//                     >
//                       <span dangerouslySetInnerHTML={{ __html: item.title }} />
//                     </CommandItem>
//                   ))}
//                 </CommandGroup>
//               )
//             ))}
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// };