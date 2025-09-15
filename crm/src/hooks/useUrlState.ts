// src/hooks/useUrlState.ts
import { useState, useEffect, useCallback, useRef } from 'react';

// --- Internal Singleton UrlStateManager Class (No Changes) ---
class InternalUrlStateManager {
  private subscribers = new Map<string, Set<(value: string | null) => void>>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.handlePopState);
    }
  }

  private handlePopState = () => {
    this.subscribers.forEach((subs, key) => {
      const currentValue = new URLSearchParams(window.location.search).get(key);
      subs.forEach(cb => {
        try {
          cb(currentValue);
        } catch (e) {
          console.error(`Error in popstate subscriber for key "${key}":`, e);
        }
      });
    });
  };

  getParam(key: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }

  updateParam(key: string, value: string | null) {
    if (typeof window === 'undefined') return;

    const currentVal = this.getParam(key);
    // Only update if the value has actually changed
    if (currentVal === value) {
        return;
    }

    const url = new URL(window.location.href);
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }

    window.history.replaceState({}, '', url.toString());
    this.notify(key, value);
  }

  private notify(key: string, value: string | null) {
    const subs = this.subscribers.get(key);
    subs?.forEach(cb => {
      try {
        cb(value);
      } catch (e) {
        console.error(`Error in subscriber for key "${key}":`, e);
      }
    });
  }

  subscribe(key: string, callback: (value: string | null) => void): () => void {
    let subs = this.subscribers.get(key);
    if (!subs) {
      subs = new Set();
      this.subscribers.set(key, subs);
    }
    subs.add(callback);

    return () => this.unsubscribe(key, callback);
  }

  unsubscribe(key: string, callback: (value: string | null) => void) {
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        this.subscribers.delete(key);
      }
    }
  }
}

export const internalUrlStateManager = new InternalUrlStateManager();

// --- Reusable React Hook: useUrlState (FIXED LOGIC) ---
interface UseUrlStateOptions<T> {
  key: string;
  // Expect defaultValue to be a stable reference from the parent (e.g., memoized with useMemo)
  defaultValue: T;
  serialize: (value: T) => string;
  deserialize: (value: string | null) => T;
}

export function useUrlState<T>({ key, defaultValue, serialize, deserialize }: UseUrlStateOptions<T>): [T, (newValue: T) => void] {

  // Initialize state from URL on mount, or use the provided stable defaultValue.
  const [state, setState] = useState<T>(() => {
    const urlValue = internalUrlStateManager.getParam(key);
    return urlValue ? deserialize(urlValue) : defaultValue;
  });

  // This ref holds the *current internal state* of the hook.
  // It's used to avoid unnecessary `setState` calls by comparing against the actual current state.
  const currentStateRef = useRef(state);
  useEffect(() => {
    currentStateRef.current = state;
  }, [state]);

  // Callback to update local state AND the URL parameter.
  const updateStateAndUrl = useCallback((newValue: T) => {
    // Deep comparison using JSON.stringify for objects/arrays to prevent updates
    // if the content is the same but the reference is different.
    if (JSON.stringify(newValue) === JSON.stringify(currentStateRef.current)) {
        return;
    }
    setState(newValue);
    internalUrlStateManager.updateParam(key, serialize(newValue));
  }, [key, serialize]);

  // Effect to subscribe to URL changes (e.g., popstate, or updates from other components)
  useEffect(() => {
    const handleUrlChange = (urlValue: string | null) => {
      // Use the `defaultValue` prop directly, assuming it's stable.
      const newState = urlValue ? deserialize(urlValue) : defaultValue;
      
      // Crucial: Only update local state if the new state from URL is actually different
      // from the current internal state. This prevents infinite loops.
      if (JSON.stringify(newState) !== JSON.stringify(currentStateRef.current)) {
         setState(newState);
      }
    };

    const unsubscribe = internalUrlStateManager.subscribe(key, handleUrlChange);
    
    // IMPORTANT: No explicit initial setState here. The useState initializer handles it.
    // This useEffect is for *subsequent* URL changes via popstate or other updateParam calls.

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [key, deserialize, defaultValue]); // DEPENDENCY CHANGE: `defaultValue` is now a direct dependency

  return [state, updateStateAndUrl];
}

// --- Helper functions for common URL parameter types (No Changes) ---
export function getUrlJsonParam<T>(key: string, defaultValue: T): T {
  const param = internalUrlStateManager.getParam(key);
  try {
    return param ? JSON.parse(param) : defaultValue;
  } catch (e) {
    console.error(`Error parsing JSON URL parameter "${key}":`, e);
    return defaultValue;
  }
}

export function getUrlStringParam(key: string, defaultValue: string = ""): string {
  const param = internalUrlStateManager.getParam(key);
  return param !== null ? param : defaultValue;
}