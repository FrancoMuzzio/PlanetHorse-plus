// ============= CONFIGURATION =============
const CONFIG = {
  TOKEN_ADDRESS: '0x7f8e304eb2894e57f8b930000f396319729bd1f1',
  API_BASE_URL: 'https://exchange-rate.skymavis.com/v2/prices?addresses=',
  BALANCE_ELEMENT_ID: 'phorse-balance',
  DEFAULT_CURRENCY: 'usd',
  DEBUG: false,
  
  // CSS Classes configuration
  CSS_CLASSES: {
    CONVERTED_PRICE: 'phorse-converted',
    DOLLAR_EMOJI: 'phorse-dollar-emoji',
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
function debugLog(...args) {
  if (CONFIG.DEBUG) {
    console.log('[Planet Horse Extension]', ...args);
  }
}
