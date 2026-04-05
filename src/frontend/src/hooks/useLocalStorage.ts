import { useCallback, useState } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(prev)
            : newValue;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          console.warn("localStorage write failed for key:", key);
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, setStoredValue] as const;
}

export function getLS<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLS<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn("localStorage write failed for key:", key);
  }
}
