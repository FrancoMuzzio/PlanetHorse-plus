// ============= CONFIGURATION =============
export const CONFIG = {
  PHORSE_ADDRESS: '0x6ad39689cac97a3e647fabd31534555bc7edd5c6',
  API_BASE_URL: 'https://exchange-rate.skymavis.com/v2/prices?addresses=',
  BALANCE_ELEMENT_ID: 'phorse-balance',
  DEFAULT_CURRENCY: 'usd',
  DEBUG: true,
  
  // Supported conversion types (scalable structure)
  CONVERSION_TYPES: {
    tokens: {
      ron: {
        address: '0xe514d9deb7966c8be0ca922de8a064264ea6bcd4',
        symbol: '🌐',
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
        symbol: '💲',
        name: 'EUR',
        displayName: 'Euro'
      },
      ars: {
        symbol: '💲',
        name: 'ARS',
        displayName: 'Argentine Peso'
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
      grid-template-rows: auto auto;
      gap: 2px 5px;
      align-items: center;
    `,
    TEXT_CENTER: 'text-align: center;',
    GRID_ICON: 'right: 0 !important; left: auto !important; width: 32px !important; max-width: 32px !important; min-width: 32px !important; margin: 0 !important; grid-column: 1; grid-row: 1;',
    GRID_BALANCE: 'grid-column: 2; grid-row: 1;',
    GRID_DROPDOWN: 'grid-column: 1; grid-row: 2;',
    GRID_CONVERTED: 'grid-column: 2; grid-row: 2;',
    DROPDOWN_STYLES: 'cursor: pointer; border: 1px solid #3a1a15; border-radius: 4px; background: #582c25; color: white; font-size: 14px; padding: 2px 4px; font-family: "SpaceHorse", system-ui, -apple-system, sans-serif;'
  },
  
  // Timeout configuration (in milliseconds)
  TIMEOUTS: {
    CLIENT_TIMEOUT: 15000,          // Client-side API timeout
    SERVER_TIMEOUT: 10000,          // Background script fetch timeout
    RETRY_DELAY: 5000,              // Error retry delay
    RECONNECT_DELAY: 30000,         // Observer reconnect delay
    DEBOUNCE_DELAY: 500             // DOM change debounce
  },
  
  // Error handling limits
  LIMITS: {
    MAX_OBSERVER_ERRORS: 5          // Max errors before disconnecting observer
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
  const type = getConversionType(conversionKey);
  const info = CONFIG.CONVERSION_TYPES[type][conversionKey];
  return info;
}

/**
 * Gets the next conversion in the cycling order
 * @param {string} currentConversion - Current conversion key
 * @returns {string} Next conversion key
 */
export function getNextConversion(currentConversion) {
  const available = getAvailableConversions();
  const currentIndex = available.indexOf(currentConversion);
  
  if (currentIndex === -1) {
    return CONFIG.DEFAULT_CURRENCY;
  }
  
  const nextIndex = (currentIndex + 1) % available.length;
  return available[nextIndex];
}

/**
 * Gets display text for dropdown options
 * @param {string} conversionKey - The conversion key
 * @returns {string} Display text with symbol and name (e.g., "💲 USD")
 */
export function getConversionDisplayText(conversionKey) {
  const info = getConversionInfo(conversionKey);
  return `${info.symbol} ${info.name}`;
}
