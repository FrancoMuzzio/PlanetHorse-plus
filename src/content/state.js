import { CONFIG, debugLog } from './config.js';

/**
 * State management for runtime conversion state
 * Provides controlled access to current conversion state
 */

// Private state - not exported to prevent direct access
let currentConversion = CONFIG.DEFAULT_CURRENCY;

/**
 * Gets the current conversion state
 * @returns {string} Current conversion key (e.g., 'usd', 'eur', 'ron')
 */
export function getCurrentConversion() {
  return currentConversion;
}

/**
 * Sets the current conversion state with validation and logging
 * @param {string} newConversion - New conversion key to set
 * @throws {Error} If conversion type is invalid
 */
export function setCurrentConversion(newConversion) {
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
export function resetConversion() {
  currentConversion = CONFIG.DEFAULT_CURRENCY;
}