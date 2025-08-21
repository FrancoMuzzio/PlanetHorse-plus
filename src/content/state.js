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
  debugLog('🏛️ STATE GET:', currentConversion);
  return currentConversion;
}

/**
 * Sets the current conversion state with validation and logging
 * @param {string} newConversion - New conversion key to set
 * @throws {Error} If conversion type is invalid
 */
export function setCurrentConversion(newConversion) {
  const oldConversion = currentConversion;
  
  debugLog('🏛️ STATE SET: Changing from', oldConversion, 'to', newConversion);
  
  // Validate conversion exists in configuration
  const fiatTypes = Object.keys(CONFIG.CONVERSION_TYPES.fiat);
  const tokenTypes = Object.keys(CONFIG.CONVERSION_TYPES.tokens);
  const allTypes = [...fiatTypes, ...tokenTypes];
  
  if (!allTypes.includes(newConversion)) {
    throw new Error(`Invalid conversion type: ${newConversion}. Valid types: ${allTypes.join(', ')}`);
  }
  
  currentConversion = newConversion;
  debugLog('🏛️ STATE SET: Successfully updated to', currentConversion);
}

/**
 * Resets conversion state to default
 */
export function resetConversion() {
  debugLog('🏛️ STATE RESET: Resetting to default:', CONFIG.DEFAULT_CURRENCY);
  currentConversion = CONFIG.DEFAULT_CURRENCY;
}