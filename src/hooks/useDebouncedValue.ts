import { useState, useEffect } from 'react';

/**
 * Debounce a value by delaying its update until the specified delay
 * has elapsed since the last change.
 *
 * Typical usage: debounce a search input so the API call only fires
 * once the user stops typing, reducing server load and UI flicker.
 *
 * @param value  - The raw, rapidly-changing value (e.g. from an input)
 * @param delayMs - Milliseconds to wait after the last change (default 400)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebouncedValue(search, 400);
 *
 * // `debouncedSearch` updates 400ms after the user stops typing
 * useQuery({ queryKey: ['items', debouncedSearch], ... });
 * ```
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
