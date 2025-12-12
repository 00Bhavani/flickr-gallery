import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'cached_photos_v1';

export const cacheService = {
  getCachedPhotos: async () => {
    try {
      const json = await AsyncStorage.getItem(CACHE_KEY);
      if (!json) return [];
      return JSON.parse(json);
    } catch (e) {
      console.error('Cache read error', e.message);
      return [];
    }
  },

  setCachedPhotos: async (photos = []) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(photos));
    } catch (e) {
      console.error('Cache write error', e.message);
    }
  },
};
