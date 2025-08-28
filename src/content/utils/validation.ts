/**
 * Validation utilities for currency conversion types
 * Extracted from state.ts and storage.ts to eliminate code duplication
 */

import { CONFIG, type ConversionKey } from '../config';

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