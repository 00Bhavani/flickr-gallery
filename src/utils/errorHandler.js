// Error handling utilities
export const errorHandler = {
  /**
   * Format error message for display
   * @param {Error|Object} error - Error object
   * @returns {string} - Formatted error message
   */
  getErrorMessage: (error) => {
    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    if (error.type === 'NETWORK_ERROR') {
      return 'Network connection failed. Please check your internet connection.';
    }

    if (error.type === 'API_ERROR') {
      return error.message || 'Failed to fetch data from Flickr';
    }

    if (error.type === 'VALIDATION_ERROR') {
      return error.message || 'Invalid input';
    }

    return 'An unexpected error occurred';
  },

  /**
   * Check if error is network-related
   * @param {Error} error - Error object
   * @returns {boolean}
   */
  isNetworkError: (error) => {
    return (
      error.type === 'NETWORK_ERROR' ||
      error.message?.includes('Network') ||
      error.message?.includes('fetch')
    );
  },

  /**
   * Log error for debugging
   * @param {string} context - Context where error occurred
   * @param {Error} error - Error object
   */
  logError: (context, error) => {
    console.error(`[${context}]`, error);
  },
};
