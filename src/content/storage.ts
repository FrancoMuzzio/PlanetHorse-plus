import { CONFIG, debugLog, type ConversionKey } from './config';

/**
 * Storage module for persisting user preferences using chrome.storage.local
 * Provides type-safe access to user currency preferences
 */

// Storage key for user's preferred currency
const USER_CURRENCY_KEY = 'user_preferred_currency';

/**
 * Loads user's preferred currency from chrome.storage.local
 * @returns Promise that resolves to user's preferred currency or default currency
 */
export async function loadUserPreferredCurrency(): Promise<ConversionKey> {
  try {
    const result = await chrome.storage.local.get(USER_CURRENCY_KEY);
    const savedCurrency = result[USER_CURRENCY_KEY] as ConversionKey;
    
    // Validate that saved currency is still valid
    if (savedCurrency) {
      const fiatTypes = Object.keys(CONFIG.CONVERSION_TYPES.fiat);
      const tokenTypes = Object.keys(CONFIG.CONVERSION_TYPES.tokens);
      const allTypes = [...fiatTypes, ...tokenTypes];
      
      if (allTypes.includes(savedCurrency)) {
        debugLog('Loaded user preferred currency:', savedCurrency);
        return savedCurrency;
      } else {
        debugLog('Invalid saved currency:', savedCurrency, 'falling back to default');
      }
    }
    
    // Return default if no valid saved preference
    return CONFIG.DEFAULT_CURRENCY;
  } catch (error) {
    debugLog('Error loading user preferred currency:', error);
    return CONFIG.DEFAULT_CURRENCY;
  }
}

/**
 * Saves user's preferred currency to chrome.storage.local
 * @param currency - The currency to save as user preference
 */
export async function saveUserPreferredCurrency(currency: ConversionKey): Promise<void> {
  try {
    await chrome.storage.local.set({ [USER_CURRENCY_KEY]: currency });
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
    await chrome.storage.local.remove(USER_CURRENCY_KEY);
    debugLog('Cleared user preferred currency');
  } catch (error) {
    debugLog('Error clearing user preferred currency:', error);
  }
}