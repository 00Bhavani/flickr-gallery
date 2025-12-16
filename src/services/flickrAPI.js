// src/services/flickrAPI.js
const API_KEY = '6f102c62f41998d151e5a1b48713cf13';
const BASE_URL = 'https://api.flickr.com/services/rest/';

export const flickrAPI = {
  /**
   * Fetch recent photos with pagination
   * @param {string} searchText - Search query (empty for recent photos)
   * @param {number} page - Page number (1, 2, 3, etc.)
   * @returns {Promise<{photos: Array, pages: number, total: number}>}
   */
  async searchPhotos(searchText = '', page = 1) {
    try {
      // Determine which API method to use
      const method = searchText 
        ? 'flickr.photos.search' 
        : 'flickr.photos.getRecent';
      
      // Build URL with parameters
      const params = new URLSearchParams({
        method,
        api_key: API_KEY,
        format: 'json',
        nojsoncallback: '1',
        extras: 'url_s',
        page: page.toString(),
        per_page: '20', // 20 photos per page
      });

      // Add search text if provided
      if (searchText) {
        params.append('text', searchText);
      }

      const url = `${BASE_URL}?${params.toString()}`;
      console.log('Fetching from:', url);

      const response = await fetch(url);
      
      // Handle network errors
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check for API errors
      if (data.stat === 'fail') {
        throw new Error(data.message || 'API request failed');
      }

      // Transform photos to include proper URLs
      const photos = (data.photos?.photo || []).map(photo => ({
        id: photo.id,
        title: photo.title || 'Untitled',
        url: photo.url_s || '', // url_s is provided by extras parameter
      }));

      return {
        photos,
        pages: data.photos?.pages || 1,
        total: data.photos?.total || 0,
        page: data.photos?.page || 1,
      };
    } catch (error) {
      console.error('Flickr API Error:', error);
      throw error; // Re-throw to handle in component
    }
  },
};