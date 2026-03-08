import { useState, useEffect } from "react";
 
// Takes a value and a delay in ms
// Returns the value, but only updates it after the user
// has stopped changing it for 'delay' milliseconds
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
 
  useEffect(() => {
    // Start a timer — set the debounced value after 'delay' ms
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
 
    // CLEANUP: if 'value' changes before the timer fires,
    // cancel the old timer and start a new one
    // This is the key — cancelling restarts the countdown
    return () => clearTimeout(timer);
 
  }, [value, delay]);
 
  return debouncedValue;
}
 
