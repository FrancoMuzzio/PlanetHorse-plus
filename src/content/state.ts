import { CONFIG, debugLog, type ConversionKey } from './config';
import { loadUserPreferredCurrency, getUserPreferredCurrencyStorageItem } from './storage';
import { isValidConversion, createConversionValidationError, isConversionEnabled, getFirstEnabledConversion } from './utils/validation';

/**
 * State management for runtime conversion state
 * Provides controlled access to current conversion state
 */

// ConversionKey type imported from config.ts

// Private state - not exported to prevent direct access
let currentConversion: ConversionKey = CONFIG.DEFAULT_CURRENCY;

/**
 * Gets the current conversion state
 * @returns Current conversion key (e.g., 'usd', 'eur', 'ron')
 */
export function getCurrentConversion(): ConversionKey {
  return currentConversion;
}

/**
 * Sets the current conversion state with validation, logging, and persistence
 * @param newConversion - New conversion key to set
 * @throws {Error} If conversion type is invalid
 */
export function setCurrentConversion(newConversion: ConversionKey): void {
  // Validate conversion using utility function
  if (!isValidConversion(newConversion)) {
    throw createConversionValidationError(newConversion);
  }
  
  currentConversion = newConversion;
  
  // Persist user preference using WXT storage (non-blocking)
  const storageItem = getUserPreferredCurrencyStorageItem();
  storageItem.setValue(newConversion).catch(error => {
  });
}

/**
 * Ensures current conversion is enabled, switches to fallback if not
 * @returns Promise that resolves when current conversion has been validated/updated
 */
export async function ensureCurrentConversionIsEnabled(): Promise<void> {
  try {
    const isCurrentEnabled = await isConversionEnabled(currentConversion);
    
    if (!isCurrentEnabled) {
      const fallbackConversion = await getFirstEnabledConversion();
      currentConversion = fallbackConversion;
      
      // Persist the fallback choice
      const storageItem = getUserPreferredCurrencyStorageItem();
      storageItem.setValue(fallbackConversion).catch(error => {
      });
      
    }
  } catch (error) {
    debugLog('Error ensuring conversion is enabled:', error);
    // Keep current conversion if error occurs
  }
}

/**
 * Resets conversion state to default
 */
export function resetConversion(): void {
  currentConversion = CONFIG.DEFAULT_CURRENCY;
}

/**
 * Initializes conversion state by loading user's preferred currency from storage
 * @returns Promise that resolves when state is initialized
 */
export async function initializeConversionState(): Promise<void> {
  try {
    const preferredCurrency = await loadUserPreferredCurrency();
    currentConversion = preferredCurrency;
    debugLog('Initialized conversion state with user preference:', preferredCurrency);
    
    // Ensure the loaded currency is enabled, switch to fallback if not
    await ensureCurrentConversionIsEnabled();
  } catch (error) {
    debugLog('Error initializing conversion state:', error);
    currentConversion = CONFIG.DEFAULT_CURRENCY;
  }
}