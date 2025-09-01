/**
 * Validation utilities for currency conversion types
 * Extracted from state.ts and storage.ts to eliminate code duplication
 */

import { CONFIG, type ConversionKey } from '../config';
import { loadEnabledCurrencies } from '../storage';

/**
 * Gets all valid conversion keys (both fiat and tokens)
 * @returns Array of all valid conversion keys
 * @example
 * getAllValidConversions() // returns ['usd', 'eur', 'ars', 'ron']
 */
export function getAllValidConversions(): ConversionKey[] {
  const fiatTypes = Object.keys(CONFIG.CONVERSION_TYPES.fiat);
  const tokenTypes = Object.keys(CONFIG.CONVERSION_TYPES.tokens);
  return [...fiatTypes, ...tokenTypes];
}

/**
 * Validates if a conversion key is valid
 * @param conversion - The conversion key to validate
 * @returns True if the conversion is valid, false otherwise
 * @example
 * isValidConversion('usd') // returns true
 * isValidConversion('invalid') // returns false
 */
export function isValidConversion(conversion: string): conversion is ConversionKey {
  const allValidTypes = getAllValidConversions();
  return allValidTypes.includes(conversion);
}

/**
 * Validates and returns a fallback conversion if invalid
 * @param conversion - The conversion key to validate
 * @param fallback - The fallback conversion to use if invalid (defaults to CONFIG.DEFAULT_CURRENCY)
 * @returns The validated conversion or fallback
 * @example
 * validateConversionWithFallback('usd') // returns 'usd'
 * validateConversionWithFallback('invalid') // returns CONFIG.DEFAULT_CURRENCY
 * validateConversionWithFallback('invalid', 'eur') // returns 'eur'
 */
export function validateConversionWithFallback(
  conversion: string, 
  fallback: ConversionKey = CONFIG.DEFAULT_CURRENCY
): ConversionKey {
  return isValidConversion(conversion) ? conversion : fallback;
}

/**
 * Creates a detailed validation error for an invalid conversion
 * @param invalidConversion - The invalid conversion key
 * @returns Error object with detailed validation message
 */
export function createConversionValidationError(invalidConversion: string): Error {
  const validTypes = getAllValidConversions();
  return new Error(
    `Invalid conversion type: ${invalidConversion}. Valid types: ${validTypes.join(', ')}`
  );
}

/**
 * Gets all fiat conversion keys
 * @returns Array of fiat conversion keys
 */
export function getFiatConversions(): ConversionKey[] {
  return Object.keys(CONFIG.CONVERSION_TYPES.fiat);
}

/**
 * Gets all token conversion keys
 * @returns Array of token conversion keys  
 */
export function getTokenConversions(): ConversionKey[] {
  return Object.keys(CONFIG.CONVERSION_TYPES.tokens);
}

/**
 * Gets only enabled conversion keys from storage
 * @returns Promise that resolves to array of enabled conversion keys
 * @example
 * const enabled = await getEnabledConversions(); // returns ['usd', 'ron'] if only those are enabled
 */
export async function getEnabledConversions(): Promise<ConversionKey[]> {
  try {
    const enabledCurrencies = await loadEnabledCurrencies();
    const allValidConversions = getAllValidConversions();
    
    // Filter to only return valid and enabled currencies
    const validEnabledCurrencies = enabledCurrencies.filter(currency => 
      allValidConversions.includes(currency)
    );
    
    // Ensure at least one currency is enabled (fallback to default)
    if (validEnabledCurrencies.length === 0) {
      return [CONFIG.DEFAULT_CURRENCY];
    }
    
    return validEnabledCurrencies;
  } catch (error) {
    // Fallback to all valid conversions if error loading enabled currencies
    return getAllValidConversions();
  }
}

/**
 * Validates if a conversion is currently enabled
 * @param conversion - The conversion key to check
 * @returns Promise that resolves to true if the conversion is enabled
 */
export async function isConversionEnabled(conversion: ConversionKey): Promise<boolean> {
  const enabledConversions = await getEnabledConversions();
  return enabledConversions.includes(conversion);
}

/**
 * Gets the first enabled conversion as fallback
 * @returns Promise that resolves to the first enabled conversion key
 */
export async function getFirstEnabledConversion(): Promise<ConversionKey> {
  const enabledConversions = await getEnabledConversions();
  return enabledConversions[0] || CONFIG.DEFAULT_CURRENCY;
}