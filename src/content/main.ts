// ============= MAIN ORCHESTRATION =============
import { CONFIG, debugLog } from './config';
import { fetchAllTokenPrices } from './api';
import { 
  initializeConversionState, 
  ensureCurrentConversionIsEnabled,
  getIsInitializing,
  setIsInitializing,
  getIsReconnecting,
  setIsReconnecting,
  getHasBeenAuthenticated,
  setHasBeenAuthenticated
} from './state';
import { 
  createCurrencyConversionUI
} from './ui';
import { 
  createSettingsModal, 
  cleanupSettingsModal 
} from './modals/settings-modal';
import { loadAllSettings, type AllSettings } from './storage';
import { 
  initializeHorseAnalyzer, 
  cleanupMarketplaceButtons, 
  cleanupEnergyRecoveryInfo, 
  cleanupTooltips 
} from './utils/horse-analyzer';
import { 
  initializeHorseObserver, 
  updateObserverSettings, 
  stopHorseObserver 
} from './utils/horse-observer';

// Window interface extension removed - no longer needed without manual timeout management

let currencyUI: any = null;
let wxtContext: any = null;


/**
 * Cleans up existing WXT UI components
 */
function cleanupUIComponents(): void {
  if (currencyUI) {
    currencyUI.remove();
    currencyUI = null;
  }
  
  // Clean up settings modal components
  cleanupSettingsModal();
  
  // Clean up marketplace buttons and energy recovery info
  cleanupMarketplaceButtons();
  cleanupEnergyRecoveryInfo();
  
  // Stop observer if needed
  stopHorseObserver();
}

/**
 * Creates all UI components (DRY principle - shared between initialize and reinitialize)
 * @param ctx - WXT content script context
 * @param settings - All application settings (optional, will load if not provided)
 */
async function createUIComponents(ctx: any, settings?: AllSettings): Promise<void> {
  // Load settings if not provided
  if (!settings) {
    settings = await loadAllSettings();
  }
  
  // Create settings modal first (always needed to change settings)
  await createSettingsModal(ctx);
  
  // Create currency conversion UI only if enabled
  if (settings.converterEnabled) {
    currencyUI = createCurrencyConversionUI(ctx);
    currencyUI.autoMount();
  } else {
    debugLog('Price converter is disabled via settings');
  }
}

/**
 * Re-initializes UI components after settings change or navigation
 * @param ctx - WXT content script context
 */
async function reinitializeComponents(ctx: any): Promise<void> {
  // Prevent simultaneous reinitializations
  if (getIsInitializing()) {
    debugLog('Extension currently initializing - skipping reinit');
    return;
  }
  
  setIsInitializing(true);
  
  try {
    // Clean up currency UI components only
    if (currencyUI) {
      currencyUI.remove();
      currencyUI = null;
    }
    
    // Load all settings once for efficiency
    const settings = await loadAllSettings();
    
    // Recreate currency UI if needed
    if (settings.converterEnabled) {
      currencyUI = createCurrencyConversionUI(ctx);
      currencyUI.autoMount();
    }
    
    // Update observer settings (it will handle the new settings)
    await updateObserverSettings();
    
    debugLog('Components reinitialized with new settings');
  } finally {
    setIsInitializing(false);
  }
}


/**
 * Main initialization function for the extension
 * Loads user preferences and sets up WXT UI components with automatic SPA navigation
 */
async function initialize(ctx: any): Promise<void> {
  // Prevent multiple simultaneous initializations
  if (getIsInitializing()) {
    debugLog('Extension already initializing - skipping duplicate initialization');
    return;
  }
  
  setIsInitializing(true);
  
  try {
    // Store context for later use
    wxtContext = ctx;
    
    // Load user's preferred currency first (always needed for state)
    await initializeConversionState();
    
    // Load all settings once for efficiency
    const settings = await loadAllSettings();
    
    // Initialize horse analyzer and load persisted data (always enabled)
    await initializeHorseAnalyzer();
    
    try {
      // Fetch all token prices in single API call to populate cache
      await fetchAllTokenPrices();
    } catch (error) {
      debugLog('Error fetching token prices:', error);
      // Continue initialization - UI will handle connection errors
    }
    
    // Create all UI components using shared function (DRY principle)
    await createUIComponents(ctx, settings);
    
    // Initialize the permanent horse observer
    await initializeHorseObserver();
  } finally {
    setIsInitializing(false);
  }
  
  // Add SPA navigation detection via click events on specific buttons
  // More efficient than MutationObserver or wxt:locationchange
  document.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    
    // Check if clicked element is a navigation button
    if (target.matches('[class*="styles_buyButton__"], [class*="styles_racingButton__"]')) {
      // Delay re-initialization to allow SPA navigation to complete
      setTimeout(() => {
        reinitializeComponents(ctx);
      }, 200);
    }
  });
  
  // Add settings change detection for immediate application
  document.addEventListener('phorseSettingsChanged', async (e: Event) => {
    const customEvent = e as CustomEvent;
    debugLog('Settings changed event received:', customEvent.detail);
    
    // Ensure current conversion is still enabled after settings change
    await ensureCurrentConversionIsEnabled();
    
    // Reinitialize components to apply new settings
    await reinitializeComponents(ctx);
  });
  
}

/**
 * Applies settings changes immediately without page refresh
 * Called from settings modal after saving
 * @param ctx - WXT content script context
 */
export async function applySettingsChanges(ctx: any): Promise<void> {
  await reinitializeComponents(ctx);
}

// Export initialize function for WXT entrypoint
export { initialize };