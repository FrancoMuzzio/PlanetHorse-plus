// ============= MAIN ORCHESTRATION =============
import { CONFIG, debugLog } from './config';
import { fetchAllTokenPrices } from './api';
import { 
  findBalanceElement, 
  findConvertedPriceElement, 
  addConvertedPrice, 
  setupGridLayout, 
  createGridElements, 
  updateConvertedPrice, 
  findBalanceElementFromSelector, 
  handleCurrencyChange 
} from './ui';

// Extend Window interface for timeout storage
declare global {
  interface Window {
    phorseInitTimeout?: number;
  }
}

/**
 * Watches balance element for content changes and updates converted price display
 * @param element - The balance element to observe
 */
function watchBalanceChanges(element: HTMLElement): void {
  const contentObserver = new MutationObserver(() => {
    try {
      // Use cached data for immediate recalculation (no API call needed)
      updateConvertedPrice(element);
    } catch (error) {
      debugLog('Error updating converted price from cache:', error);
      // If cache fails, the error will be handled by the UI layer
    }
  });
  
  contentObserver.observe(element, {
    childList: true,
    characterData: true,
    subtree: true
  });
}

/**
 * Initializes the balance display with multi-currency conversion
 * Finds balance element, fetches all token prices, and sets up observers
 * @throws {Error} When token price fetch fails or timeout occurs
 */
async function initializeBalance(): Promise<void> {
  try {
    const balanceElement = await findBalanceElement();
    if (!balanceElement) return;
    
    // Check if already initialized to avoid infinite loop
    const existingConverted = findConvertedPriceElement(balanceElement);
    if (existingConverted) {
      // Apply icon styles to ensure consistent display
      const parent = balanceElement.parentNode as Element | null;
      if (parent) {
        const phorseIcon = parent.querySelector('img[alt="phorse"], img[alt="phorse coin"]') as HTMLImageElement | null;
        if (phorseIcon) {
          phorseIcon.style.cssText += ' ' + CONFIG.CSS_STYLES.GRID_ICON;
        }
      }
      return;
    }
    
    // Fetch all token prices in single API call
    const priceData = await fetchAllTokenPrices();
    
    addConvertedPrice(balanceElement);
    watchBalanceChanges(balanceElement);
    debugLog('Balance initialized successfully');
  } catch (error) {
    debugLog('Error initializing balance:', error);
    handleConnectionError();
  }
}

/**
 * Sets up global MutationObserver for SPA navigation
 * Monitors DOM changes to re-initialize balance display when needed
 * Includes error boundary to prevent infinite loops
 */
function setupGlobalObserver(): void {
  let errorCount = 0;
  
  const globalObserver = new MutationObserver((mutations: MutationRecord[]) => {
    try {
      // Filter out changes made by our own extension
      const hasRelevantChanges = mutations.some(mutation => {
        // Ignore changes from our own elements
        const addedNodes = Array.from(mutation.addedNodes);
        const removedNodes = Array.from(mutation.removedNodes);
        
        const isOwnExtensionChange = [...addedNodes, ...removedNodes].some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            return element.classList.contains(CONFIG.CSS_CLASSES.CONVERTED_PRICE) || 
                   element.classList.contains(CONFIG.CSS_CLASSES.CURRENCY_SELECTOR);
          }
          return false;
        });
        
        return (addedNodes.length > 0 || removedNodes.length > 0) && !isOwnExtensionChange;
      });
      
      if (hasRelevantChanges) {
        // Set up event delegation for any newly added currency group containers
        const newCurrencyContainers = mutations.reduce<Element[]>((containers, mutation) => {
          const addedNodes = Array.from(mutation.addedNodes);
          addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Check if node itself is a currency group container
              if (element.className && element.className.startsWith(CONFIG.CSS_CLASSES.CURRENCY_GROUP_PREFIX)) {
                containers.push(element);
              }
              // Check for currency group containers within added node
              const nestedContainers = element.querySelectorAll && element.querySelectorAll(`[class*="${CONFIG.CSS_CLASSES.CURRENCY_GROUP_PREFIX}"]`);
              if (nestedContainers) {
                containers.push(...Array.from(nestedContainers));
              }
            }
          });
          return containers;
        }, []);
        
        // Set up event delegation for new containers immediately
        newCurrencyContainers.forEach(container => {
          setupContainerEventDelegation(container);
        });
        
        // Debounce to avoid multiple executions
        clearTimeout(window.phorseInitTimeout);
        window.phorseInitTimeout = window.setTimeout(() => {
          initializeBalance().catch(error => {
            debugLog('Error in deferred initializeBalance:', error);
          });
        }, CONFIG.TIMEOUTS.DEBOUNCE_DELAY);
      }
      
      // Reset error count on successful execution
      errorCount = 0;
      
    } catch (error) {
      errorCount++;
      debugLog(`Error in global observer (${errorCount}/${CONFIG.LIMITS.MAX_OBSERVER_ERRORS}):`, error);
      
      // If we reach error limit, disconnect observer
      if (errorCount >= CONFIG.LIMITS.MAX_OBSERVER_ERRORS) {
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
        }, CONFIG.TIMEOUTS.RECONNECT_DELAY);
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
 * Handles connection errors by displaying user feedback and retrying
 * Shows temporary error message and attempts retry after 5 seconds
 */
function handleConnectionError(): void {
  const balanceElement = document.getElementById(CONFIG.BALANCE_ELEMENT_ID);
  if (!balanceElement) return;
  
  let errorSpan = findConvertedPriceElement(balanceElement);
  if (!errorSpan) {
    setupGridLayout(balanceElement);
    errorSpan = createGridElements(balanceElement);
  }
  
  // Show temporary error message
  errorSpan.textContent = '❌ Error';
  errorSpan.style.color = '#ff6b6b';
  
  // Retry after configured delay
  setTimeout(async () => {
    try {
      await fetchAllTokenPrices();
      addConvertedPrice(balanceElement);
      errorSpan!.style.color = ''; // Restore original color
    } catch (retryError) {
      debugLog('Retry failed:', retryError);
      errorSpan!.textContent = '❌ Error';
    }
  }, CONFIG.TIMEOUTS.RETRY_DELAY);
}

/**
 * Sets up event delegation for currency selector changes within specific containers
 * Attaches listeners to currency group containers for better performance
 * @param container - The currency group container to attach listener to
 */
function setupContainerEventDelegation(container: Element): void {
  // Avoid duplicate listeners
  if (container.hasAttribute('data-phorse-listener')) {
    return;
  }
  
  container.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLElement;
    // Check if the changed element is a currency selector
    if (target && target.matches(`.${CONFIG.CSS_CLASSES.CURRENCY_SELECTOR}`)) {
      e.preventDefault();
      e.stopPropagation();
      
      // Find the associated balance element
      const balanceElement = findBalanceElementFromSelector(target);
      if (balanceElement && 'value' in target) {
        handleCurrencyChange(balanceElement, (target as HTMLSelectElement).value);
      }
    }
  });
  
  // Mark container as having listener to avoid duplicates
  container.setAttribute('data-phorse-listener', 'true');
}

/**
 * Sets up scoped event delegation for currency selector changes
 * Finds all currency group containers and attaches targeted listeners (optimized approach)
 */
function setupGlobalEventDelegation(): void {
  // Find all existing currency group containers
  const currencyContainers = document.querySelectorAll(`[class*="${CONFIG.CSS_CLASSES.CURRENCY_GROUP_PREFIX}"]`);
  
  currencyContainers.forEach(container => {
    setupContainerEventDelegation(container);
  });
}

/**
 * Main initialization function for the extension
 * Initializes balance display and sets up global observer + event delegation
 */
async function initialize(): Promise<void> {
  await initializeBalance();
  setupGlobalObserver();
  setupGlobalEventDelegation();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}