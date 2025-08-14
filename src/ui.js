// Find balance element with observer
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

// Calculate converted price value
function calculateConvertedPrice(balanceText, tokenPrice) {
  const balanceValue = parseFloat(balanceText) || 0;
  return balanceValue * tokenPrice;
}

// Format price for display
function formatPrice(value) {
  return value.toFixed(2);
}

// Find existing converted price element
function findConvertedPriceElement(balanceElement) {
  const parent = balanceElement.parentNode;
  return parent ? parent.querySelector(`.${CONFIG.CSS_CLASSES.CONVERTED_PRICE}`) : null;
}

// Setup grid layout on parent container
function setupGridLayout(balanceElement) {
  const parent = balanceElement.parentNode;
  if (parent && parent.className.startsWith(CONFIG.CSS_CLASSES.CURRENCY_GROUP_PREFIX)) {
    parent.style.cssText = CONFIG.CSS_STYLES.GRID_LAYOUT;
  }
}

// Create dollar emoji and converted price elements
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

// Main function: Add converted price below balance
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
