import { useState } from 'react';

export default function useLocalStorage<T>(_key: string, defaultState: T | (() => T)) {
  // TODO: connect to local storage
  return useState<T>(defaultState);
}
