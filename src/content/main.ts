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
  analyzeHorses, 
  initializeHorseAnalyzer, 
  getHorses,
  cleanupMarketplaceButtons, 
  cleanupEnergyRecoveryInfo, 
  cleanupTooltips 
} from './utils/horse-analyzer';
import { addMarketplaceButtons } from './utils/marketplace-buttons';
import { addEnergyRecoveryInfo } from './utils/energy-recovery';

// Window interface extension removed - no longer needed without manual timeout management

let currencyUI: any = null;
let wxtContext: any = null;

/**
 * Runs horse analyzer with smart retry logic that stops once horses are found
 * @param settings - Application settings (optional, will load if not provided)
 */
async function runHorseAnalyzerWithRetry(settings?: AllSettings): Promise<void> {
  // Load settings if not provided
  if (!settings) {
    settings = await loadAllSettings();
  }
  
  // Use smart retry logic that stops once horses are found
  let foundHorses = false;
  const retryDelays = [100, 500, 1000, 2000];
  
  // Add long retries for wallet detection (2s x 300 = 10 minutes)
  for (let i = 0; i < 300; i++) {
    retryDelays.push(2000);
  }
  
  const timeoutIds: NodeJS.Timeout[] = [];
  
  retryDelays.forEach((delay, index) => {
    const timeoutId = setTimeout(async () => {
      // Skip if horses were already found in a previous attempt
      if (foundHorses) {
        return;
      }
      
      analyzeHorses();
      
      // Check if horses were found after analysis
      const horseElements = document.querySelectorAll('[class*="styles_singleHorse__"]');
      if (horseElements.length > 0) {
        foundHorses = true;
        
        // Check if this is a reconnection scenario
        const isReconnecting = getIsReconnecting();
        const hasBeenAuthenticated = getHasBeenAuthenticated();
        
        // Handle first-time authentication
        if (!hasBeenAuthenticated && wxtContext) {
          setHasBeenAuthenticated(true);
          debugLog('Wallet authenticated - adding horse features without full reinit');
          // Don't reinitialize components - just add the horse-specific features
        }
        
        // Handle reconnection scenario  
        if (isReconnecting) {
          setIsReconnecting(false); // Clear the reconnection flag
          debugLog('Reconnection detected - restarting horse features');
        }
        
        // Cancel remaining timeouts since we found horses
        timeoutIds.slice(index + 1).forEach(id => clearTimeout(id));
        
        // Add marketplace buttons and energy recovery info after successful analysis
        setTimeout(async () => {
          const horses = await getHorses();
          await addMarketplaceButtons(horses);
          
          // Only add energy recovery info if enabled in settings
          if (settings!.energyRecoveryEnabled) {
            await addEnergyRecoveryInfo(horses);
          }
        }, 100);
      }
    }, delay);
    
    timeoutIds.push(timeoutId);
  });
}

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
 * Re-initializes all UI components after SPA navigation
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
    // Clean up existing components first
    cleanupUIComponents();
    
    // Load all settings once for efficiency
    const settings = await loadAllSettings();
    
    // Create all UI components using shared function
    await createUIComponents(ctx, settings);
    
    // Run horse analyzer (always enabled)
    runHorseAnalyzerWithRetry(settings);
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
    
    // Run horse analyzer (always enabled)
    runHorseAnalyzerWithRetry(settings);
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
/**
 * Restarts the horse analyzer retry loop
 * Called when user reconnection is detected
 */
export function restartHorseAnalyzer(): void {
  // Only restart if not currently reconnecting to avoid duplicates
  if (!getIsReconnecting()) {
    debugLog('Manually restarting horse analyzer');
    runHorseAnalyzerWithRetry();
  }
}

// Export initialize function for WXT entrypoint
export { initialize };