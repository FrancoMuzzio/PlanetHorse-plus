// ============= CONFIGURATION =============
export const CONFIG = {
  TOKEN_ADDRESS: '0x7f8e304eb2894e57f8b930000f396319729bd1f1',
  API_BASE_URL: 'https://exchange-rate.skymavis.com/v2/prices?addresses=',
  BALANCE_ELEMENT_ID: 'phorse-balance',
  DEFAULT_CURRENCY: 'usd',
  CURRENT_CONVERSION: 'usd', // Current selected conversion
  DEBUG: true,
  
  // Supported conversion types (scalable structure)
  CONVERSION_TYPES: {
    tokens: {
      ron: {
        address: '0xe514d9deb7966c8be0ca922de8a064264ea6bcd4',
        symbol: '🏛️',
        name: 'RON',
        displayName: 'Ronin Token'
      }
      // Future Ronin tokens can be added here...
    },
    fiat: {
      usd: {
        symbol: '💲',
        name: 'USD',
        displayName: 'US Dollar'
      },
      eur: {
        symbol: '💶',
        name: 'EUR',
        displayName: 'Euro'
      }
    }
  },
  
  // CSS Classes configuration
  CSS_CLASSES: {
    CONVERTED_PRICE: 'phorse-converted',
    CURRENCY_SELECTOR: 'phorse-currency-selector',
    CURRENCY_GROUP_PREFIX: 'styles_currencyGroup__'
  },
  
  // CSS Styles configuration
  CSS_STYLES: {
    GRID_LAYOUT: `
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 2px 5px;
      align-items: center;
    `,
    TEXT_CENTER: 'text-align: center;'
  }
};

/**
 * Conditional debug logging utility
 * Only logs messages when CONFIG.DEBUG is true
 * @param {...*} args - Arguments to log to console
 * @returns {void}
 */
export function debugLog(...args) {
  if (CONFIG.DEBUG) {
    console.log('[Planet Horse Extension]', ...args);
  }
}

/**
 * Gets all available conversions in cycling order (fiat first, then tokens)
 * @returns {string[]} Array of conversion keys
 */
export function getAvailableConversions() {
  const fiatKeys = Object.keys(CONFIG.CONVERSION_TYPES.fiat);
  const tokenKeys = Object.keys(CONFIG.CONVERSION_TYPES.tokens);
  return [...fiatKeys, ...tokenKeys];
}

/**
 * Gets the type of conversion (tokens or fiat)
 * @param {string} conversionKey - The conversion key to check
 * @returns {'tokens'|'fiat'} The conversion type
 * @throws {Error} If conversion type is unknown
 */
export function getConversionType(conversionKey) {
  if (CONFIG.CONVERSION_TYPES.tokens[conversionKey]) return 'tokens';
  if (CONFIG.CONVERSION_TYPES.fiat[conversionKey]) return 'fiat';
  throw new Error(`Unknown conversion type: ${conversionKey}`);
}

/**
 * Gets conversion information for a given key
 * @param {string} conversionKey - The conversion key
 * @returns {Object} Conversion configuration object
 */
export function getConversionInfo(conversionKey) {
  debugLog('ℹ️ GET CONVERSION INFO for:', conversionKey);
  
  const type = getConversionType(conversionKey);
  debugLog('ℹ️ Type determined:', type);
  
  const info = CONFIG.CONVERSION_TYPES[type][conversionKey];
  debugLog('ℹ️ Info retrieved:', info);
  
  return info;
}

/**
 * Gets the next conversion in the cycling order
 * @param {string} currentConversion - Current conversion key
 * @returns {string} Next conversion key
 */
export function getNextConversion(currentConversion) {
  const available = getAvailableConversions();
  debugLog('🔍 Available conversions:', available);
  debugLog('🔍 Looking for index of:', currentConversion);
  
  const currentIndex = available.indexOf(currentConversion);
  debugLog('🔍 Current index found:', currentIndex);
  
  if (currentIndex === -1) {
    debugLog('🔍 Fallback to default:', CONFIG.DEFAULT_CURRENCY);
    return CONFIG.DEFAULT_CURRENCY;
  }
  
  const nextIndex = (currentIndex + 1) % available.length;
  const next = available[nextIndex];
  debugLog('🔍 Next index:', nextIndex, 'Next conversion:', next);
  
  return next;
}
