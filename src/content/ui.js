/**
 * Finds or waits for the balance element in the DOM
 * Uses MutationObserver if element is not immediately available
 * @returns {Promise<HTMLElement|null>} The balance element or null if not found within 5 seconds
 */
function findBalanceElement() {
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
function findConvertedPriceElement(balanceElement) {
  const parent = balanceElement.parentNode;
  return parent ? parent.querySelector(`.${CONFIG.CSS_CLASSES.CONVERTED_PRICE}`) : null;
}

/**
 * Sets up CSS grid layout on the parent container
 * @param {HTMLElement} balanceElement - The balance element whose parent needs grid layout
 * @returns {void}
 * @precondition Parent element must have currency group class prefix
 */
function setupGridLayout(balanceElement) {
  const parent = balanceElement.parentNode;
  if (parent && parent.className.startsWith(CONFIG.CSS_CLASSES.CURRENCY_GROUP_PREFIX)) {
    parent.style.cssText = CONFIG.CSS_STYLES.GRID_LAYOUT;
  }
}

/**
 * Creates dollar emoji and converted price elements for display
 * @param {HTMLElement} balanceElement - The balance element to add siblings to
 * @returns {HTMLElement} The created converted price span element
 * @postcondition Parent element will contain two new child elements
 */
function createGridElements(balanceElement) {
  const parent = balanceElement.parentNode;
  
  // Apply text-align center to balance element
  balanceElement.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER;
  
  // Create dollar emoji
  const dollarEmoji = document.createElement('div');
  dollarEmoji.textContent = '💲';
  dollarEmoji.classList.add(CONFIG.CSS_CLASSES.DOLLAR_EMOJI);
  dollarEmoji.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER;
  
  // Create converted price
  const convertedPrice = document.createElement('span');
  convertedPrice.classList.add(CONFIG.CSS_CLASSES.CONVERTED_PRICE);
  convertedPrice.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER;
  
  // Append to parent (grid will auto-place them)
  parent.appendChild(dollarEmoji);
  parent.appendChild(convertedPrice);
  
  return convertedPrice;
}

/**
 * Main UI update function that adds or updates the converted price display
 * @param {HTMLElement} balanceElement - The balance element to enhance
 * @param {number} tokenPrice - The current token price in USD
 * @returns {void}
 * @postcondition Balance element will have sibling elements showing USD value
 */
function addConvertedPrice(balanceElement, tokenPrice) {
  const convertedValue = calculateConvertedPrice(balanceElement.textContent, tokenPrice);
  const formattedPrice = formatPrice(convertedValue);
  
  let convertedSpan = findConvertedPriceElement(balanceElement);
  if (!convertedSpan) {
    setupGridLayout(balanceElement);
    convertedSpan = createGridElements(balanceElement);
  }
  
  convertedSpan.textContent = formattedPrice;
}
