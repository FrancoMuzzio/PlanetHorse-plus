// ============= MAIN ORCHESTRATION =============
import { CONFIG, debugLog } from './config';
import { fetchAllTokenPrices } from './api';
import settingGearIcon from '~/assets/icons/setting-gear.svg';
import { initializeConversionState } from './state';
import { 
  createCurrencyConversionUI
} from './ui';

// Window interface extension removed - no longer needed without manual timeout management

let modalUI: any = null;
let currencyUI: any = null;
let buttonUI: any = null;

/**
 * Cleans up existing WXT UI components
 */
function cleanupUIComponents(): void {
  debugLog('Cleaning up existing UI components...');
  
  if (currencyUI) {
    currencyUI.remove();
    currencyUI = null;
  }
  
  if (buttonUI) {
    buttonUI.remove();
    buttonUI = null;
  }
  
  if (modalUI) {
    modalUI.remove();
    modalUI = null;
  }
  
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
  
  // Create settings UI if enabled
  if (CONFIG.FEATURES.SETTINGS_MODAL_ENABLED) {
    await createSettingsUI(ctx);
    debugLog('Settings UI created and mounted');
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

  // Create button UI and store reference globally
  buttonUI = createIntegratedUi(ctx, {
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
      gearIcon.src = settingGearIcon;
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