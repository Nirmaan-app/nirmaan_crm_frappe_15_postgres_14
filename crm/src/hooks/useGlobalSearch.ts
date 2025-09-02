// File: src/hooks/useGlobalSearch.ts

import { useState, useEffect, useMemo } from 'react';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { useDebounce } from './useDebounce';
// --- REMOVED: useCurrentUser hook import ---
import { SearchResults } from '@/types/NirmaanCRM/Search';

const MIN_SEARCH_LENGTH =4;

export const useGlobalSearch = () => {
  // --- UPDATED: Get role directly from localStorage ---
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
      const updatedRole = localStorage.getItem('role');
  
  // No active user loading within this hook since we're reading from localStorage
  const isUserLoading = false; 

  // Effect to load role from localStorage on mount and whenever it might change externally.
  // Note: This won't react to *changes* in localStorage unless manually triggered,
  // or if the component remounts. For robust role updates, use an event listener
  // on 'storage' or a more sophisticated global state if needed.
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setCurrentUserRole(storedRole);

    // Optional: Add a listener for storage events if role can change without full page reload.
    // This assumes `currentUserRole` is correctly updated in localStorage by `useCurrentUser`
    // or `AuthProvider` when a user logs in/out or role changes.
    const handleStorageChange = () => {
      const updatedRole = localStorage.getItem('role');
      setCurrentUserRole(updatedRole);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState(''); 
  const debouncedSearchQuery = useDebounce(searchQuery, 250);

  const shouldEnableFetch = useMemo(() => {
    return !!debouncedSearchQuery &&
           debouncedSearchQuery.length >= MIN_SEARCH_LENGTH &&
           !!currentUserRole; // No `!isUserLoading` needed here since it's always false
  }, [debouncedSearchQuery, currentUserRole]);

  const {
    data: apiResponse, 
    isLoading: apiCallInProgress,
    error: apiError, 
  } = useFrappeGetCall(
    'nirmaan_crm.api.global_search.global_search',
    {
      search_term:debouncedSearchQuery,
      user_role:currentUserRole,
      
    }
  );


  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SearchResponse=apiResponse?.message
    if (SearchResponse) {
      console.log(apiResponse)
      const groupedResults = SearchResponse?.reduce((acc, item) => {
        if (!acc[item.doctype]) {
          acc[item.doctype] = [];
        }
        acc[item.doctype].push(item);
        return acc;
      }, {});
      setSearchResults(groupedResults || null);
    } else if (apiError) {
      setSearchResults(null);
    } else if (!shouldEnableFetch && !searchQuery) {
        setSearchResults(null);
    }
  }, [apiResponse, apiError, shouldEnableFetch, searchQuery]);

  useEffect(() => {
    const userIsTyping = searchQuery !== debouncedSearchQuery;
    setIsSearching(userIsTyping || apiCallInProgress);

    if (!shouldEnableFetch) {
      setError(null);
    }
  }, [searchQuery, debouncedSearchQuery, apiCallInProgress, shouldEnableFetch]);

  useEffect(() => {
    if (apiError) {
      setError(apiError.message || "An API error occurred.");
    } else {
      setError(null);
    }
  }, [apiError]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setError(null);
    setIsSearching(false);
  };

  const hasResults = useMemo(() => {
    if (!searchResults) return false;
    return Object.values(searchResults).some(arr => arr && arr.length > 0);
  }, [searchResults]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    error,
    clearSearch,
    currentUserRole, // Still exposed for disabling input if role not loaded
    isUserLoading,    // Always false now
    hasResults,
  };
};

// // File: src/hooks/useGlobalSearch.ts

// import { useState, useEffect, useMemo } from 'react';
// import { useFrappeGetCall } from 'frappe-react-sdk';
// import { useDebounce } from './useDebounce';
// // --- REMOVED: useCurrentUser hook import ---
// import { SearchResults } from '@/types/NirmaanCRM/Search';

// const MIN_SEARCH_LENGTH =4;

// export const useGlobalSearch = () => {
//   // --- UPDATED: Get role directly from localStorage ---
//   const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
//       const updatedRole = localStorage.getItem('role');
  
//   // No active user loading within this hook since we're reading from localStorage
//   const isUserLoading = false; 

//   // Effect to load role from localStorage on mount and whenever it might change externally.
//   // Note: This won't react to *changes* in localStorage unless manually triggered,
//   // or if the component remounts. For robust role updates, use an event listener
//   // on 'storage' or a more sophisticated global state if needed.
//   useEffect(() => {
//     const storedRole = localStorage.getItem('role');
//     setCurrentUserRole(storedRole);

//     // Optional: Add a listener for storage events if role can change without full page reload.
//     // This assumes `currentUserRole` is correctly updated in localStorage by `useCurrentUser`
//     // or `AuthProvider` when a user logs in/out or role changes.
//     const handleStorageChange = () => {
//       const updatedRole = localStorage.getItem('role');
//       setCurrentUserRole(updatedRole);
//     };
//     window.addEventListener('storage', handleStorageChange);
//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//     };
//   }, []);

//   const [searchQuery, setSearchQuery] = useState(''); 
//   const debouncedSearchQuery = useDebounce(searchQuery, 250);

//   const shouldEnableFetch = useMemo(() => {
//     return !!debouncedSearchQuery &&
//            debouncedSearchQuery.length >= MIN_SEARCH_LENGTH &&
//            !!currentUserRole; // No `!isUserLoading` needed here since it's always false
//   }, [debouncedSearchQuery, currentUserRole]);

//   const {
//     data: apiResponse, 
//     isLoading: apiCallInProgress,
//     error: apiError, 
//   } = useFrappeGetCall(
//     'nirmaan_crm.api.global_search.global_search',
//     {
//       search_term:debouncedSearchQuery,
//       user_role:currentUserRole,
      
//     }
//   );


//   const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
//   const [isSearching, setIsSearching] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const SearchResponse=apiResponse?.message
//     if (SearchResponse) {
//       console.log(apiResponse)
//       const groupedResults = SearchResponse?.reduce((acc, item) => {
//         if (!acc[item.doctype]) {
//           acc[item.doctype] = [];
//         }
//         acc[item.doctype].push(item);
//         return acc;
//       }, {});
//       setSearchResults(groupedResults || null);
//     } else if (apiError) {
//       setSearchResults(null);
//     } else if (!shouldEnableFetch && !searchQuery) {
//         setSearchResults(null);
//     }
//   }, [apiResponse, apiError, shouldEnableFetch, searchQuery]);

//   useEffect(() => {
//     const userIsTyping = searchQuery !== debouncedSearchQuery;
//     setIsSearching(userIsTyping || apiCallInProgress);

//     if (!shouldEnableFetch) {
//       setError(null);
//     }
//   }, [searchQuery, debouncedSearchQuery, apiCallInProgress, shouldEnableFetch]);

//   useEffect(() => {
//     if (apiError) {
//       setError(apiError.message || "An API error occurred.");
//     } else {
//       setError(null);
//     }
//   }, [apiError]);

//   const clearSearch = () => {
//     setSearchQuery('');
//     setSearchResults(null);
//     setError(null);
//     setIsSearching(false);
//   };

//   const hasResults = useMemo(() => {
//     if (!searchResults) return false;
//     return Object.values(searchResults).some(arr => arr && arr.length > 0);
//   }, [searchResults]);

//   return {
//     searchQuery,
//     setSearchQuery,
//     searchResults,
//     isSearching,
//     error,
//     clearSearch,
//     currentUserRole, // Still exposed for disabling input if role not loaded
//     isUserLoading,    // Always false now
//     hasResults,
//   };
// };