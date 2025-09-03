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
  
  // Currency List Section Classes (shared with marketplace list)
  CURRENCY_LIST_SECTION: string;
  CURRENCY_LIST_CONTAINER: string;
  CURRENCY_ITEM: string;
  CURRENCY_CHECKBOX_CONTAINER: string;
  CURRENCY_CHECKBOX: string;
  CURRENCY_LABEL_TEXT: string;
  
  // Marketplace Button Classes
  MARKETPLACE_BUTTONS_CONTAINER: string;
  MARKETPLACE_BUTTON: string;
  RONIN_BUTTON: string;
  OPENSEA_BUTTON: string;
  RONIN_IMAGE: string;
  OPENSEA_IMAGE: string;
  HORSE_ID_CONTAINER: string;
  
  // Energy Recovery Display Classes
  ENERGY_DISPLAY_CONTAINER: string;
  ENERGY_RECOVERY_TEXT: string;
  ENERGY_RECOVERY_TEXT_NEGATIVE: string;
  
  // Tooltip Component Classes
  TOOLTIP_PORTAL: string;
  TOOLTIP_TITLE: string;
  TOOLTIP_USES_LEFT: string;
  TOOLTIP_CONTENT: string;
}


export interface Timeouts {
  RETRY_DELAY: number;
  RECONNECT_DELAY: number;
  DEBOUNCE_DELAY: number;
}

export interface Limits {
  MAX_OBSERVER_ERRORS: number;
}


export interface EnergyRecoveryEntry {
  level: number;
  maxEnergy: number;
  dailyRecovery: number;
  racesPerDay: number;
}

export interface EnergyRecoveryTable {
  entries: EnergyRecoveryEntry[];
}

export interface MarketplaceImages {
  RONIN_ICON_URL: string;
  OPENSEA_ICON_URL: string;
}

export interface MarketplaceUrls {
  RONIN_BASE: string;
  RONIN_ORIGIN_HORSES: string;
  RONIN_OFFSPRING: string;
  OPENSEA_BASE: string;
  OPENSEA_ORIGIN_HORSES: string;
  OPENSEA_OFFSPRING: string;
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
  ENERGY_RECOVERY_TABLE: EnergyRecoveryTable;
  MARKETPLACE_IMAGES: MarketplaceImages;
  MARKETPLACE_URLS: MarketplaceUrls;
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
    
    // Currency List Section Classes (shared with marketplace list)
    CURRENCY_LIST_SECTION: 'phorse-currency-list-section',
    CURRENCY_LIST_CONTAINER: 'phorse-currency-list-container',
    CURRENCY_ITEM: 'phorse-currency-item',
    CURRENCY_CHECKBOX_CONTAINER: 'phorse-currency-checkbox-container',
    CURRENCY_CHECKBOX: 'phorse-currency-checkbox',
    CURRENCY_LABEL_TEXT: 'phorse-currency-label-text',
    
    // Marketplace Button Classes
    MARKETPLACE_BUTTONS_CONTAINER: 'phorse-marketplace-buttons',
    MARKETPLACE_BUTTON: 'phorse-marketplace-button',
    RONIN_BUTTON: 'phorse-ronin-button',
    OPENSEA_BUTTON: 'phorse-opensea-button',
    RONIN_IMAGE: 'phorse-ronin-image',
    OPENSEA_IMAGE: 'phorse-opensea-image',
    HORSE_ID_CONTAINER: 'phorse-horse-id-container',
    
    // Energy Recovery Display Classes
    ENERGY_DISPLAY_CONTAINER: 'phorse-energy-display-container',
    ENERGY_RECOVERY_TEXT: 'phorse-energy-recovery-text',
    ENERGY_RECOVERY_TEXT_NEGATIVE: 'phorse-energy-recovery-text-negative',
    
    // Tooltip Component Classes  
    TOOLTIP_PORTAL: 'styles_tooltipPortal___KI9N',
    TOOLTIP_TITLE: 'styles_tooltipTitle__CnBpv',
    TOOLTIP_USES_LEFT: 'styles_usesLeft__RSx8D',
    TOOLTIP_CONTENT: 'styles_foodUsed__2VLpt'
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
  
  
  // Energy recovery table for horses by level
  ENERGY_RECOVERY_TABLE: {
    entries: [
      { level: 1, maxEnergy: 12, dailyRecovery: 48, racesPerDay: 4 },
      { level: 5, maxEnergy: 28, dailyRecovery: 56, racesPerDay: 4 },
      { level: 10, maxEnergy: 48, dailyRecovery: 60, racesPerDay: 5 },
      { level: 15, maxEnergy: 68, dailyRecovery: 68, racesPerDay: 5 },
      { level: 20, maxEnergy: 88, dailyRecovery: 76, racesPerDay: 6 },
      { level: 25, maxEnergy: 108, dailyRecovery: 80, racesPerDay: 6 },
      { level: 30, maxEnergy: 128, dailyRecovery: 88, racesPerDay: 7 }
    ]
  },
  
  // Marketplace icon images
  MARKETPLACE_IMAGES: {
    RONIN_ICON_URL: '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fwron.31e2fa29.gif&w=64&q=75',
    OPENSEA_ICON_URL: 'https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.svg'
  },
  
  // Marketplace URLs
  MARKETPLACE_URLS: {
    RONIN_BASE: 'https://marketplace.roninchain.com/collections/',
    RONIN_ORIGIN_HORSES: 'origin-horses',
    RONIN_OFFSPRING: 'planet-horse-offspring',
    OPENSEA_BASE: 'https://opensea.io/item/ronin/',
    OPENSEA_ORIGIN_HORSES: '0x66eeb20a1957c4b3743ecad19d0c2dbcf56b683f',
    OPENSEA_OFFSPRING: '0x1296ffefc43ff7eb4b7617c02ef80253db905215'
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

/**
 * Calculates energy recovery per 6 hours based on horse level
 * Uses interpolation between known recovery values from the energy recovery table
 * @param level - The horse level (1-30+)
 * @returns Energy recovery amount per 6 hours
 */
export function calculateEnergyRecoveryPer6Hours(level: number): number {
  const entries = CONFIG.ENERGY_RECOVERY_TABLE.entries;
  
  // Find exact match first
  const exactMatch = entries.find(entry => entry.level === level);
  if (exactMatch) {
    return Math.floor(exactMatch.dailyRecovery / 4); // Convert daily to 6-hour recovery
  }
  
  // Handle edge cases
  if (level <= 1) {
    return Math.floor(entries[0].dailyRecovery / 4);
  }
  if (level >= 30) {
    return Math.floor(entries[entries.length - 1].dailyRecovery / 4);
  }
  
  // Find the two entries to interpolate between
  let lowerEntry = entries[0];
  let upperEntry = entries[entries.length - 1];
  
  for (let i = 0; i < entries.length - 1; i++) {
    if (entries[i].level <= level && entries[i + 1].level >= level) {
      lowerEntry = entries[i];
      upperEntry = entries[i + 1];
      break;
    }
  }
  
  // Linear interpolation
  const levelDiff = upperEntry.level - lowerEntry.level;
  const recoveryDiff = upperEntry.dailyRecovery - lowerEntry.dailyRecovery;
  const levelRatio = (level - lowerEntry.level) / levelDiff;
  const interpolatedDaily = lowerEntry.dailyRecovery + (recoveryDiff * levelRatio);
  
  return Math.floor(interpolatedDaily / 4); // Convert to 6-hour recovery
}