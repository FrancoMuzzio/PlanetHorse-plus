// ============= MAIN ORCHESTRATION =============
import { CONFIG, debugLog, findElementByClassPrefix } from './config';
import { fetchAllTokenPrices } from './api';
import { initializeConversionState } from './state';
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
import { createIntegratedUi } from 'wxt/utils/content-script-ui/integrated';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';

// Extend Window interface for timeout storage
declare global {
  interface Window {
    phorseInitTimeout?: number;
  }
}

let modalUI: any = null;

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
  // Check if price converter is enabled
  if (!CONFIG.FEATURES.PRICE_CONVERTER_ENABLED) {
    debugLog('Price converter is disabled - skipping initialization');
    return;
  }
  
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
 * Creates settings button UI using WXT native utilities
 * @param ctx - WXT content script context
 */
async function createSettingsUI(ctx: any): Promise<void> {
  if (!CONFIG.FEATURES.SETTINGS_MODAL_ENABLED) {
    debugLog('Settings modal is disabled');
    return;
  }

  // Create modal UI first
  modalUI = await createShadowRootUi(ctx, {
    name: 'phorse-settings-modal',
    position: 'modal',
    zIndex: 9999,
    onMount: (container) => {
      // Apply modal container styles for centering
      container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: none !important;
      `;

      // Add click-to-close on backdrop
      container.addEventListener('click', (e) => {
        if (e.target === container && modalUI) {
          modalUI.remove();
        }
      });

      // Create modal content wrapper
      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: #582c25;
        border: 3px solid #8b4513;
        border-radius: 8px;
        min-width: 400px;
        max-width: 500px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        cursor: none !important;
      `;

      // Create modal header
      const header = document.createElement('div');
      header.style.cssText = 'padding: 15px 20px; border-bottom: 2px solid #8b4513; font-size: 18px; font-weight: bold; background: #582c25; color: white; font-family: "SpaceHorse", system-ui, -apple-system, sans-serif; display: flex; justify-content: space-between; align-items: center; cursor: none !important;';
      
      const titleSpan = document.createElement('span');
      titleSpan.textContent = 'Settings';
      header.appendChild(titleSpan);

      // Create close button using page's close icon
      const closeButton = document.createElement('button');
      closeButton.style.cssText = 'cursor: none !important; background: transparent; border: none; padding: 4px; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; position: relative;';
      closeButton.title = 'Cerrar';
      
      // Create close icon image
      const closeIcon = document.createElement('img');
      closeIcon.alt = 'Close';
      closeIcon.src = '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffechar.6bf40c51.png&w=64&q=75';
      closeIcon.style.cssText = 'position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%; cursor: none !important;';
      closeIcon.setAttribute('decoding', 'async');
      closeIcon.setAttribute('data-nimg', 'intrinsic');
      
      // Add close functionality
      closeButton.addEventListener('click', () => {
        if (modalUI) {
          modalUI.remove();
        }
      });
      
      // Add hover effects
      closeButton.addEventListener('mouseenter', () => {
        closeButton.style.opacity = '0.7';
      });
      
      closeButton.addEventListener('mouseleave', () => {
        closeButton.style.opacity = '1';
      });
      
      closeButton.appendChild(closeIcon);
      header.appendChild(closeButton);

      // Create modal body
      const body = document.createElement('div');
      body.style.cssText = 'padding: 20px; min-height: 100px; background: #582c25; color: white; font-family: "SpaceHorse", system-ui, -apple-system, sans-serif; border-radius: 0 0 8px 8px; cursor: none !important;';
      body.textContent = 'Modal content will be added here...';

      // Assemble modal
      modalContent.appendChild(header);
      modalContent.appendChild(body);
      container.appendChild(modalContent);
      
      debugLog('Modal UI mounted');
    }
  });

  // Create button UI
  const buttonUI = createIntegratedUi(ctx, {
    position: 'inline',
    anchor: `[class*="${CONFIG.CSS_CLASSES.ACTION_OPTIONS_PREFIX}"]`,
    onMount: (container) => {
      // Simple container reset
      container.style.cssText = 'background: transparent !important; border: none !important; padding: 0 !important; margin: 0 !important;';
      
      const button = document.createElement('div');
      button.style.cssText = CONFIG.CSS_STYLES.SETTINGS_BUTTON_STYLES;
      button.title = 'Planet Horse Extension Settings';
      
      // Load external gear SVG icon
      const gearIcon = document.createElement('img');
      const svgUrl = chrome.runtime.getURL('icons/setting-gear.svg');
      gearIcon.src = svgUrl;
      gearIcon.style.cssText = 'width: 24px; height: 24px; pointer-events: none;';
      gearIcon.alt = 'Settings';
      
      button.appendChild(gearIcon);
      
      // Add click event listener
      button.addEventListener('click', () => {
        if (modalUI) {
          modalUI.mount();
        }
      });
      
      // Add hover effects for gear icon
      button.addEventListener('mouseenter', () => {
        button.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
        button.style.setProperty('cursor', 'none', 'important');
        
        // Apply brightness filter for visual feedback
        gearIcon.style.setProperty('filter', 'brightness(1.2)', 'important');
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.setProperty('background-color', 'transparent', 'important');
        button.style.setProperty('cursor', 'none', 'important');
        
        // Restore original brightness
        gearIcon.style.setProperty('filter', 'brightness(1)', 'important');
      });
      
      container.appendChild(button);
      debugLog('Settings button mounted');
    }
  });

  // Auto-mount button - WXT handles SPA navigation automatically
  buttonUI.autoMount();
}

/**
 * Main initialization function for the extension
 * Loads user preferences, initializes balance display and sets up global observer + event delegation
 */
async function initialize(ctx: any): Promise<void> {
  // Load user's preferred currency first
  await initializeConversionState();
  
  await initializeBalance();
  await createSettingsUI(ctx);
  
  setupGlobalObserver();
  setupGlobalEventDelegation();
}

// Export initialize function for WXT entrypoint
export { initialize };