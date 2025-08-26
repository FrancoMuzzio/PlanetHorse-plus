// ============= CONFIGURATION =============

// Type definitions
export type ConversionKey = string;
export type ConversionType = 'tokens' | 'fiat';

export interface ConversionInfo {
  symbol: string;
  name: string;
  displayName: string;
  address?: string; // Only for token types
}

export interface ConversionTypes {
  tokens: Record<string, ConversionInfo>;
  fiat: Record<string, ConversionInfo>;
}

export interface CSSClasses {
  CONVERTED_PRICE: string;
  CURRENCY_SELECTOR: string;
  CURRENCY_GROUP_PREFIX: string;
  SETTINGS_BUTTON: string;
  ACTION_OPTIONS_PREFIX: string;
}

export interface CSSStyles {
  GRID_LAYOUT: string;
  TEXT_CENTER: string;
  GRID_ICON: string;
  GRID_BALANCE: string;
  GRID_DROPDOWN: string;
  GRID_CONVERTED: string;
  DROPDOWN_STYLES: string;
  SETTINGS_BUTTON_STYLES: string;
}

export interface Timeouts {
  RETRY_DELAY: number;
  RECONNECT_DELAY: number;
  DEBOUNCE_DELAY: number;
}

export interface Limits {
  MAX_OBSERVER_ERRORS: number;
}

export interface Features {
  PRICE_CONVERTER_ENABLED: boolean;
  SETTINGS_MODAL_ENABLED: boolean;
}

export interface ConfigType {
  PHORSE_ADDRESS: string;
  API_BASE_URL: string;
  BALANCE_ELEMENT_ID: string;
  DEFAULT_CURRENCY: string;
  DEBUG: boolean;
  CONVERSION_TYPES: ConversionTypes;
  CSS_CLASSES: CSSClasses;
  CSS_STYLES: CSSStyles;
  TIMEOUTS: Timeouts;
  LIMITS: Limits;
  FEATURES: Features;
}

export const CONFIG: ConfigType = {
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
    CURRENCY_GROUP_PREFIX: 'styles_currencyGroup__',
    SETTINGS_BUTTON: 'phorse-settings-btn',
    ACTION_OPTIONS_PREFIX: 'styles_actionOptions__'
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
    DROPDOWN_STYLES: 'cursor: pointer; border: 1px solid #3a1a15; border-radius: 4px; background: #582c25; color: white; font-size: 14px; padding: 2px 4px; font-family: "SpaceHorse", system-ui, -apple-system, sans-serif;',
    SETTINGS_BUTTON_STYLES: 'cursor: none !important; background: transparent !important; border: none !important; border-radius: 6px !important; width: 40px !important; height: 40px !important; display: flex !important; align-items: center !important; justify-content: center !important; transition: background-color 0.2s !important; outline: none !important;'
  },
  
  // Timeout configuration (in milliseconds)
  TIMEOUTS: {
    RETRY_DELAY: 5000,              // Error retry delay
    RECONNECT_DELAY: 30000,         // Observer reconnect delay
    DEBOUNCE_DELAY: 500             // DOM change debounce
  },
  
  // Error handling limits
  LIMITS: {
    MAX_OBSERVER_ERRORS: 5          // Max errors before disconnecting observer
  },
  
  // Feature toggles
  FEATURES: {
    PRICE_CONVERTER_ENABLED: true,   // Enable/disable price converter functionality
    SETTINGS_MODAL_ENABLED: true     // Enable/disable settings modal functionality
  }
};

/**
 * Conditional debug logging utility
 * Only logs messages when CONFIG.DEBUG is true
 * @param args - Arguments to log to console
 */
export function debugLog(...args: any[]): void {
  if (CONFIG.DEBUG) {
    console.log('[Planet Horse Extension]', ...args);
  }
}

/**
 * Gets all available conversions in cycling order (fiat first, then tokens)
 * @returns Array of conversion keys
 */
export function getAvailableConversions(): ConversionKey[] {
  const fiatKeys = Object.keys(CONFIG.CONVERSION_TYPES.fiat);
  const tokenKeys = Object.keys(CONFIG.CONVERSION_TYPES.tokens);
  return [...fiatKeys, ...tokenKeys];
}

/**
 * Gets the type of conversion (tokens or fiat)
 * @param conversionKey - The conversion key to check
 * @returns The conversion type
 * @throws {Error} If conversion type is unknown
 */
export function getConversionType(conversionKey: ConversionKey): ConversionType {
  if (CONFIG.CONVERSION_TYPES.tokens[conversionKey]) return 'tokens';
  if (CONFIG.CONVERSION_TYPES.fiat[conversionKey]) return 'fiat';
  throw new Error(`Unknown conversion type: ${conversionKey}`);
}

/**
 * Gets conversion information for a given key
 * @param conversionKey - The conversion key
 * @returns Conversion configuration object
 */
export function getConversionInfo(conversionKey: ConversionKey): ConversionInfo {
  const type = getConversionType(conversionKey);
  const info = CONFIG.CONVERSION_TYPES[type][conversionKey];
  return info;
}

/**
 * Gets the next conversion in the cycling order
 * @param currentConversion - Current conversion key
 * @returns Next conversion key
 */
export function getNextConversion(currentConversion: ConversionKey): ConversionKey {
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
 * @param conversionKey - The conversion key
 * @returns Display text with symbol and name (e.g., "💲 USD")
 */
export function getConversionDisplayText(conversionKey: ConversionKey): string {
  const info = getConversionInfo(conversionKey);
  return `${info.symbol} ${info.name}`;
}

/**
 * Generic DRY function to find elements by CSS class prefix
 * @param prefix - The CSS class prefix to search for (e.g., "styles_actionOptions__")
 * @returns The first matching element or null if not found
 */
export function findElementByClassPrefix(prefix: string): HTMLElement | null {
  try {
    const element = document.querySelector(`[class*="${prefix}"]`) as HTMLElement | null;
    debugLog(`findElementByClassPrefix("${prefix}"):`, element ? 'Found' : 'Not found');
    return element;
  } catch (error) {
    debugLog(`Error in findElementByClassPrefix("${prefix}"):`, error);
    return null;
  }
}