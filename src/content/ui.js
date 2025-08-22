import { CONFIG, debugLog, getConversionInfo, getNextConversion, getAvailableConversions, getConversionDisplayText } from './config.js';
import { getConvertedPrice } from './api.js';
import { getCurrentConversion, setCurrentConversion } from './state.js';

// Cache for PHORSE icon elements to avoid repeated DOM queries
const iconCache = new WeakMap();

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
      return;
    }    
    // If not exists, wait with observer
    const observer = new MutationObserver(() => {
      const element = document.getElementById(CONFIG.BALANCE_ELEMENT_ID);
      if (element) {
        observer.disconnect();
        resolve(element);
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
 * Applies grid positioning styles to the PHORSE icon
 * Uses caching to avoid repeated DOM queries for performance optimization
 * @param {HTMLElement} balanceElement - The balance element whose parent contains the icon
 */
export function applyIconStyles(balanceElement) {
  const parent = balanceElement.parentNode;
  if (!parent) return;
  
  // Check cache first
  let phorseIcon = iconCache.get(parent);
  
  // If not cached, perform DOM query and cache the result
  if (phorseIcon === undefined) {
    phorseIcon = parent.querySelector('img[alt="phorse"], img[alt="phorse coin"]');
    iconCache.set(parent, phorseIcon); // Cache result (even if null)
  }
  
  if (phorseIcon) {
    phorseIcon.style.cssText += ' ' + CONFIG.CSS_STYLES.GRID_ICON;
  }
}

/**
 * Finds the balance element from a currency selector using DOM traversal
 * @param {HTMLElement} selector - The currency selector element
 * @returns {HTMLElement|null} The corresponding balance element or null
 */
export function findBalanceElementFromSelector(selector) {
  // Navigate up to parent container, then find balance element
  const parent = selector.parentNode;
  return parent ? parent.querySelector(`#${CONFIG.BALANCE_ELEMENT_ID}`) : null;
}

/**
 * Creates currency selector dropdown and converted price elements for display
 * @param {HTMLElement} balanceElement - The balance element to add siblings to
 * @returns {HTMLElement} The created converted price span element
 * @postcondition Parent element will contain two new child elements
 */
export function createGridElements(balanceElement) {
  const parent = balanceElement.parentNode;
  
  // Apply text-align center and grid positioning to balance element
  balanceElement.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER + ' ' + CONFIG.CSS_STYLES.GRID_BALANCE;
  
  // Create dropdown currency selector
  const currencySelector = document.createElement('select');
  currencySelector.classList.add(CONFIG.CSS_CLASSES.CURRENCY_SELECTOR);
  
  // Generate options for all available conversions
  const availableConversions = getAvailableConversions();
  availableConversions.forEach(conversionKey => {
    const option = document.createElement('option');
    option.value = conversionKey;
    option.textContent = getConversionDisplayText(conversionKey);
    currencySelector.appendChild(option);
  });
  
  // Set current selected value
  currencySelector.value = getCurrentConversion();
  
  // Apply dropdown styling from configuration with grid positioning
  currencySelector.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER + ' ' + CONFIG.CSS_STYLES.GRID_DROPDOWN + ' ' + CONFIG.CSS_STYLES.DROPDOWN_STYLES;
  
  // Event delegation: No individual listeners needed - handled globally in main.js
  
  // Create converted price
  const convertedPrice = document.createElement('span');
  convertedPrice.classList.add(CONFIG.CSS_CLASSES.CONVERTED_PRICE);
  convertedPrice.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER + ' ' + CONFIG.CSS_STYLES.GRID_CONVERTED;
  
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
  
  try {
    // Use new conversion system
    const convertedValue = getConvertedPrice(getCurrentConversion(), balanceElement.textContent);
    const formattedPrice = formatPrice(convertedValue);
    
    let convertedSpan = findConvertedPriceElement(balanceElement);
    if (!convertedSpan) {
      setupGridLayout(balanceElement);
      convertedSpan = createGridElements(balanceElement);
    }
    
    convertedSpan.textContent = formattedPrice;
    updateCurrencySelector(balanceElement);
    
    // Always apply icon styles to ensure consistent display
    applyIconStyles(balanceElement);
    
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
      // Always apply icon styles to ensure consistent display
      applyIconStyles(balanceElement);
    } else {
      debugLog('No fallback price available');
    }
  }
}

/**
 * Handles currency selector change - sets specific conversion
 * @param {HTMLElement} balanceElement - The balance element
 * @param {string} selectedValue - The selected conversion value from dropdown
 */
export function handleCurrencyChange(balanceElement, selectedValue) {
  // Update current conversion using state management
  setCurrentConversion(selectedValue);
  
  // Update UI immediately
  addConvertedPrice(balanceElement);
}

/**
 * Updates the currency selector dropdown value
 * @param {HTMLElement} balanceElement - The balance element
 */
function updateCurrencySelector(balanceElement) {
  const parent = balanceElement.parentNode;
  const selector = parent?.querySelector(`.${CONFIG.CSS_CLASSES.CURRENCY_SELECTOR}`);
  
  if (selector) {
    selector.value = getCurrentConversion();
  }
}

/**
 * Updates converted price for existing display using current conversion
 * @param {HTMLElement} balanceElement - The balance element
 */
export function updateConvertedPrice(balanceElement) {
  addConvertedPrice(balanceElement);
}
