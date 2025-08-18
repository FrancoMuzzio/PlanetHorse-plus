import { CONFIG, debugLog, getConversionInfo, getNextConversion } from './config.js';
import { getConvertedPrice } from './api.js';

/**
 * Finds or waits for the balance element in the DOM
 * Uses MutationObserver if element is not immediately available
 * @returns {Promise<HTMLElement|null>} The balance element or null if not found within 5 seconds
 */
export function findBalanceElement() {
  return new Promise((resolve) => {
    // Direct attempt first
    const element = document.getElementById(CONFIG.BALANCE_ELEMENT_ID);
    if (element) {
      resolve(element);
      debugLog('Balance element found');
      return;
    }    
    // If not exists, wait with observer
    const observer = new MutationObserver(() => {
      const element = document.getElementById(CONFIG.BALANCE_ELEMENT_ID);
      if (element) {
        observer.disconnect();
        resolve(element);
        debugLog('Balance element found');
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Timeout to avoid waiting indefinitely
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
      debugLog('Balance element not found');
    }, 5000);
  });
}

/**
 * Calculates the USD value of the token balance
 * @param {string} balanceText - The balance text to parse
 * @param {number} tokenPrice - The current token price in USD
 * @returns {number} The calculated USD value
 */
function calculateConvertedPrice(balanceText, tokenPrice) {
  const balanceValue = parseFloat(balanceText) || 0;
  return balanceValue * tokenPrice;
}

/**
 * Formats a numeric price value for display
 * @param {number} value - The price value to format
 * @returns {string} The formatted price with 2 decimal places
 */
function formatPrice(value) {
  return value.toFixed(2);
}

/**
 * Finds an existing converted price element in the DOM
 * @param {HTMLElement} balanceElement - The balance element to search from
 * @returns {HTMLElement|null} The converted price element or null if not found
 */
export function findConvertedPriceElement(balanceElement) {
  const parent = balanceElement.parentNode;
  return parent ? parent.querySelector(`.${CONFIG.CSS_CLASSES.CONVERTED_PRICE}`) : null;
}

/**
 * Sets up CSS grid layout on the parent container
 * @param {HTMLElement} balanceElement - The balance element whose parent needs grid layout
 * @returns {void}
 * @precondition Parent element must have currency group class prefix
 */
export function setupGridLayout(balanceElement) {
  const parent = balanceElement.parentNode;
  if (parent && parent.className.startsWith(CONFIG.CSS_CLASSES.CURRENCY_GROUP_PREFIX)) {
    parent.style.cssText = CONFIG.CSS_STYLES.GRID_LAYOUT;
  }
}

/**
 * Creates currency selector and converted price elements for display
 * @param {HTMLElement} balanceElement - The balance element to add siblings to
 * @returns {HTMLElement} The created converted price span element
 * @postcondition Parent element will contain two new child elements
 */
export function createGridElements(balanceElement) {
  const parent = balanceElement.parentNode;
  
  // Apply text-align center to balance element
  balanceElement.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER;
  
  // Create clickeable currency selector
  const currencySelector = document.createElement('div');
  const currentConversionInfo = getConversionInfo(CONFIG.CURRENT_CONVERSION);
  currencySelector.textContent = currentConversionInfo.symbol;
  currencySelector.classList.add(CONFIG.CSS_CLASSES.CURRENCY_SELECTOR);
  currencySelector.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER + ' cursor: pointer;';
  currencySelector.title = `Click to change currency (Current: ${currentConversionInfo.displayName})`;
  
  // Add click event listener for cycling between conversions
  currencySelector.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleCurrencyChange(balanceElement);
  });
  
  // Create converted price
  const convertedPrice = document.createElement('span');
  convertedPrice.classList.add(CONFIG.CSS_CLASSES.CONVERTED_PRICE);
  convertedPrice.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER;
  
  // Append to parent (grid will auto-place them)
  parent.appendChild(currencySelector);
  parent.appendChild(convertedPrice);
  
  return convertedPrice;
}

/**
 * Main UI update function that adds or updates the converted price display
 * @param {HTMLElement} balanceElement - The balance element to enhance
 * @param {number} tokenPrice - The current token price (deprecated - using cache now)
 * @returns {void}
 * @postcondition Balance element will have sibling elements showing converted value
 */
export function addConvertedPrice(balanceElement, tokenPrice = null) {
  debugLog('💰 ADD CONVERTED PRICE START - Using conversion:', CONFIG.CURRENT_CONVERSION);
  
  try {
    // Use new conversion system
    const convertedValue = getConvertedPrice(CONFIG.CURRENT_CONVERSION, balanceElement.textContent);
    const formattedPrice = formatPrice(convertedValue);
    
    let convertedSpan = findConvertedPriceElement(balanceElement);
    if (!convertedSpan) {
      setupGridLayout(balanceElement);
      convertedSpan = createGridElements(balanceElement);
    }
    
    convertedSpan.textContent = formattedPrice;
    updateCurrencySelector(balanceElement);
    
  } catch (error) {
    debugLog('Error in addConvertedPrice:', error);
    
    // Fallback to old system if new system fails
    if (tokenPrice !== null) {
      const convertedValue = calculateConvertedPrice(balanceElement.textContent, tokenPrice);
      const formattedPrice = formatPrice(convertedValue);
      
      let convertedSpan = findConvertedPriceElement(balanceElement);
      if (!convertedSpan) {
        setupGridLayout(balanceElement);
        convertedSpan = createGridElements(balanceElement);
      }
      
      convertedSpan.textContent = formattedPrice;
    } else {
      debugLog('No fallback price available');
    }
  }
  
  debugLog('💰 ADD CONVERTED PRICE END');
}

/**
 * Handles currency selector click - cycles to next conversion
 * @param {HTMLElement} balanceElement - The balance element
 */
function handleCurrencyChange(balanceElement) {
  debugLog('🔄 CURRENCY CHANGE START');
  debugLog('📍 Current conversion before:', CONFIG.CURRENT_CONVERSION);
  
  const nextConversion = getNextConversion(CONFIG.CURRENT_CONVERSION);
  debugLog('📍 Next conversion calculated:', nextConversion);
  
  // Update current conversion
  CONFIG.CURRENT_CONVERSION = nextConversion;
  debugLog('📍 Current conversion updated to:', CONFIG.CURRENT_CONVERSION);
  
  // Update UI immediately
  addConvertedPrice(balanceElement);
  debugLog('🔄 CURRENCY CHANGE END');
}

/**
 * Updates the currency selector symbol and tooltip
 * @param {HTMLElement} balanceElement - The balance element
 */
function updateCurrencySelector(balanceElement) {
  debugLog('🎯 UPDATE SELECTOR START');
  debugLog('🎯 CONFIG.CURRENT_CONVERSION:', CONFIG.CURRENT_CONVERSION);
  
  const parent = balanceElement.parentNode;
  const selector = parent?.querySelector(`.${CONFIG.CSS_CLASSES.CURRENCY_SELECTOR}`);
  
  debugLog('🎯 Selector element found:', !!selector);
  
  if (selector) {
    const conversionInfo = getConversionInfo(CONFIG.CURRENT_CONVERSION);
    debugLog('🎯 Conversion info retrieved:', conversionInfo);
    
    debugLog('🎯 Setting symbol from', selector.textContent, 'to', conversionInfo.symbol);
    selector.textContent = conversionInfo.symbol;
    selector.title = `Click to change currency (Current: ${conversionInfo.displayName})`;
    debugLog('🎯 Selector updated - Symbol:', selector.textContent, 'Title:', selector.title);
  }
  debugLog('🎯 UPDATE SELECTOR END');
}

/**
 * Updates converted price for existing display using current conversion
 * @param {HTMLElement} balanceElement - The balance element
 */
export function updateConvertedPrice(balanceElement) {
  addConvertedPrice(balanceElement);
}
