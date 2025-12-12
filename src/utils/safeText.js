/**
 * Safely convert any value to a string for text rendering
 * @param {*} value - Any value (string, number, object, null, undefined, etc)
 * @param {string} fallback - Fallback text if value is falsy
 * @returns {string} - Safe string representation
 */
export const safeText = (value, fallback = '') => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object') {
    if (value.toString && typeof value.toString === 'function') {
      try {
        const str = value.toString();
        if (str !== '[object Object]') {
          return str;
        }
      } catch (e) {
        // ignore
      }
    }
    return fallback;
  }

  return fallback;
};
