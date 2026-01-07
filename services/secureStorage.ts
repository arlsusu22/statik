/**
 * Secure Storage Service
 * 
 * Uses Capacitor Preferences for native platforms (app-sandboxed storage),
 * with localStorage fallback for web development.
 * 
 * Note: Preferences is sandboxed per-app on iOS/Android, which provides
 * reasonable security for OAuth tokens within the app context.
 */

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const isNative = Capacitor.isNativePlatform();

// Log storage mode on init
if (isNative) {
  console.log('🔐 Using Capacitor Preferences (app-sandboxed storage)');
} else {
  console.warn('⚠️ Using localStorage fallback (web dev mode - not secure for production)');
}

/**
 * Securely store a value
 * Falls back to localStorage if preferences fails
 */
export const secureSet = async (key: string, value: string): Promise<void> => {
  if (isNative) {
    try {
      await Preferences.set({ key, value });
      console.log(`🔐 Stored: ${key}`);
    } catch (error) {
      console.warn(`Preferences set failed for ${key}, falling back to localStorage:`, error);
      localStorage.setItem(key, value);
    }
  } else {
    localStorage.setItem(key, value);
  }
};

/**
 * Securely retrieve a value
 */
export const secureGet = async (key: string): Promise<string | null> => {
  if (isNative) {
    try {
      const result = await Preferences.get({ key });
      return result.value;
    } catch (error) {
      const fallback = localStorage.getItem(key);
      if (fallback) {
        console.log(`Found ${key} in localStorage fallback`);
      }
      return fallback;
    }
  } else {
    return localStorage.getItem(key);
  }
};

/**
 * Securely remove a value
 */
export const secureRemove = async (key: string): Promise<void> => {
  if (isNative) {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.log(`Preferences remove: key ${key} may not exist`);
    }
  } else {
    localStorage.removeItem(key);
  }
};

/**
 * Clear all preferences (for logout)
 */
export const secureClear = async (): Promise<void> => {
  if (isNative) {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Preferences clear failed:', error);
    }
  } else {
    console.log('Web fallback: use secureRemove for individual keys');
  }
};

/**
 * Check if a key exists in secure storage
 */
export const secureHas = async (key: string): Promise<boolean> => {
  const value = await secureGet(key);
  return value !== null;
};
