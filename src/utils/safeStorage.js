/**
 * Safe wrapper for browser sessionStorage to prevent exceptions
 * when cookies/storage are blocked, in private mode, or in restricted contexts.
 */
export const safeSessionStorage = {
  getItem(key) {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch (err) {
      console.warn('[safeStorage] sessionStorage.getItem restricted:', err);
    }
    return null;
  },

  setItem(key, value) {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch (err) {
      console.warn('[safeStorage] sessionStorage.setItem restricted:', err);
    }
  },

  removeItem(key) {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (err) {
      console.warn('[safeStorage] sessionStorage.removeItem restricted:', err);
    }
  },
};
