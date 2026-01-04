
"use client";

import { useState, useEffect } from 'react';

// This hook takes a value and a delay time
export function useDebounce<T>(value: T, delay: number): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer that will update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // This is the cleanup function.
    // If the user types again, it cancels the previous timer before it can finish.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // This effect re-runs only when the input value or delay changes

  return debouncedValue;
}
