import { useRef, useCallback } from "react";
 
// Returns a throttled version of the callback
// The callback can only run once per 'limit' milliseconds
export function useThrottle<T extends (...args: unknown[]) => void>(
  fn: T,
  limitMs: number
): T {
  const lastRunRef = useRef<number>(0);
  //    ↑ stores when the function last ran
 
  return useCallback((...args: unknown[]) => {
    const now = Date.now();
 
    if (now - lastRunRef.current >= limitMs) {
      // Enough time has passed — run the function
      lastRunRef.current = now;
      fn(...args);
    }
    // If called too soon, do nothing — just skip this call
 
  }, [fn, limitMs]) as T;
}
