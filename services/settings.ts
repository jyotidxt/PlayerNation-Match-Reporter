import { Platform } from 'react-native';

const API_KEY_STORAGE_KEY = 'playernation_gemini_api_key';

// A simple in-memory fallback for environments without localStorage (like native mobile before DB setup)
let inMemoryKey = '';

export const settingsService = {
  getApiKey: async (): Promise<string> => {
    // Check environment variables first
    const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (envKey) return envKey;

    if (Platform.OS === 'web') {
      try {
        return window.localStorage.getItem(API_KEY_STORAGE_KEY) || '';
      } catch (e) {
        console.warn('Error reading from localStorage:', e);
      }
    }
    return inMemoryKey;
  },

  setApiKey: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem(API_KEY_STORAGE_KEY, key);
        return;
      } catch (e) {
        console.warn('Error writing to localStorage:', e);
      }
    }
    inMemoryKey = key;
  }
};
