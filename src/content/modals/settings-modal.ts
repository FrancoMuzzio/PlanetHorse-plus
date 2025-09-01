// ============= SETTINGS MODAL COMPONENT =============
import { CONFIG, debugLog } from '../config';
import { createIntegratedUi } from '#imports';
import settingGearIcon from '~/assets/icons/setting-gear.svg';

// Modal state variables
let modalUI: any = null;
let buttonUI: any = null;
let modalContainer: HTMLElement | null = null;
let isModalVisible: boolean = false;

/**
 * Shows the settings modal
 */
export function showSettingsModal(): void {
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
export function hideSettingsModal(): void {
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
 * Creates the modal header with title and close button
 * @returns HTMLElement - Modal header element
 */
function createModalHeader(): HTMLElement {
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
    hideSettingsModal();
  });
  
  closeButton.appendChild(closeIcon);
  header.appendChild(closeButton);
  
  return header;
}

/**
 * Creates the modal body with content
 * @returns HTMLElement - Modal body element
 */
function createModalBody(): HTMLElement {
  const body = document.createElement('div');
  body.classList.add(CONFIG.CSS_CLASSES.MODAL_BODY);
  body.textContent = 'Modal content will be added here...';
  
  return body;
}

/**
 * Creates the complete modal content structure
 * @returns HTMLElement - Complete modal content
 */
function createModalContent(): HTMLElement {
  const modalContent = document.createElement('div');
  modalContent.classList.add(CONFIG.CSS_CLASSES.MODAL_CONTENT);
  
  // Stop propagation on modal content to prevent closing when clicking inside
  modalContent.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Assemble modal
  modalContent.appendChild(createModalHeader());
  modalContent.appendChild(createModalBody());
  
  return modalContent;
}

/**
 * Creates settings button UI using WXT native utilities
 * @param ctx - WXT content script context
 */
function createSettingsButton(ctx: any): void {
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
          showSettingsModal();
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
 * Creates modal UI using WXT createIntegratedUi
 * @param ctx - WXT content script context
 */
function createModal(ctx: any): void {
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
            hideSettingsModal();
          }
        });

        // Create and append modal content
        container.appendChild(createModalContent());
        
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
}

/**
 * Main function to create complete settings modal system
 * Creates both button and modal components
 * @param ctx - WXT content script context
 */
export async function createSettingsModal(ctx: any): Promise<void> {
  if (!CONFIG.FEATURES.SETTINGS_MODAL_ENABLED) {
    debugLog('Settings modal is disabled');
    return;
  }

  createModal(ctx);
  createSettingsButton(ctx);
  
  debugLog('Settings modal system created');
}

/**
 * Cleans up settings modal components
 */
export function cleanupSettingsModal(): void {
  debugLog('Cleaning up settings modal components...');
  
  if (buttonUI) {
    buttonUI.remove();
    buttonUI = null;
  }
  
  if (modalUI) {
    modalUI.remove();
    modalUI = null;
  }
  
  modalContainer = null;
  isModalVisible = false;
  
  debugLog('Settings modal components cleaned up');
}