// ============= SETTINGS MODAL COMPONENT =============
import { CONFIG, debugLog } from '../config';
import { createIntegratedUi } from '#imports';
import settingGearIcon from '~/assets/icons/setting-gear.svg';
import { loadConverterSettings, saveConverterSettings } from '../storage';

// Modal state variables
let modalUI: any = null;
let buttonUI: any = null;
let modalContainer: HTMLElement | null = null;
let isModalVisible: boolean = false;
let currentToggleState: boolean = true; // Current toggle state in modal
let wxtContext: any = null; // Store WXT context for applying changes

/**
 * Shows the settings modal
 */
export async function showSettingsModal(): Promise<void> {
  // Load current settings from storage
  currentToggleState = await loadConverterSettings();
  
  // Mount modal if not already mounted
  if (modalUI && !modalContainer) {
    modalUI.mount();
    debugLog('Modal mounted');
  }
  
  if (modalContainer && !isModalVisible) {
    modalContainer.classList.add('visible');
    isModalVisible = true;
    
    // Update toggle state in UI
    updateToggleUI();
    
    // Log computed z-index for debugging
    const computedStyle = window.getComputedStyle(modalContainer);
    debugLog(`Modal z-index: ${computedStyle.zIndex}`);
    
    debugLog('Modal shown with current toggle state:', currentToggleState);
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
 * Updates the toggle UI to reflect current state
 */
function updateToggleUI(): void {
  const toggleInput = modalContainer?.querySelector(`.${CONFIG.CSS_CLASSES.TOGGLE_SWITCH}`) as HTMLInputElement;
  const statusText = modalContainer?.querySelector(`.${CONFIG.CSS_CLASSES.TOGGLE_STATUS_TEXT}`) as HTMLSpanElement;
  
  if (toggleInput) {
    toggleInput.checked = currentToggleState;
    debugLog('Updated toggle UI state:', currentToggleState);
  }
  
  if (statusText) {
    statusText.textContent = currentToggleState ? 'ON' : 'OFF';
    debugLog('Updated toggle status text:', statusText.textContent);
  }
}

/**
 * Handles toggle state change
 * @param enabled - New toggle state
 */
function handleToggleChange(enabled: boolean): void {
  currentToggleState = enabled;
  updateToggleUI();
  debugLog('Toggle state changed:', enabled);
}

/**
 * Handles save button click - saves settings and applies changes
 */
async function handleSaveSettings(): Promise<void> {
  debugLog('Saving settings...', { converterEnabled: currentToggleState });
  
  // Save to storage
  await saveConverterSettings(currentToggleState);
  
  // Apply changes immediately by dispatching custom event
  // This allows main.ts to listen and reinitialize components
  const settingsChangedEvent = new CustomEvent('phorseSettingsChanged', {
    detail: { converterEnabled: currentToggleState }
  });
  document.dispatchEvent(settingsChangedEvent);
  
  // Close modal after saving
  hideSettingsModal();
  
  debugLog('Settings saved and applied');
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
 * Creates the modal body with settings content
 * @returns HTMLElement - Modal body element
 */
function createModalBody(): HTMLElement {
  const body = document.createElement('div');
  body.classList.add(CONFIG.CSS_CLASSES.MODAL_BODY);
  
  // Settings section for price converter
  const settingsSection = document.createElement('div');
  settingsSection.classList.add(CONFIG.CSS_CLASSES.SETTINGS_SECTION);
  
  // Label for toggle
  const label = document.createElement('label');
  label.classList.add(CONFIG.CSS_CLASSES.SETTINGS_LABEL);
  label.textContent = 'Enable Price Converter';
  
  // Toggle container
  const toggleContainer = document.createElement('div');
  toggleContainer.classList.add(CONFIG.CSS_CLASSES.TOGGLE_CONTAINER);
  
  // Toggle switch (checkbox input)
  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.classList.add(CONFIG.CSS_CLASSES.TOGGLE_SWITCH);
  toggleInput.checked = currentToggleState;
  
  // Toggle slider visual element
  const toggleSlider = document.createElement('span');
  toggleSlider.classList.add(CONFIG.CSS_CLASSES.TOGGLE_SLIDER);
  
  // Add toggle event listener
  toggleInput.addEventListener('change', () => {
    handleToggleChange(toggleInput.checked);
  });
  
  // Toggle status text
  const statusText = document.createElement('span');
  statusText.classList.add(CONFIG.CSS_CLASSES.TOGGLE_STATUS_TEXT);
  statusText.textContent = currentToggleState ? 'ON' : 'OFF';
  
  // Assemble toggle
  toggleContainer.appendChild(toggleInput);
  toggleContainer.appendChild(toggleSlider);
  
  // Create toggle group container
  const toggleGroup = document.createElement('div');
  toggleGroup.style.display = 'flex';
  toggleGroup.style.alignItems = 'center';
  toggleGroup.style.gap = '10px';
  toggleGroup.appendChild(toggleContainer);
  toggleGroup.appendChild(statusText);
  
  // Assemble settings section
  settingsSection.appendChild(label);
  settingsSection.appendChild(toggleGroup);
  
  // Modal footer with save button
  const footer = document.createElement('div');
  footer.classList.add(CONFIG.CSS_CLASSES.MODAL_FOOTER);
  
  const saveButton = document.createElement('button');
  saveButton.classList.add(CONFIG.CSS_CLASSES.SAVE_BUTTON);
  saveButton.textContent = 'Save';
  
  // Add save button event listener
  saveButton.addEventListener('click', async () => {
    await handleSaveSettings();
  });
  
  footer.appendChild(saveButton);
  
  // Assemble modal body
  body.appendChild(settingsSection);
  body.appendChild(footer);
  
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
        button.addEventListener('click', async (e) => {
          e.stopPropagation();
          e.preventDefault();
          debugLog('Settings button clicked');
          await showSettingsModal();
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

  // Store context for settings application
  wxtContext = ctx;
  
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
  wxtContext = null;
  
  debugLog('Settings modal components cleaned up');
}