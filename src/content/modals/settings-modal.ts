// ============= SETTINGS MODAL COMPONENT =============
import { CONFIG, debugLog, getConversionDisplayText, type ConversionKey } from '../config';
import { createIntegratedUi } from '#imports';
import settingGearIcon from '~/assets/icons/setting-gear.svg';
import { loadConverterSettings, saveConverterSettings, loadEnabledCurrencies, saveEnabledCurrencies, loadMarketplaceSettings, saveMarketplaceSettings, loadEnabledMarketplaces, saveEnabledMarketplaces } from '../storage';
import { getAllValidConversions } from '../utils/validation';

// Default currencies to enable when turning on converter with no selections
const DEFAULT_ENABLED_CURRENCIES: ConversionKey[] = ['usd', 'ron'];

// Default marketplaces to enable when turning on marketplace links with no selections
const DEFAULT_ENABLED_MARKETPLACES: string[] = ['ronin', 'opensea'];

// Modal state variables
let modalUI: any = null;
let buttonUI: any = null;
let modalContainer: HTMLElement | null = null;
let isModalVisible: boolean = false;
let currentToggleState: boolean = true; // Current toggle state in modal
let currentEnabledCurrencies: ConversionKey[] = DEFAULT_ENABLED_CURRENCIES.slice(); // Current enabled currencies in modal
let currentMarketplaceToggleState: boolean = true; // Current marketplace toggle state in modal
let currentEnabledMarketplaces: string[] = DEFAULT_ENABLED_MARKETPLACES.slice(); // Current enabled marketplaces in modal
let wxtContext: any = null; // Store WXT context for applying changes

/**
 * Shows the settings modal
 */
export async function showSettingsModal(): Promise<void> {
  // Load current settings from storage
  currentToggleState = await loadConverterSettings();
  currentEnabledCurrencies = await loadEnabledCurrencies();
  currentMarketplaceToggleState = await loadMarketplaceSettings();
  currentEnabledMarketplaces = await loadEnabledMarketplaces();
  
  // Mount modal if not already mounted
  if (modalUI && !modalContainer) {
    modalUI.mount();
    debugLog('Modal mounted');
  }
  
  if (modalContainer && !isModalVisible) {
    modalContainer.classList.add('visible');
    isModalVisible = true;
    
    // Update toggle state and currency list in UI
    updateToggleUI();
    updateCurrencyListVisibility();
    updateCurrencyCheckboxes();
    
    // Update marketplace toggle state and marketplace list in UI
    updateMarketplaceToggleUI();
    updateMarketplaceListVisibility();
    updateMarketplaceCheckboxes();
    
    // Log computed z-index for debugging
    const computedStyle = window.getComputedStyle(modalContainer);
    debugLog(`Modal z-index: ${computedStyle.zIndex}`);
    
    debugLog('Modal shown with current toggle state:', currentToggleState, 'enabled currencies:', currentEnabledCurrencies);
    debugLog('Modal shown with current marketplace toggle state:', currentMarketplaceToggleState, 'enabled marketplaces:', currentEnabledMarketplaces);
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
 * Updates currency list section visibility based on toggle state
 */
function updateCurrencyListVisibility(): void {
  const currencyListSection = modalContainer?.querySelector(`.${CONFIG.CSS_CLASSES.CURRENCY_LIST_SECTION}`);
  if (currencyListSection) {
    currencyListSection.style.display = currentToggleState ? 'block' : 'none';
    debugLog('Updated currency list visibility:', currentToggleState ? 'visible' : 'hidden');
  }
}

/**
 * Updates currency checkboxes to reflect current enabled currencies
 */
function updateCurrencyCheckboxes(): void {
  const checkboxes = modalContainer?.querySelectorAll(`.${CONFIG.CSS_CLASSES.CURRENCY_CHECKBOX}`) as NodeListOf<HTMLInputElement>;
  checkboxes?.forEach(checkbox => {
    const currencyKey = checkbox.dataset.currency;
    if (currencyKey) {
      checkbox.checked = currentEnabledCurrencies.includes(currencyKey);
    }
  });
  debugLog('Updated currency checkboxes for enabled currencies:', currentEnabledCurrencies);
}

/**
 * Handles currency checkbox change
 * @param currencyKey - The currency that was toggled
 * @param enabled - Whether the currency is now enabled
 */
function handleCurrencyToggle(currencyKey: ConversionKey, enabled: boolean): void {
  if (enabled) {
    // Add currency if not already enabled
    if (!currentEnabledCurrencies.includes(currencyKey)) {
      currentEnabledCurrencies.push(currencyKey);
    }
  } else {
    // Remove currency from enabled list
    currentEnabledCurrencies = currentEnabledCurrencies.filter(key => key !== currencyKey);
  }
  
  // CRITICAL FIX: Synchronize UI after state change
  updateCurrencyCheckboxes();
  
  // Auto-disable converter if all currencies are unchecked
  if (currentEnabledCurrencies.length === 0 && currentToggleState) {
    debugLog('All currencies disabled - automatically turning OFF converter');
    handleToggleChange(false);
  }
  
  debugLog('Currency toggle changed:', currencyKey, enabled ? 'enabled' : 'disabled');
  debugLog('Current enabled currencies:', currentEnabledCurrencies);
}

/**
 * Handles toggle state change
 * @param enabled - New toggle state
 */
function handleToggleChange(enabled: boolean): void {
  currentToggleState = enabled;
  
  // Auto-enable default currencies when turning ON with no selections
  if (enabled && currentEnabledCurrencies.length === 0) {
    debugLog('Converter enabled with no currencies - auto-enabling default currencies');
    currentEnabledCurrencies = DEFAULT_ENABLED_CURRENCIES.slice();
    updateCurrencyCheckboxes();
  }
  
  updateToggleUI();
  updateCurrencyListVisibility();
  debugLog('Toggle state changed:', enabled);
}

/**
 * Updates the marketplace toggle UI to reflect current state
 */
function updateMarketplaceToggleUI(): void {
  const toggleInput = modalContainer?.querySelector(`.${CONFIG.CSS_CLASSES.TOGGLE_SWITCH}[data-marketplace]`) as HTMLInputElement;
  const statusText = modalContainer?.querySelector(`.${CONFIG.CSS_CLASSES.TOGGLE_STATUS_TEXT}[data-marketplace]`) as HTMLSpanElement;
  
  if (toggleInput) {
    toggleInput.checked = currentMarketplaceToggleState;
    debugLog('Updated marketplace toggle UI state:', currentMarketplaceToggleState);
  }
  
  if (statusText) {
    statusText.textContent = currentMarketplaceToggleState ? 'ON' : 'OFF';
    debugLog('Updated marketplace toggle status text:', statusText.textContent);
  }
}

/**
 * Updates marketplace list section visibility based on toggle state
 */
function updateMarketplaceListVisibility(): void {
  const marketplaceListSection = modalContainer?.querySelector(`[data-marketplace-section]`);
  if (marketplaceListSection) {
    marketplaceListSection.style.display = currentMarketplaceToggleState ? 'block' : 'none';
    debugLog('Updated marketplace list visibility:', currentMarketplaceToggleState ? 'visible' : 'hidden');
  }
}

/**
 * Updates marketplace checkboxes to reflect current enabled marketplaces
 */
function updateMarketplaceCheckboxes(): void {
  const checkboxes = modalContainer?.querySelectorAll(`.${CONFIG.CSS_CLASSES.CURRENCY_CHECKBOX}[data-marketplace]`) as NodeListOf<HTMLInputElement>;
  checkboxes?.forEach(checkbox => {
    const marketplaceKey = checkbox.dataset.marketplace;
    if (marketplaceKey) {
      checkbox.checked = currentEnabledMarketplaces.includes(marketplaceKey);
    }
  });
  debugLog('Updated marketplace checkboxes for enabled marketplaces:', currentEnabledMarketplaces);
}

/**
 * Handles marketplace checkbox change
 * @param marketplaceKey - The marketplace that was toggled
 * @param enabled - Whether the marketplace is now enabled
 */
function handleMarketplaceToggle(marketplaceKey: string, enabled: boolean): void {
  if (enabled) {
    // Add marketplace if not already enabled
    if (!currentEnabledMarketplaces.includes(marketplaceKey)) {
      currentEnabledMarketplaces.push(marketplaceKey);
    }
  } else {
    // Remove marketplace from enabled list
    currentEnabledMarketplaces = currentEnabledMarketplaces.filter(key => key !== marketplaceKey);
  }
  
  // CRITICAL FIX: Synchronize UI after state change
  updateMarketplaceCheckboxes();
  
  // Auto-disable marketplace links if all marketplaces are unchecked
  if (currentEnabledMarketplaces.length === 0 && currentMarketplaceToggleState) {
    debugLog('All marketplaces disabled - automatically turning OFF marketplace links');
    handleMarketplaceToggleChange(false);
  }
  
  debugLog('Marketplace toggle changed:', marketplaceKey, enabled ? 'enabled' : 'disabled');
  debugLog('Current enabled marketplaces:', currentEnabledMarketplaces);
}

/**
 * Handles marketplace toggle state change
 * @param enabled - New marketplace toggle state
 */
function handleMarketplaceToggleChange(enabled: boolean): void {
  currentMarketplaceToggleState = enabled;
  
  // Auto-enable default marketplaces when turning ON with no selections
  if (enabled && currentEnabledMarketplaces.length === 0) {
    debugLog('Marketplace links enabled with no marketplaces - auto-enabling default marketplaces');
    currentEnabledMarketplaces = DEFAULT_ENABLED_MARKETPLACES.slice();
    updateMarketplaceCheckboxes();
  }
  
  updateMarketplaceToggleUI();
  updateMarketplaceListVisibility();
  debugLog('Marketplace toggle state changed:', enabled);
}

/**
 * Handles save button click - saves settings and applies changes
 */
async function handleSaveSettings(): Promise<void> {
  debugLog('Saving settings...', { 
    converterEnabled: currentToggleState, 
    enabledCurrencies: currentEnabledCurrencies,
    marketplaceLinksEnabled: currentMarketplaceToggleState,
    enabledMarketplaces: currentEnabledMarketplaces
  });
  
  // Save to storage
  await saveConverterSettings(currentToggleState);
  await saveEnabledCurrencies(currentEnabledCurrencies);
  await saveMarketplaceSettings(currentMarketplaceToggleState);
  await saveEnabledMarketplaces(currentEnabledMarketplaces);
  
  // Apply changes immediately by dispatching custom event
  // This allows main.ts to listen and reinitialize components
  const settingsChangedEvent = new CustomEvent('phorseSettingsChanged', {
    detail: { 
      converterEnabled: currentToggleState,
      enabledCurrencies: currentEnabledCurrencies,
      marketplaceLinksEnabled: currentMarketplaceToggleState,
      enabledMarketplaces: currentEnabledMarketplaces
    }
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
 * Creates the currency list section with checkboxes for all available currencies
 * @returns HTMLElement - Currency list section element
 */
function createCurrencyListSection(): HTMLElement {
  const currencySection = document.createElement('div');
  currencySection.classList.add(CONFIG.CSS_CLASSES.CURRENCY_LIST_SECTION);
  
  // Section title
  const sectionTitle = document.createElement('label');
  sectionTitle.classList.add(CONFIG.CSS_CLASSES.SETTINGS_LABEL);
  sectionTitle.textContent = 'Available Currencies';
  sectionTitle.style.marginBottom = '10px';
  sectionTitle.style.display = 'block';
  
  // Currency list container
  const currencyContainer = document.createElement('div');
  currencyContainer.classList.add(CONFIG.CSS_CLASSES.CURRENCY_LIST_CONTAINER);
  
  // Generate currency items for all available currencies
  const allCurrencies = getAllValidConversions();
  allCurrencies.forEach(currencyKey => {
    const currencyItem = document.createElement('div');
    currencyItem.classList.add(CONFIG.CSS_CLASSES.CURRENCY_ITEM);
    
    // Hidden checkbox input (first element for CSS selectors)
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add(CONFIG.CSS_CLASSES.CURRENCY_CHECKBOX);
    checkbox.dataset.currency = currencyKey;
    checkbox.checked = currentEnabledCurrencies.includes(currencyKey);
    
    // Visual checkbox container (second element for CSS + selector)
    const checkboxContainer = document.createElement('div');
    checkboxContainer.classList.add(CONFIG.CSS_CLASSES.CURRENCY_CHECKBOX_CONTAINER);
    
    // Currency label with emoji and name (third element)
    const labelText = document.createElement('span');
    labelText.classList.add(CONFIG.CSS_CLASSES.CURRENCY_LABEL_TEXT);
    labelText.textContent = getConversionDisplayText(currencyKey, 'displayName');
    
    // Create closure-safe event handlers for this currency
    const createCheckboxHandler = (currency: ConversionKey) => (e: Event) => {
      e.stopPropagation();
      const checkboxElement = e.target as HTMLInputElement;
      // Use setTimeout to ensure browser's automatic state change completes first
      setTimeout(() => {
        handleCurrencyToggle(currency, checkboxElement.checked);
      }, 0);
    };
    
    const createLabelHandler = (currency: ConversionKey, checkboxElement: HTMLInputElement) => (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      // Toggle state and handle immediately
      checkboxElement.checked = !checkboxElement.checked;
      handleCurrencyToggle(currency, checkboxElement.checked);
    };
    
    // Add event listeners with proper closure capture
    checkbox.addEventListener('change', createCheckboxHandler(currencyKey));
    labelText.addEventListener('click', createLabelHandler(currencyKey, checkbox));
    
    // Assemble with checkbox inside container for proper positioning
    checkboxContainer.appendChild(checkbox);
    currencyItem.appendChild(checkboxContainer);
    currencyItem.appendChild(labelText);
    currencyContainer.appendChild(currencyItem);
  });
  
  currencySection.appendChild(sectionTitle);
  currencySection.appendChild(currencyContainer);
  
  return currencySection;
}

/**
 * Creates the marketplace list section with checkboxes for all available marketplaces
 * Reuses currency list CSS classes for consistency
 * @returns HTMLElement - Marketplace list section element
 */
function createMarketplaceListSection(): HTMLElement {
  const marketplaceSection = document.createElement('div');
  marketplaceSection.classList.add(CONFIG.CSS_CLASSES.CURRENCY_LIST_SECTION);
  marketplaceSection.setAttribute('data-marketplace-section', ''); // Identifier for marketplace section
  
  // Section title
  const sectionTitle = document.createElement('label');
  sectionTitle.classList.add(CONFIG.CSS_CLASSES.SETTINGS_LABEL);
  sectionTitle.textContent = 'Available Marketplaces';
  sectionTitle.style.marginBottom = '10px';
  sectionTitle.style.display = 'block';
  
  // Marketplace list container (reusing currency container class)
  const marketplaceContainer = document.createElement('div');
  marketplaceContainer.classList.add(CONFIG.CSS_CLASSES.CURRENCY_LIST_CONTAINER);
  
  // Generate marketplace items for all available marketplaces
  const allMarketplaces = [
    { key: 'ronin', name: 'Ronin Market' },
    { key: 'opensea', name: 'OpenSea' }
  ];
  
  allMarketplaces.forEach(marketplace => {
    const marketplaceItem = document.createElement('div');
    marketplaceItem.classList.add(CONFIG.CSS_CLASSES.CURRENCY_ITEM);
    
    // Hidden checkbox input (first element for CSS selectors)
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add(CONFIG.CSS_CLASSES.CURRENCY_CHECKBOX);
    checkbox.dataset.marketplace = marketplace.key; // Use marketplace data attribute
    checkbox.checked = currentEnabledMarketplaces.includes(marketplace.key);
    
    // Visual checkbox container (second element for CSS + selector)
    const checkboxContainer = document.createElement('div');
    checkboxContainer.classList.add(CONFIG.CSS_CLASSES.CURRENCY_CHECKBOX_CONTAINER);
    
    // Marketplace label (third element) - reusing currency label class for consistency
    const labelText = document.createElement('span');
    labelText.classList.add(CONFIG.CSS_CLASSES.CURRENCY_LABEL_TEXT);
    labelText.textContent = marketplace.name; // No emojis, just clean names
    
    // Create closure-safe event handlers for this marketplace
    const createCheckboxHandler = (marketplaceKey: string) => (e: Event) => {
      e.stopPropagation();
      const checkboxElement = e.target as HTMLInputElement;
      // Use setTimeout to ensure browser's automatic state change completes first
      setTimeout(() => {
        handleMarketplaceToggle(marketplaceKey, checkboxElement.checked);
      }, 0);
    };
    
    const createLabelHandler = (marketplaceKey: string, checkboxElement: HTMLInputElement) => (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      // Toggle state and handle immediately
      checkboxElement.checked = !checkboxElement.checked;
      handleMarketplaceToggle(marketplaceKey, checkboxElement.checked);
    };
    
    // Add event listeners with proper closure capture
    checkbox.addEventListener('change', createCheckboxHandler(marketplace.key));
    labelText.addEventListener('click', createLabelHandler(marketplace.key, checkbox));
    
    // Assemble with checkbox inside container for proper positioning
    checkboxContainer.appendChild(checkbox);
    marketplaceItem.appendChild(checkboxContainer);
    marketplaceItem.appendChild(labelText);
    marketplaceContainer.appendChild(marketplaceItem);
  });
  
  marketplaceSection.appendChild(sectionTitle);
  marketplaceSection.appendChild(marketplaceContainer);
  
  return marketplaceSection;
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
  
  // Currency list section (only visible when converter is enabled)
  const currencyListSection = createCurrencyListSection();
  
  // Settings section for marketplace links
  const marketplaceSettingsSection = document.createElement('div');
  marketplaceSettingsSection.classList.add(CONFIG.CSS_CLASSES.SETTINGS_SECTION);
  marketplaceSettingsSection.style.marginTop = '20px';
  
  // Label for marketplace toggle
  const marketplaceLabel = document.createElement('label');
  marketplaceLabel.classList.add(CONFIG.CSS_CLASSES.SETTINGS_LABEL);
  marketplaceLabel.textContent = 'Enable Marketplace Links';
  
  // Marketplace toggle container
  const marketplaceToggleContainer = document.createElement('div');
  marketplaceToggleContainer.classList.add(CONFIG.CSS_CLASSES.TOGGLE_CONTAINER);
  
  // Marketplace toggle switch (checkbox input)
  const marketplaceToggleInput = document.createElement('input');
  marketplaceToggleInput.type = 'checkbox';
  marketplaceToggleInput.classList.add(CONFIG.CSS_CLASSES.TOGGLE_SWITCH);
  marketplaceToggleInput.checked = currentMarketplaceToggleState;
  marketplaceToggleInput.setAttribute('data-marketplace', ''); // Identifier for marketplace toggle
  
  // Marketplace toggle slider visual element
  const marketplaceToggleSlider = document.createElement('span');
  marketplaceToggleSlider.classList.add(CONFIG.CSS_CLASSES.TOGGLE_SLIDER);
  
  // Add marketplace toggle event listener
  marketplaceToggleInput.addEventListener('change', () => {
    handleMarketplaceToggleChange(marketplaceToggleInput.checked);
  });
  
  // Marketplace toggle status text
  const marketplaceStatusText = document.createElement('span');
  marketplaceStatusText.classList.add(CONFIG.CSS_CLASSES.TOGGLE_STATUS_TEXT);
  marketplaceStatusText.textContent = currentMarketplaceToggleState ? 'ON' : 'OFF';
  marketplaceStatusText.setAttribute('data-marketplace', ''); // Identifier for marketplace status
  
  // Assemble marketplace toggle
  marketplaceToggleContainer.appendChild(marketplaceToggleInput);
  marketplaceToggleContainer.appendChild(marketplaceToggleSlider);
  
  // Create marketplace toggle group container
  const marketplaceToggleGroup = document.createElement('div');
  marketplaceToggleGroup.style.display = 'flex';
  marketplaceToggleGroup.style.alignItems = 'center';
  marketplaceToggleGroup.style.gap = '10px';
  marketplaceToggleGroup.appendChild(marketplaceToggleContainer);
  marketplaceToggleGroup.appendChild(marketplaceStatusText);
  
  // Assemble marketplace settings section
  marketplaceSettingsSection.appendChild(marketplaceLabel);
  marketplaceSettingsSection.appendChild(marketplaceToggleGroup);
  
  // Marketplace list section (only visible when marketplace links are enabled)
  const marketplaceListSection = createMarketplaceListSection();
  
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
  body.appendChild(currencyListSection);
  body.appendChild(marketplaceSettingsSection);
  body.appendChild(marketplaceListSection);
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