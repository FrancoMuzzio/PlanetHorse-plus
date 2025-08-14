// ============= CONFIGURATION =============
const CONFIG = {
  TOKEN_ADDRESS: '0x7f8e304eb2894e57f8b930000f396319729bd1f1',
  API_BASE_URL: 'https://exchange-rate.skymavis.com/v2/prices?addresses=',
  BALANCE_ELEMENT_ID: 'phorse-balance',
  DEFAULT_CURRENCY: 'usd',
  DEBUG: false
};

// Debug logging function
function debugLog(...args) {
  if (CONFIG.DEBUG) {
    console.log('[Planet Horse Extension]', ...args);
  }
}


// Request price via background
async function fetchTokenPrice(currency) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'getPHPrice',
        url: `${CONFIG.API_BASE_URL}${CONFIG.TOKEN_ADDRESS}`
      },
      (response) => {
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

// Find balance element with observer
function findBalanceElement() {
  return new Promise((resolve) => {
    // Intento directo primero
    const element = document.getElementById(CONFIG.BALANCE_ELEMENT_ID);
    if (element) {
      resolve(element);
      debugLog('Balance element found');
      return;
    }    
    // Si no existe, esperar con observer
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

    // Timeout para evitar esperar infinitamente
    setTimeout(() => {
      observer.disconnect();
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
  return parent ? parent.querySelector('.phorse-converted') : null;
}

// Setup grid layout on parent container
function setupGridLayout(balanceElement) {
  const parent = balanceElement.parentNode;
  if (parent && parent.className.startsWith('styles_currencyGroup__')) {
    parent.style.cssText = `
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 2px 5px;
      align-items: center;
    `;
  }
}

// Create dollar emoji and converted price elements
function createGridElements(balanceElement) {
  const parent = balanceElement.parentNode;
  
  // Apply text-align center to balance element
  balanceElement.style.textAlign = 'center';
  
  // Create dollar emoji
  const dollarEmoji = document.createElement('div');
  dollarEmoji.textContent = '💲';
  dollarEmoji.classList.add('phorse-dollar-emoji');
  dollarEmoji.style.textAlign = 'center';
  
  // Create converted price
  const convertedPrice = document.createElement('span');
  convertedPrice.classList.add('phorse-converted');
  convertedPrice.style.textAlign = 'center';
  
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

// Watch balance element content changes
async function watchBalanceChanges(element) {
  const contentObserver = new MutationObserver(async () => {
    const tokenPrice = await fetchTokenPrice(CONFIG.DEFAULT_CURRENCY);
    debugLog('Token price:', tokenPrice);
    addConvertedPrice(element, tokenPrice);
  });
  
  contentObserver.observe(element, {
    childList: true,
    characterData: true,
    subtree: true
  });
}

// Initialize extension
async function initialize() {
  const tokenPrice = await fetchTokenPrice(CONFIG.DEFAULT_CURRENCY);
  debugLog('Token price:', tokenPrice);
  
  const balanceElement = await findBalanceElement();
  addConvertedPrice(balanceElement, tokenPrice);
  
  watchBalanceChanges(balanceElement);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
