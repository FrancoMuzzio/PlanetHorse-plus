// ============= MAIN ORCHESTRATION =============
import { CONFIG, debugLog } from './config';
import { fetchAllTokenPrices } from './api';
import { initializeConversionState, ensureCurrentConversionIsEnabled } from './state';
import { 
  createCurrencyConversionUI
} from './ui';
import { 
  createSettingsModal, 
  cleanupSettingsModal 
} from './modals/settings-modal';
import { loadAllSettings, type AllSettings } from './storage';
import { analyzeHorses, initializeHorseAnalyzer, addMarketplaceButtons, cleanupMarketplaceButtons, addEnergyRecoveryInfo, cleanupEnergyRecoveryInfo } from './utils/horse-analyzer';

// Window interface extension removed - no longer needed without manual timeout management

let currencyUI: any = null;

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
        
        // Cancel remaining timeouts since we found horses
        timeoutIds.slice(index + 1).forEach(id => clearTimeout(id));
        
        // Add marketplace buttons and energy recovery info after successful analysis
        setTimeout(async () => {
          addMarketplaceButtons();
          
          // Only add energy recovery info if enabled in settings
          if (settings!.energyRecoveryEnabled) {
            addEnergyRecoveryInfo();
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
  debugLog('Cleaning up existing UI components...');
  
  if (currencyUI) {
    currencyUI.remove();
    currencyUI = null;
  }
  
  // Clean up settings modal components
  cleanupSettingsModal();
  
  // Clean up marketplace buttons and energy recovery info
  cleanupMarketplaceButtons();
  cleanupEnergyRecoveryInfo();
  
  debugLog('UI components cleaned up');
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
  debugLog('Settings modal created and mounted');
  
  // Create currency conversion UI only if enabled
  if (settings.converterEnabled) {
    currencyUI = createCurrencyConversionUI(ctx);
    currencyUI.autoMount();
    debugLog('Currency conversion UI created and mounted');
  } else {
    debugLog('Price converter is disabled via settings - skipping converter UI creation');
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
  
  // Load all settings once for efficiency
  const settings = await loadAllSettings();
  
  // Create all UI components using shared function
  await createUIComponents(ctx, settings);
  
  // Run horse analyzer (always enabled)
  runHorseAnalyzerWithRetry(settings);
}


/**
 * Main initialization function for the extension
 * Loads user preferences and sets up WXT UI components with automatic SPA navigation
 */
async function initialize(ctx: any): Promise<void> {
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
  
  // Add settings change detection for immediate application
  document.addEventListener('phorseSettingsChanged', async (e: Event) => {
    const customEvent = e as CustomEvent;
    debugLog('Settings changed event received:', customEvent.detail);
    
    // Ensure current conversion is still enabled after settings change
    await ensureCurrentConversionIsEnabled();
    
    // Reinitialize components to apply new settings
    await reinitializeComponents(ctx);
  });
  
  debugLog('SPA navigation detection and settings change listeners set up');
}

/**
 * Applies settings changes immediately without page refresh
 * Called from settings modal after saving
 * @param ctx - WXT content script context
 */
export async function applySettingsChanges(ctx: any): Promise<void> {
  debugLog('Applying settings changes immediately...');
  await reinitializeComponents(ctx);
}

// Export initialize function for WXT entrypoint
export { initialize };