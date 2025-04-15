/**
 * Utility functions for working with localStorage
 */

/**
 * Check if a specific type of storage is available in the browser
 * @param {string} type - The type of storage to check (e.g., "localStorage")
 * @returns {boolean} - Whether the storage is available
 */
export const storageAvailable = (type) => {
  try {
    const storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Save data to localStorage with JSON serialization
 * @param {string} key - The key to save the data under
 * @param {any} value - The value to save
 * @returns {boolean} - Whether the operation was successful
 */
export const saveToStorage = (key, value) => {
  if (!storageAvailable("localStorage")) {
    console.warn("localStorage not available");
    return false;
  }

  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
};

/**
 * Load data from localStorage with JSON parsing
 * @param {string} key - The key to load data from
 * @param {any} defaultValue - The default value to return if no data is found
 * @returns {any} - The loaded data or defaultValue
 */
export const loadFromStorage = (key, defaultValue) => {
  if (!storageAvailable("localStorage")) {
    console.warn("localStorage not available");
    return defaultValue;
  }

  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    const parsedValue = JSON.parse(serializedValue);
    return parsedValue;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return defaultValue;
  }
};

/**
 * Storage keys used throughout the application
 */
export const STORAGE_KEYS = {
  TOKENS: "holderscan_tokens",
  // Add other keys as needed
};
