// ============= MAIN ORCHESTRATION =============

/**
 * Watches balance element for content changes and updates USD price display
 * @async
 * @param {HTMLElement} element - The balance element to observe
 * @returns {void}
 */
async function watchBalanceChanges(element) {
  const contentObserver = new MutationObserver(async () => {
    try {
      const tokenPrice = await fetchTokenPrice(CONFIG.DEFAULT_CURRENCY);
      debugLog('Token price:', tokenPrice);
      addConvertedPrice(element, tokenPrice);
    } catch (error) {
      // Manejar específicamente errores de timeout
      if (error.message.includes('timeout') || error.message.includes('Request timeout') || error.message.includes('Client timeout')) {
        debugLog('Timeout error during watch:', error.message);
        handleTimeoutError();
      } else {
        debugLog('Error fetching token price:', error);
      }
    }
  });
  
  contentObserver.observe(element, {
    childList: true,
    characterData: true,
    subtree: true
  });
}

/**
 * Initializes the balance display with USD conversion
 * Finds balance element, fetches token price, and sets up observers
 * @async
 * @returns {Promise<void>}
 * @throws {Error} When token price fetch fails or timeout occurs
 */
async function initializeBalance() {
  try {
    const balanceElement = await findBalanceElement();
    if (!balanceElement) return;
    
    // Check if already initialized to avoid infinite loop
    const existingConverted = findConvertedPriceElement(balanceElement);
    if (existingConverted) {
      debugLog('Balance already initialized, skipping');
      return;
    }
    
    const tokenPrice = await fetchTokenPrice(CONFIG.DEFAULT_CURRENCY);
    debugLog('Token price:', tokenPrice);
    
    addConvertedPrice(balanceElement, tokenPrice);
    watchBalanceChanges(balanceElement);
    debugLog('Balance initialized successfully');
  } catch (error) {
    // Manejar específicamente errores de timeout
    if (error.message.includes('timeout') || error.message.includes('Request timeout') || error.message.includes('Client timeout')) {
      debugLog('Timeout error:', error.message);
      handleTimeoutError();
    } else {
      debugLog('Error initializing balance:', error);
    }
  }
}

/**
 * Sets up global MutationObserver for SPA navigation
 * Monitors DOM changes to re-initialize balance display when needed
 * Includes error boundary to prevent infinite loops
 * @returns {void}
 */
function setupGlobalObserver() {
  let errorCount = 0;
  const MAX_ERRORS = 5; // Prevent infinite error loops
  
  const globalObserver = new MutationObserver((mutations) => {
    try {
      // Filter out changes made by our own extension
      const hasRelevantChanges = mutations.some(mutation => {
        // Ignore changes from our own elements
        const addedNodes = Array.from(mutation.addedNodes);
        const removedNodes = Array.from(mutation.removedNodes);
        
        const isOwnExtensionChange = [...addedNodes, ...removedNodes].some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            return node.classList.contains(CONFIG.CSS_CLASSES.CONVERTED_PRICE) || 
                   node.classList.contains(CONFIG.CSS_CLASSES.DOLLAR_EMOJI);
          }
          return false;
        });
        
        return (addedNodes.length > 0 || removedNodes.length > 0) && !isOwnExtensionChange;
      });
      
      if (hasRelevantChanges) {
        // Debounce to avoid multiple executions
        clearTimeout(window.phorseInitTimeout);
        window.phorseInitTimeout = setTimeout(() => {
          initializeBalance().catch(error => {
            debugLog('Error in deferred initializeBalance:', error);
          });
        }, 500);
      }
      
      // Reset error count on successful execution
      errorCount = 0;
      
    } catch (error) {
      errorCount++;
      debugLog(`Error in global observer (${errorCount}/${MAX_ERRORS}):`, error);
      
      // If we reach error limit, disconnect observer
      if (errorCount >= MAX_ERRORS) {
        globalObserver.disconnect();
        debugLog('Global observer disconnected due to repeated errors');
        
        // Optionally, try to reconnect after some time
        setTimeout(() => {
          debugLog('Attempting to reconnect global observer...');
          errorCount = 0;
          globalObserver.observe(document.body, {
            childList: true,
            subtree: true
          });
        }, 30000); // Retry after 30 seconds
      }
    }
  });

  globalObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  debugLog('Global observer setup complete');
}

/**
 * Handles timeout errors by displaying user feedback and retrying
 * Shows temporary error message and attempts retry after 5 seconds
 * @returns {void}
 */
function handleTimeoutError() {
  // Buscar el elemento de precio convertido o el balance para mostrar el error
  const balanceElement = document.getElementById(CONFIG.BALANCE_ELEMENT_ID);
  if (!balanceElement) return;
  
  let errorSpan = findConvertedPriceElement(balanceElement);
  if (!errorSpan) {
    // Si no existe, crear el elemento para mostrar el error
    setupGridLayout(balanceElement);
    errorSpan = createGridElements(balanceElement);
  }
  
  // Mostrar mensaje de error temporal
  const originalContent = errorSpan.textContent;
  errorSpan.textContent = '⏱️ Timeout';
  errorSpan.style.color = '#ff6b6b';
  
  // Reintentar después de 5 segundos
  setTimeout(async () => {
    try {
      const tokenPrice = await fetchTokenPrice(CONFIG.DEFAULT_CURRENCY);
      addConvertedPrice(balanceElement, tokenPrice);
      errorSpan.style.color = ''; // Restaurar color original
    } catch (retryError) {
      debugLog('Retry failed:', retryError);
      errorSpan.textContent = '❌ Error';
    }
  }, 5000);
}

/**
 * Main initialization function for the extension
 * Initializes balance display and sets up global observer
 * @async
 * @returns {Promise<void>}
 */
async function initialize() {
  await initializeBalance();
  setupGlobalObserver();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
