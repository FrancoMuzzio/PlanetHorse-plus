import { CONFIG, debugLog, type ConversionKey } from './config.js';

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
 * Sets the current conversion state with validation and logging
 * @param newConversion - New conversion key to set
 * @throws {Error} If conversion type is invalid
 */
export function setCurrentConversion(newConversion: ConversionKey): void {
  // Validate conversion exists in configuration
  const fiatTypes = Object.keys(CONFIG.CONVERSION_TYPES.fiat);
  const tokenTypes = Object.keys(CONFIG.CONVERSION_TYPES.tokens);
  const allTypes = [...fiatTypes, ...tokenTypes];
  
  if (!allTypes.includes(newConversion)) {
    throw new Error(`Invalid conversion type: ${newConversion}. Valid types: ${allTypes.join(', ')}`);
  }
  
  currentConversion = newConversion;
}

/**
 * Resets conversion state to default
 */
export function resetConversion(): void {
  currentConversion = CONFIG.DEFAULT_CURRENCY;
}