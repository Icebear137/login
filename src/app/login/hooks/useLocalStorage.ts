import { useState, useEffect } from "react";
import { LOCAL_STORAGE_KEYS } from "../utils/constants";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (value === undefined) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export function useSavedLoginPreferences() {
  const [unitLevel, setUnitLevel] = useLocalStorage<string | undefined>(
    LOCAL_STORAGE_KEYS.UNIT_LEVEL,
    undefined
  );

  const [selectedSo, setSelectedSo] = useLocalStorage<string | null>(
    LOCAL_STORAGE_KEYS.SELECTED_SO,
    null
  );

  const [selectedPhong, setSelectedPhong] = useLocalStorage<string | null>(
    LOCAL_STORAGE_KEYS.SELECTED_PHONG,
    null
  );

  const [selectedSchool, setSelectedSchool] = useLocalStorage<string | null>(
    LOCAL_STORAGE_KEYS.SELECTED_SCHOOL,
    null
  );

  const [username, setUsername] = useLocalStorage<string>(
    LOCAL_STORAGE_KEYS.USERNAME,
    ""
  );

  return {
    unitLevel,
    setUnitLevel,
    selectedSo,
    setSelectedSo,
    selectedPhong,
    setSelectedPhong,
    selectedSchool,
    setSelectedSchool,
    username,
    setUsername,
  };
}
