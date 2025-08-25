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

// fetchTokenPrice function removed - use fetchAllTokenPrices() instead

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
 * @throws {Error} Throws on timeout (10s), runtime errors, or API failures
 */
export async function fetchAllTokenPrices(): Promise<SkyMavisApiResponse> {
  return new Promise<SkyMavisApiResponse>((resolve, reject) => {
    const addresses = getAllTokenAddresses();
    const addressesParam = addresses.join(',');
    
    // Single timeout (10 seconds)
    const timeoutId = setTimeout(() => {
      reject(new Error('Connection failed'));
    }, 10000);

    chrome.runtime.sendMessage(
      {
        action: 'getPHPrice',
        url: `${CONFIG.API_BASE_URL}${addressesParam}`,
        timeout: 10000
      } as ChromeMessage,
      (response: ChromeResponse) => {
        clearTimeout(timeoutId);
        
        if (chrome.runtime.lastError || !response || response.error || !response.data) {
          reject(new Error('Connection failed'));
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