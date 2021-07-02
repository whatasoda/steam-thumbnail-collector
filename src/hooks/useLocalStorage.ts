import { useEffect, useState } from 'react';

export default function useLocalStorage<T>(storageKey: string, defaultState: T | (() => T)) {
  const state = useState<T>(() => {
    const item = parseItem<T>(localStorage.getItem(storageKey));
    if (item) {
      return item;
    } else if (defaultState instanceof Function) {
      return defaultState();
    } else {
      return defaultState;
    }
  });

  const [value] = state;
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [value]);

  return state;
}

const parseItem = <T>(raw: string | null) => {
  if (raw) {
    try {
      return JSON.parse(raw) as T;
    } catch (e) {} // eslint-disable-line no-empty
  }
  return null;
};
