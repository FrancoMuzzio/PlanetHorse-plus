// ============= MAIN ORCHESTRATION =============

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

// Initialize balance display
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
    debugLog('Error initializing balance:', error);
  }
}

// Setup global observer for SPA navigation with error boundary
function setupGlobalObserver() {
  let errorCount = 0;
  const MAX_ERRORS = 5; // Prevenir loops infinitos de errores
  
  const globalObserver = new MutationObserver((mutations) => {
    try {
      // Filter out changes made by our own extension
      const hasRelevantChanges = mutations.some(mutation => {
        // Ignore changes from our own elements
        const addedNodes = Array.from(mutation.addedNodes);
        const removedNodes = Array.from(mutation.removedNodes);
        
        const isOwnExtensionChange = [...addedNodes, ...removedNodes].some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            return node.classList.contains('phorse-converted') || 
                   node.classList.contains('phorse-dollar-emoji');
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
      
      // Si alcanzamos el límite de errores, desconectar el observer
      if (errorCount >= MAX_ERRORS) {
        globalObserver.disconnect();
        debugLog('Global observer disconnected due to repeated errors');
        
        // Opcionalmente, intentar reconectar después de un tiempo
        setTimeout(() => {
          debugLog('Attempting to reconnect global observer...');
          errorCount = 0;
          globalObserver.observe(document.body, {
            childList: true,
            subtree: true
          });
        }, 30000); // Reintentar después de 30 segundos
      }
    }
  });

  globalObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  debugLog('Global observer setup complete');
}

// Initialize extension
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
