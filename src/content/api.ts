import { CONFIG, getConversionType, debugLog, type ConversionKey } from './config.js';

// API Response Types
export interface PriceData {
  [tokenAddress: string]: {
    [currency: string]: number;
  };
}

export interface SkyMavisApiResponse {
  result: PriceData;
}

interface ChromeMessage {
  action: string;
  url: string;
  timeout: number;
}

interface ChromeResponse {
  data?: SkyMavisApiResponse;
  error?: string;
}

// Cache for all token prices to avoid multiple API calls
let cachedPriceData: SkyMavisApiResponse | null = null;

/**
 * Fetches current token price from SkyMavis API via background service worker
 * @param currency - Currency code (e.g., 'usd')
 * @returns The token price in specified currency
 * @throws {Error} Throws on timeout (15s), runtime errors, or API failures
 */
export async function fetchTokenPrice(currency: string): Promise<number> {
  // Use cached data if available
  if (cachedPriceData) {
    return cachedPriceData.result[CONFIG.PHORSE_ADDRESS][currency];
  }
  
  // Fallback to single token request for backward compatibility
  return new Promise<number>((resolve, reject) => {
    // Configure client-side timeout (15 seconds)
    const clientTimeoutId = setTimeout(() => {
      reject(new Error('Client timeout: No response received from service worker'));
    }, CONFIG.TIMEOUTS.CLIENT_TIMEOUT);

    chrome.runtime.sendMessage(
      {
        action: 'getPHPrice',
        url: `${CONFIG.API_BASE_URL}${CONFIG.PHORSE_ADDRESS}`,
        timeout: CONFIG.TIMEOUTS.SERVER_TIMEOUT
      } as ChromeMessage,
      (response: ChromeResponse) => {
        clearTimeout(clientTimeoutId);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response || response.error) {
          reject(new Error(response?.error || 'Unknown error'));
          return;
        }
        
        if (!response.data?.result?.[CONFIG.PHORSE_ADDRESS]?.[currency]) {
          reject(new Error(`Price not available for currency: ${currency}`));
          return;
        }
        
        resolve(response.data.result[CONFIG.PHORSE_ADDRESS][currency]);
      }
    );
  });
}

/**
 * Gets all token addresses needed for API request
 * @returns Array of token addresses
 */
function getAllTokenAddresses(): string[] {
  const addresses = [CONFIG.PHORSE_ADDRESS]; // PHORSE token
  
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
 * @returns Complete price data object from API
 * @throws {Error} Throws on timeout (15s), runtime errors, or API failures
 */
export async function fetchAllTokenPrices(): Promise<SkyMavisApiResponse> {
  return new Promise<SkyMavisApiResponse>((resolve, reject) => {
    const addresses = getAllTokenAddresses();
    const addressesParam = addresses.join(',');
    
    // Configure client-side timeout (15 seconds)
    const clientTimeoutId = setTimeout(() => {
      reject(new Error('Client timeout: No response received from service worker'));
    }, CONFIG.TIMEOUTS.CLIENT_TIMEOUT);

    chrome.runtime.sendMessage(
      {
        action: 'getPHPrice',
        url: `${CONFIG.API_BASE_URL}${addressesParam}`,
        timeout: CONFIG.TIMEOUTS.SERVER_TIMEOUT
      } as ChromeMessage,
      (response: ChromeResponse) => {
        clearTimeout(clientTimeoutId);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response || response.error) {
          reject(new Error(response?.error || 'Unknown error'));
          return;
        }
        
        if (!response.data) {
          reject(new Error('No data received from API'));
          return;
        }
        
        // Cache the complete response
        cachedPriceData = response.data;
        resolve(response.data);
      }
    );
  });
}

/**
 * Gets specific conversion price from cached data
 * @param conversionKey - The conversion key (e.g., 'usd', 'ron')
 * @param balance - Token balance to convert
 * @returns Converted price
 * @throws {Error} If cache is not available or conversion type is invalid
 */
export function getConvertedPrice(conversionKey: ConversionKey, balance: string | number): number {
  if (!cachedPriceData) {
    throw new Error('Price data not cached. Call fetchAllTokenPrices() first.');
  }
  
  const balanceValue = parseFloat(balance.toString()) || 0;
  const conversionType = getConversionType(conversionKey);
  
  if (conversionType === 'fiat') {
    // Direct fiat conversion
    const rate = cachedPriceData.result[CONFIG.PHORSE_ADDRESS][conversionKey];
    if (rate === undefined) {
      throw new Error(`Fiat rate not available for ${conversionKey}`);
    }
    return balanceValue * rate;
  } else if (conversionType === 'tokens') {
    // Token-to-token conversion via USD bridge rate calculation
    const phorseUsdRate = cachedPriceData.result[CONFIG.PHORSE_ADDRESS].usd;
    const tokenAddress = CONFIG.CONVERSION_TYPES.tokens[conversionKey].address;
    
    if (!tokenAddress) {
      throw new Error(`Token address not found for ${conversionKey}`);
    }
    
    const tokenUsdRate = cachedPriceData.result[tokenAddress]?.usd;
    
    if (!phorseUsdRate || !tokenUsdRate) {
      throw new Error(`Token rates not available for ${conversionKey}`);
    }
    
    return balanceValue * (phorseUsdRate / tokenUsdRate);
  }
  
  throw new Error(`Invalid conversion type for ${conversionKey}`);
}