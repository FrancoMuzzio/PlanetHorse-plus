// ============= MAIN ORCHESTRATION =============
import { CONFIG, debugLog } from './config';
import { fetchAllTokenPrices } from './api';
import { initializeConversionState } from './state';
import { 
  createCurrencyConversionUI
} from './ui';
import { 
  createSettingsModal, 
  cleanupSettingsModal 
} from './modals/settings-modal';

// Window interface extension removed - no longer needed without manual timeout management

let currencyUI: any = null;


/**
 * Cleans up existing WXT UI components
 */
function cleanupUIComponents(): void {
  debugLog('Cleaning up existing UI components...');
  
  if (currencyUI) {
    currencyUI.remove();
    currencyUI = null;
  }
  
  // Clean up settings modal components
  cleanupSettingsModal();
  
  debugLog('UI components cleaned up');
}

/**
 * Creates all UI components (DRY principle - shared between initialize and reinitialize)
 * @param ctx - WXT content script context
 */
async function createUIComponents(ctx: any): Promise<void> {
  // Check if price converter is enabled
  if (!CONFIG.FEATURES.PRICE_CONVERTER_ENABLED) {
    debugLog('Price converter is disabled - skipping UI creation');
    return;
  }
  
  // Create and auto-mount currency conversion UI component
  currencyUI = createCurrencyConversionUI(ctx);
  currencyUI.autoMount();
  debugLog('Currency conversion UI created and mounted');
  
  // Create settings modal if enabled
  if (CONFIG.FEATURES.SETTINGS_MODAL_ENABLED) {
    await createSettingsModal(ctx);
    debugLog('Settings modal created and mounted');
  }
}

/**
 * Re-initializes all UI components after SPA navigation
 * @param ctx - WXT content script context
 */
async function reinitializeComponents(ctx: any): Promise<void> {
  debugLog('Re-initializing components after SPA navigation...');
  
  // Clean up existing components first
  cleanupUIComponents();
  
  // Create all UI components using shared function
  await createUIComponents(ctx);
}


/**
 * Main initialization function for the extension
 * Loads user preferences and sets up WXT UI components with automatic SPA navigation
 */
async function initialize(ctx: any): Promise<void> {
  // Check if price converter is enabled
  if (!CONFIG.FEATURES.PRICE_CONVERTER_ENABLED) {
    debugLog('Price converter is disabled - skipping initialization');
    return;
  }

  // Load user's preferred currency first
  await initializeConversionState();
  
  try {
    // Fetch all token prices in single API call to populate cache
    await fetchAllTokenPrices();
  } catch (error) {
    debugLog('Error fetching token prices:', error);
    // Continue initialization - UI will handle connection errors
  }
  
  // Create all UI components using shared function (DRY principle)
  await createUIComponents(ctx);
  
  // Add SPA navigation detection via click events on specific buttons
  // More efficient than MutationObserver or wxt:locationchange
  document.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    
    // Check if clicked element is a navigation button
    if (target.matches('[class*="styles_buyButton__"], [class*="styles_racingButton__"]')) {
      debugLog('Navigation button clicked, scheduling component re-initialization...');
      
      // Delay re-initialization to allow SPA navigation to complete
      setTimeout(() => {
        reinitializeComponents(ctx);
      }, 200);
    }
  });
  
  debugLog('SPA navigation detection set up via button click listeners');
}

// Export initialize function for WXT entrypoint
export { initialize };