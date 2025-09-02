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
  
  // Dropdown Component Classes
  DROPDOWN_CONTAINER: string;
  DROPDOWN_BUTTON: string;
  DROPDOWN_CURRENT_SELECTION: string;
  DROPDOWN_ARROW: string;
  DROPDOWN_OPTIONS: string;
  DROPDOWN_OPTION: string;
  GRID_DROPDOWN: string;
  
  // Grid Layout System Classes
  GRID_LAYOUT: string;
  GRID_ICON: string;
  GRID_BALANCE: string;
  GRID_CONVERTED: string;
  TEXT_CENTER: string;
  DISPLAY_CONTENTS: string;
  
  // Modal System Classes
  MODAL_CONTAINER: string;
  MODAL_CONTENT: string;
  MODAL_HEADER: string;
  MODAL_CLOSE_BUTTON: string;
  MODAL_CLOSE_ICON: string;
  MODAL_BODY: string;
  
  // Settings Button Classes
  TRANSPARENT_CONTAINER: string;
  SETTINGS_BUTTON_STYLE: string;
  GEAR_ICON: string;
  
  // Settings Modal Content Classes
  SETTINGS_SECTION: string;
  SETTINGS_LABEL: string;
  TOGGLE_CONTAINER: string;
  TOGGLE_SWITCH: string;
  TOGGLE_SLIDER: string;
  TOGGLE_STATUS_TEXT: string;
  SAVE_BUTTON: string;
  MODAL_FOOTER: string;
  
  // Currency List Section Classes
  CURRENCY_LIST_SECTION: string;
  CURRENCY_LIST_CONTAINER: string;
  CURRENCY_ITEM: string;
  CURRENCY_CHECKBOX_CONTAINER: string;
  CURRENCY_CHECKBOX: string;
  CURRENCY_LABEL_TEXT: string;
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
  CSS_TOKENS: any; // Design tokens for CSS values
  CSS_CLASSES: CSSClasses;
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
        displayName: 'Ronin'
      },
      wbtc: {
        address: '0xca3eb64f3dfd7861c76070e3d1492ee5ee20cdc3',
        symbol: '🌐',
        name: 'WBTC',
        displayName: 'Wrapped Bitcoin'
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
      },
      brl: {
        symbol: '💲',
        name: 'BRL',
        displayName: 'Brazilian Real'
      },
      cny: {
        symbol: '💲',
        name: 'CNY',
        displayName: 'Chinese Yuan'
      },
      gbp: {
        symbol: '💲',
        name: 'GBP',
        displayName: 'British Pound'
      },
      idr: {
        symbol: '💲',
        name: 'IDR',
        displayName: 'Indonesian Rupiah'
      },
      inr: {
        symbol: '💲',
        name: 'INR',
        displayName: 'Indian Rupee'
      },
      irr: {
        symbol: '💲',
        name: 'IRR',
        displayName: 'Iranian Rial'
      },
      jpy: {
        symbol: '💲',
        name: 'JPY',
        displayName: 'Japanese Yen'
      },
      krw: {
        symbol: '💲',
        name: 'KRW',
        displayName: 'South Korean Won'
      },
      myr: {
        symbol: '💲',
        name: 'MYR',
        displayName: 'Malaysian Ringgit'
      },
      php: {
        symbol: '💲',
        name: 'PHP',
        displayName: 'Philippine Peso'
      },
      rub: {
        symbol: '💲',
        name: 'RUB',
        displayName: 'Russian Ruble'
      },
      sgd: {
        symbol: '💲',
        name: 'SGD',
        displayName: 'Singapore Dollar'
      },
      thb: {
        symbol: '💲',
        name: 'THB',
        displayName: 'Thai Baht'
      },
      vnd: {
        symbol: '💲',
        name: 'VND',
        displayName: 'Vietnamese Dong'
      }
    }
  },
  
  // CSS Design Tokens (consolidated values)
  CSS_TOKENS: {
    COLORS: {
      PRIMARY_BG: '#582c25',
      BORDER_PRIMARY: '#3a1a15',
      HOVER_BG: '#6b3529',
      TEXT_PRIMARY: 'white',
      TRANSPARENT: 'transparent'
    },
    FONTS: {
      FAMILY_PRIMARY: '"SpaceHorse", system-ui, -apple-system, sans-serif'
    },
    SPACING: {
      GRID_GAP: '2px 5px',
      BORDER_RADIUS_SM: '4px',
      BORDER_RADIUS: '5px',
      BORDER_RADIUS_MD: '6px',
      BORDER_RADIUS_LG: '8px'
    },
    SIZES: {
      ICON_SIZE: '32px',
      BUTTON_SIZE: '40px',
      DROPDOWN_HEIGHT: '28px',
      DROPDOWN_WIDTH: '160px',
      OPTIONS_MAX_HEIGHT: '120px'
    }
  },
  
  // CSS Classes configuration
  CSS_CLASSES: {
    CONVERTED_PRICE: 'phorse-converted',
    CURRENCY_SELECTOR: 'phorse-currency-selector',
    CURRENCY_GROUP_PREFIX: 'styles_currencyGroup__',
    SETTINGS_BUTTON: 'phorse-settings-btn',
    ACTION_OPTIONS_PREFIX: 'styles_actionOptions__',
    
    // Dropdown Component Classes
    DROPDOWN_CONTAINER: 'phorse-dropdown-container',
    DROPDOWN_BUTTON: 'phorse-dropdown-button',
    DROPDOWN_CURRENT_SELECTION: 'phorse-dropdown-current-selection',
    DROPDOWN_ARROW: 'phorse-dropdown-arrow',
    DROPDOWN_OPTIONS: 'phorse-dropdown-options',
    DROPDOWN_OPTION: 'phorse-dropdown-option',
    GRID_DROPDOWN: 'phorse-grid-dropdown',
    
    // Grid Layout System Classes
    GRID_LAYOUT: 'phorse-grid-layout',
    GRID_ICON: 'phorse-grid-icon',
    GRID_BALANCE: 'phorse-grid-balance',
    GRID_CONVERTED: 'phorse-grid-converted',
    TEXT_CENTER: 'phorse-text-center',
    DISPLAY_CONTENTS: 'phorse-display-contents',
    
    // Modal System Classes
    MODAL_CONTAINER: 'phorse-modal-container',
    MODAL_CONTENT: 'phorse-modal-content',
    MODAL_HEADER: 'phorse-modal-header',
    MODAL_CLOSE_BUTTON: 'phorse-modal-close-button',
    MODAL_CLOSE_ICON: 'phorse-modal-close-icon',
    MODAL_BODY: 'phorse-modal-body',
    
    // Settings Button Classes
    TRANSPARENT_CONTAINER: 'phorse-transparent-container',
    SETTINGS_BUTTON_STYLE: 'phorse-settings-button',
    GEAR_ICON: 'phorse-gear-icon',
    
    // Settings Modal Content Classes
    SETTINGS_SECTION: 'phorse-settings-section',
    SETTINGS_LABEL: 'phorse-settings-label',
    TOGGLE_CONTAINER: 'phorse-toggle-container',
    TOGGLE_SWITCH: 'phorse-toggle-switch',
    TOGGLE_SLIDER: 'phorse-toggle-slider',
    TOGGLE_STATUS_TEXT: 'phorse-toggle-status-text',
    SAVE_BUTTON: 'phorse-save-button',
    MODAL_FOOTER: 'phorse-modal-footer',
    
    // Currency List Section Classes
    CURRENCY_LIST_SECTION: 'phorse-currency-list-section',
    CURRENCY_LIST_CONTAINER: 'phorse-currency-list-container',
    CURRENCY_ITEM: 'phorse-currency-item',
    CURRENCY_CHECKBOX_CONTAINER: 'phorse-currency-checkbox-container',
    CURRENCY_CHECKBOX: 'phorse-currency-checkbox',
    CURRENCY_LABEL_TEXT: 'phorse-currency-label-text'
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
 * Gets display text with symbol and specified info key
 * @param conversionKey - The conversion key
 * @param infoKey - Which info property to use ('name' | 'displayName')
 * @returns Display text with symbol and specified info (e.g., "💲 USD" or "💲 US Dollar")
 */
export function getConversionDisplayText(conversionKey: ConversionKey, infoKey: 'name' | 'displayName' = 'displayName'): string {
  const info = getConversionInfo(conversionKey);
  return `${info.symbol} ${info[infoKey]}`;
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