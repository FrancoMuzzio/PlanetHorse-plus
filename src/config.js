// ============= CONFIGURATION =============
const CONFIG = {
  TOKEN_ADDRESS: '0x7f8e304eb2894e57f8b930000f396319729bd1f1',
  API_BASE_URL: 'https://exchange-rate.skymavis.com/v2/prices?addresses=',
  BALANCE_ELEMENT_ID: 'phorse-balance',
  DEFAULT_CURRENCY: 'usd',
  DEBUG: true
};

// Debug logging function
function debugLog(...args) {
  if (CONFIG.DEBUG) {
    console.log('[Planet Horse Extension]', ...args);
  }
}
