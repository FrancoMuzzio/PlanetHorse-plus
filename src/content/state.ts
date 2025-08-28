import { CONFIG, debugLog, type ConversionKey } from './config';
import { loadUserPreferredCurrency, getUserPreferredCurrencyStorageItem } from './storage';
import { isValidConversion, createConversionValidationError } from './utils/validation';

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
    debugLog('Failed to save user preferred currency:', error);
  });
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
  } catch (error) {
    debugLog('Error initializing conversion state:', error);
    currentConversion = CONFIG.DEFAULT_CURRENCY;
  }
}