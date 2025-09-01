// ============= MAIN ORCHESTRATION =============
import { CONFIG, debugLog } from './config';
import { fetchAllTokenPrices } from './api';
import settingGearIcon from '~/assets/icons/setting-gear.svg';
import { initializeConversionState } from './state';
import { createShadowRootUi, createIntegratedUi } from '#imports';
import { 
  createCurrencyConversionUI
} from './ui';

// Window interface extension removed - no longer needed without manual timeout management

let modalUI: any = null;
let currencyUI: any = null;
let buttonUI: any = null;
let modalContainer: HTMLElement | null = null;
let isModalVisible: boolean = false;

/**
 * Shows the settings modal
 */
function showModal(): void {
  // Mount modal if not already mounted
  if (modalUI && !modalContainer) {
    modalUI.mount();
    debugLog('Modal mounted');
  }
  
  if (modalContainer && !isModalVisible) {
    modalContainer.classList.add('visible');
    isModalVisible = true;
    
    // Log computed z-index for debugging
    const computedStyle = window.getComputedStyle(modalContainer);
    debugLog(`Modal z-index: ${computedStyle.zIndex}`);
    
    debugLog('Modal shown');
  }
}

/**
 * Hides the settings modal
 */
function hideModal(): void {
  if (modalContainer && isModalVisible) {
    modalContainer.classList.remove('visible');
    isModalVisible = false;
    
    debugLog('Modal hidden');
    
    // Unmount modal to clean up DOM
    if (modalUI) {
      modalUI.remove();
      debugLog('Modal unmounted');
    }
  }
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

  // Only create modal if it doesn't exist
  if (!modalUI) {
    // Create modal UI using createIntegratedUi to inherit page styles
    modalUI = createIntegratedUi(ctx, {
      position: 'inline',
      anchor: 'body',
      append: 'last',
      onMount: (container) => {
        // Store container reference for show/hide control
        modalContainer = container;
        
        // Apply modal container class (styles are now in modal.css)
        container.classList.add(CONFIG.CSS_CLASSES.MODAL_CONTAINER);

        // Add click-to-close on backdrop
        container.addEventListener('click', (e) => {
          if (e.target === container) {
            hideModal();
          }
        });

        // Create modal content wrapper
        const modalContent = document.createElement('div');
        modalContent.classList.add(CONFIG.CSS_CLASSES.MODAL_CONTENT);
        
        // Stop propagation on modal content to prevent closing when clicking inside
        modalContent.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        // Create modal header
        const header = document.createElement('div');
        header.classList.add(CONFIG.CSS_CLASSES.MODAL_HEADER);
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = 'Settings';
        header.appendChild(titleSpan);

        // Create close button using page's close icon
        const closeButton = document.createElement('button');
        closeButton.classList.add(CONFIG.CSS_CLASSES.MODAL_CLOSE_BUTTON);
        closeButton.title = 'Cerrar';
        
        // Create close icon image
        const closeIcon = document.createElement('img');
        closeIcon.alt = 'Close';
        closeIcon.src = '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffechar.6bf40c51.png&w=64&q=75';
        closeIcon.classList.add(CONFIG.CSS_CLASSES.MODAL_CLOSE_ICON);
        closeIcon.setAttribute('decoding', 'async');
        closeIcon.setAttribute('data-nimg', 'intrinsic');
        
        // Add close functionality
        closeButton.addEventListener('click', (e) => {
          e.stopPropagation();
          hideModal();
        });
        
        closeButton.appendChild(closeIcon);
        header.appendChild(closeButton);

        // Create modal body
        const body = document.createElement('div');
        body.classList.add(CONFIG.CSS_CLASSES.MODAL_BODY);
        body.textContent = 'Modal content will be added here...';

        // Assemble modal
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        container.appendChild(modalContent);
        
        debugLog('Modal UI created and ready');
      },
      onRemove: () => {
        debugLog('Modal onRemove triggered');
        modalContainer = null;
        isModalVisible = false;
      }
    });
    
    // Modal will be mounted/unmounted dynamically when needed
  }

  // Only create button if it doesn't exist
  if (!buttonUI) {
    // Create button UI and store reference globally
    buttonUI = createIntegratedUi(ctx, {
      position: 'inline',
      anchor: `[class*="${CONFIG.CSS_CLASSES.ACTION_OPTIONS_PREFIX}"]`,
      onMount: (container) => {
        // Simple container reset
        container.classList.add(CONFIG.CSS_CLASSES.TRANSPARENT_CONTAINER);
        
        const button = document.createElement('div');
        button.classList.add(CONFIG.CSS_CLASSES.SETTINGS_BUTTON_STYLE);
        button.title = 'Planet Horse Extension Settings';
        
        // Load external gear SVG icon
        const gearIcon = document.createElement('img');
        gearIcon.src = settingGearIcon;
        gearIcon.classList.add(CONFIG.CSS_CLASSES.GEAR_ICON);
        gearIcon.alt = 'Settings';
        
        button.appendChild(gearIcon);
        
        // Add click event listener
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          debugLog('Settings button clicked');
          showModal();
        });
        
        container.appendChild(button);
        debugLog('Settings button mounted');
      }
    });

    // Auto-mount button - WXT handles SPA navigation automatically
    buttonUI.autoMount();
  }
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