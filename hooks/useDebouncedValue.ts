"use client";

import { useEffect, useState } from "react";

/**
 * Trails `value` by `delay` ms — so a search box can stay fully responsive
 * while the request it drives only fires once the typing stops.
 */
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
