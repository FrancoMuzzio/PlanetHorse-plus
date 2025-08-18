import { CONFIG, getConversionType, debugLog } from './config.js';

// Cache for all token prices to avoid multiple API calls
let cachedPriceData = null;

/**
 * Fetches current token price from SkyMavis API via background service worker
 * @async
 * @param {string} currency - Currency code (e.g., 'usd')
 * @returns {Promise<number>} The token price in specified currency
 * @throws {Error} Throws on timeout (15s), runtime errors, or API failures
 */
export async function fetchTokenPrice(currency) {
  // Use cached data if available
  if (cachedPriceData) {
    debugLog('Using cached price data for', currency);
    return cachedPriceData.result[CONFIG.TOKEN_ADDRESS][currency];
  }
  
  // Fallback to single token request for backward compatibility
  return new Promise((resolve, reject) => {
    // Configurar timeout del lado del cliente (15 segundos)
    const clientTimeoutId = setTimeout(() => {
      reject(new Error('Client timeout: No se recibió respuesta del service worker'));
    }, 15000); // 15 segundos (más que el timeout del fetch para dar margen)

    chrome.runtime.sendMessage(
      {
        action: 'getPHPrice',
        url: `${CONFIG.API_BASE_URL}${CONFIG.TOKEN_ADDRESS}`
      },
      (response) => {
        clearTimeout(clientTimeoutId);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response || response.error) {
          reject(new Error(response?.error || 'Unknown error'));
          return;
        }
        resolve(response.data.result[CONFIG.TOKEN_ADDRESS][currency]);
      }
    );
  });
}

/**
 * Gets all token addresses needed for API request
 * @returns {string[]} Array of token addresses
 */
function getAllTokenAddresses() {
  const addresses = [CONFIG.TOKEN_ADDRESS]; // PHORSE token
  
  // Add all token addresses from configuration
  Object.values(CONFIG.CONVERSION_TYPES.tokens).forEach(token => {
    if (token.address && !addresses.includes(token.address)) {
      addresses.push(token.address);
    }
  });
  
  return addresses;
}

/**
 * Fetches all token prices from SkyMavis API via background service worker
 * @async
 * @returns {Promise<Object>} Complete price data object from API
 * @throws {Error} Throws on timeout (15s), runtime errors, or API failures
 */
export async function fetchAllTokenPrices() {
  return new Promise((resolve, reject) => {
    const addresses = getAllTokenAddresses();
    const addressesParam = addresses.join(',');
    
    debugLog('Fetching prices for addresses:', addresses);
    
    // Configurar timeout del lado del cliente (15 segundos)
    const clientTimeoutId = setTimeout(() => {
      reject(new Error('Client timeout: No se recibió respuesta del service worker'));
    }, 15000);

    chrome.runtime.sendMessage(
      {
        action: 'getPHPrice',
        url: `${CONFIG.API_BASE_URL}${addressesParam}`
      },
      (response) => {
        clearTimeout(clientTimeoutId);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response || response.error) {
          reject(new Error(response?.error || 'Unknown error'));
          return;
        }
        
        // Cache the complete response
        cachedPriceData = response.data;
        debugLog('Cached price data:', cachedPriceData);
        
        resolve(response.data);
      }
    );
  });
}

/**
 * Gets specific conversion price from cached data
 * @param {string} conversionKey - The conversion key (e.g., 'usd', 'ron')
 * @param {number} balance - Token balance to convert
 * @returns {number} Converted price
 * @throws {Error} If cache is not available or conversion type is invalid
 */
export function getConvertedPrice(conversionKey, balance) {
  if (!cachedPriceData) {
    throw new Error('Price data not cached. Call fetchAllTokenPrices() first.');
  }
  
  const balanceValue = parseFloat(balance) || 0;
  const conversionType = getConversionType(conversionKey);
  
  if (conversionType === 'fiat') {
    // Direct fiat conversion
    const rate = cachedPriceData.result[CONFIG.TOKEN_ADDRESS][conversionKey];
    if (rate === undefined) {
      throw new Error(`Fiat rate not available for ${conversionKey}`);
    }
    return balanceValue * rate;
  } else if (conversionType === 'tokens') {
    // Token-to-token conversion via USD
    const phorseUsdRate = cachedPriceData.result[CONFIG.TOKEN_ADDRESS].usd;
    const tokenAddress = CONFIG.CONVERSION_TYPES.tokens[conversionKey].address;
    const tokenUsdRate = cachedPriceData.result[tokenAddress]?.usd;
    
    if (!phorseUsdRate || !tokenUsdRate) {
      throw new Error(`Token rates not available for ${conversionKey}`);
    }
    
    return balanceValue * (phorseUsdRate / tokenUsdRate);
  }
  
  throw new Error(`Invalid conversion type for ${conversionKey}`);
}
