import { useState, useCallback } from 'react'

/**
 * Generic hook for persisting state to localStorage
 * @param key - The localStorage key (will be prefixed with 'studenthub:')
 * @param initialValue - Default value if nothing stored
 * @returns [storedValue, setValue] - Similar to useState
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const prefixedKey = `studenthub:${key}`

  // Initialize state from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(prefixedKey)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${prefixedKey}":`, error)
      return initialValue
    }
  })

  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(prefixedKey, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${prefixedKey}":`, error)
    }
  }, [prefixedKey, storedValue])

  return [storedValue, setValue]
}

/**
 * Hook for persisting multiple related keys under a namespace
 * @param namespace - The namespace (e.g., 'assignments', 'exams')
 * @param defaults - Object of default values for each key
 * @returns Object with get/set methods for each key
 */
export function useLocalStorageNamespace<T extends Record<string, any>>(
  namespace: string,
  defaults: T
): { [K in keyof T]: [T[K], (value: T[K] | ((prev: T[K]) => T[K])) => void] } {
  const result = {} as { [K in keyof T]: [T[K], (value: T[K] | ((prev: T[K]) => T[K])) => void] }

  for (const key of Object.keys(defaults) as Array<keyof T>) {
    result[key] = useLocalStorage(`${namespace}:${String(key)}`, defaults[key])
  }

  return result
}