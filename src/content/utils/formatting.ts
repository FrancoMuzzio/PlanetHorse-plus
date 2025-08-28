/**
 * Formatting utilities for price display and calculations
 * Extracted from ui.ts for better modularity and reusability
 */

/**
 * Calculates the converted price value of a token balance
 * @param balanceText - The balance text to parse (e.g., "123.45")
 * @param tokenPrice - The current token price in target currency
 * @returns The calculated converted value
 * @example
 * calculateConvertedPrice("100.5", 2.34) // returns 235.17
 */
export function calculateConvertedPrice(balanceText: string, tokenPrice: number): number {
  const balanceValue = parseFloat(balanceText) || 0;
  return balanceValue * tokenPrice;
}

/**
 * Formats a numeric price value for display with consistent formatting
 * @param value - The price value to format
 * @returns The formatted price with 2 decimal places
 * @example
 * formatPrice(123.456) // returns "123.46"
 * formatPrice(0) // returns "0.00"
 */
export function formatPrice(value: number): string {
  return value.toFixed(2);
}

/**
 * Parses and validates a balance string, returning a numeric value
 * @param balanceText - The balance text to parse
 * @returns The parsed balance value or 0 if invalid
 * @example
 * parseBalanceValue("123.45") // returns 123.45
 * parseBalanceValue("invalid") // returns 0
 * parseBalanceValue("") // returns 0
 */
export function parseBalanceValue(balanceText: string): number {
  const parsed = parseFloat(balanceText);
  return isNaN(parsed) ? 0 : parsed;
}