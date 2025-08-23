// src/hooks/useSearchParamsManager.ts

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useSearchParamsManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParams = useCallback(
    (params: Record<string, string | null>, removeParams: string[] = []) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
      });
      removeParams.forEach(key => { newParams.delete(key); });
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const getParam = useCallback((key: string) => searchParams.get(key), [searchParams]);

  return { updateParams, getParam, searchParams };
};

// --- HOOK #1: FOR A SINGLE PARAMETER (This one is correct and stays the same) ---
export const useStateSyncedWithParams = <T extends string = string>(
  paramKey: string,
  defaultValue: T | ""
) => {
  const { getParam, updateParams, searchParams } = useSearchParamsManager();
  const [state, setState] = useState<T | "">(getParam(paramKey) as T || defaultValue);

  useEffect(() => {
    const currentValue = getParam(paramKey);
    if (currentValue !== null && currentValue !== state) {
      setState(currentValue as T);
    } else if (currentValue === null && state !== defaultValue) {
        setState(defaultValue);
    }
  }, [searchParams, paramKey, getParam, defaultValue]);

  const setSyncedState = useCallback(
    (value: T | "", removeParams: string[] = []) => {
      setState(value);
      updateParams({ [paramKey]: value ||null}, removeParams);
    },
    [updateParams, paramKey]
  );

  return [state, setSyncedState] as const;
};

// --- HOOK #2: FOR MULTIPLE PARAMETERS (The Corrected Version) ---
export const useStatesSyncedWithParams = (
    paramConfigs: { key: string, defaultValue: string }[]
) => {
    const { updateParams, searchParams } = useSearchParamsManager();

    // --- THIS IS THE FIX ---
    // The state is now derived directly from searchParams using useMemo.
    // This value will only be recalculated when the URL actually changes.
    // This eliminates the need for a separate useState and useEffect.
    const state = useMemo(() => {
        return Object.fromEntries(
            paramConfigs.map(({ key, defaultValue }) => [
                key,
                searchParams.get(key) || defaultValue,
            ])
        );
    }, [searchParams, paramConfigs]);

    // The setter function now gets the current state from the useMemo above.
    const setSyncedState = useCallback(
        (newValues: Partial<typeof state>, removeParams: string[] = []) => {
            // No need for a separate setState call here.
            // React Router will trigger a re-render when setSearchParams is called,
            // which will cause the useMemo hook to recalculate the state.
            updateParams(newValues, removeParams);
        },
        [updateParams] // 'state' is no longer a dependency, making this more stable
    );

    return [state, setSyncedState] as const;
};


// import { useCallback, useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';

// export const useSearchParamsManager = () => {
//   const [searchParams, setSearchParams] = useSearchParams();

//   const updateParams = useCallback(
//     (params: Record<string, string>, removeParams: string[] = []) => {
//       const newParams = new URLSearchParams(searchParams);
      
//       // Set new parameters
//       Object.entries(params).forEach(([key, value]) => {
//         newParams.set(key, value);
//       });

//       // Remove specified parameters
//       removeParams.forEach(key => {
//         newParams.delete(key);
//       });

//       setSearchParams(newParams);
//     },
//     [searchParams, setSearchParams]
//   );

//   const getParam = useCallback(
//     (key: string) => searchParams.get(key),
//     [searchParams]
//   );

//   return {
//     updateParams,
//     getParam,
//     searchParams
//   };
// };

// // Hook for syncing state with URL parameters
// export const useStateSyncedWithParams = <T extends string = string>(
//   paramKey: string,
//   defaultValue: T | ""
// ) => {
//   const { getParam, updateParams, searchParams } = useSearchParamsManager();
//   const [state, setState] = useState<T | "">(getParam(paramKey) as T || defaultValue);

//   // Add effect to sync state with URL changes
//   useEffect(() => {
//     const currentValue: string | null = getParam(paramKey);
//     if (currentValue !== state) {
//       setState(currentValue as T || defaultValue);
//     }
//   }, [searchParams, paramKey, getParam, state, defaultValue]);


//   const setSyncedState = useCallback(
//     (value: T | "", removeParams: string[] = []) => {
//       setState(value);
//       updateParams({ [paramKey]: value }, removeParams);
//     },
//     [updateParams, paramKey]
//   );

//   return [state, setSyncedState] as const;
// };