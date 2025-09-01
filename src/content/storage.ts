import { CONFIG, debugLog, type ConversionKey } from './config';
import { storage } from '#imports';
import { isValidConversion } from './utils/validation';

/**
 * Storage module for persisting user preferences using WXT Storage API
 * Provides type-safe access to user currency preferences with automatic validation
 */

// WXT storage item definition with automatic validation and fallback
const userPreferredCurrency = storage.defineItem<ConversionKey>('local:user_preferred_currency', {
  fallback: CONFIG.DEFAULT_CURRENCY,
});

// WXT storage item for price converter enabled/disabled setting
const priceConverterEnabled = storage.defineItem<boolean>('local:price_converter_enabled', {
  fallback: true, // Default to enabled (same as current CONFIG.FEATURES.PRICE_CONVERTER_ENABLED)
});

/**
 * Loads user's preferred currency from WXT storage
 * @returns Promise that resolves to user's preferred currency or default currency
 */
export async function loadUserPreferredCurrency(): Promise<ConversionKey> {
  try {
    const savedCurrency = await userPreferredCurrency.getValue();
    
    // Validate that saved currency is still valid (business logic validation)
    if (isValidConversion(savedCurrency)) {
      debugLog('Loaded user preferred currency:', savedCurrency);
      return savedCurrency;
    } else {
      debugLog('Invalid saved currency:', savedCurrency, 'falling back to default');
      // Reset to default if invalid
      await userPreferredCurrency.setValue(CONFIG.DEFAULT_CURRENCY);
      return CONFIG.DEFAULT_CURRENCY;
    }
  } catch (error) {
    debugLog('Error loading user preferred currency:', error);
    return CONFIG.DEFAULT_CURRENCY;
  }
}

/**
 * Saves user's preferred currency to WXT storage
 * @param currency - The currency to save as user preference
 */
export async function saveUserPreferredCurrency(currency: ConversionKey): Promise<void> {
  try {
    await userPreferredCurrency.setValue(currency);
    debugLog('Saved user preferred currency:', currency);
  } catch (error) {
    debugLog('Error saving user preferred currency:', error);
    // Non-critical error - extension continues to function without persistence
  }
}

/**
 * Clears user's preferred currency from storage (resets to default)
 */
export async function clearUserPreferredCurrency(): Promise<void> {
  try {
    await userPreferredCurrency.removeValue();
    debugLog('Cleared user preferred currency - will use fallback:', CONFIG.DEFAULT_CURRENCY);
  } catch (error) {
    debugLog('Error clearing user preferred currency:', error);
  }
}

/**
 * Gets WXT storage item for direct access (for advanced use cases)
 * @returns WXT storage item instance
 */
export function getUserPreferredCurrencyStorageItem() {
  return userPreferredCurrency;
}

/**
 * Loads price converter enabled setting from WXT storage
 * @returns Promise that resolves to boolean indicating if converter is enabled
 */
export async function loadConverterSettings(): Promise<boolean> {
  try {
    const isEnabled = await priceConverterEnabled.getValue();
    debugLog('Loaded price converter setting:', isEnabled);
    return isEnabled;
  } catch (error) {
    debugLog('Error loading price converter setting:', error);
    return true; // Default to enabled
  }
}

/**
 * Saves price converter enabled setting to WXT storage
 * @param enabled - Boolean indicating if converter should be enabled
 */
export async function saveConverterSettings(enabled: boolean): Promise<void> {
  try {
    await priceConverterEnabled.setValue(enabled);
    debugLog('Saved price converter setting:', enabled);
  } catch (error) {
    debugLog('Error saving price converter setting:', error);
  }
}

/**
 * Gets WXT storage item for converter settings (for advanced use cases)
 * @returns WXT storage item instance
 */
export function getConverterSettingsStorageItem() {
  return priceConverterEnabled;
}