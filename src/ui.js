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
