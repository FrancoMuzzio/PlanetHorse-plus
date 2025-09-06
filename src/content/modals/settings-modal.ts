// ============= SETTINGS MODAL COMPONENT =============
import { CONFIG, debugLog, getConversionDisplayText, type ConversionKey } from '../config';
import { createIntegratedUi } from '#imports';
import settingGearIcon from '~/assets/icons/setting-gear.svg';
import { loadAllSettings, saveConverterSettings, saveEnabledCurrencies, saveMarketplaceSettings, saveEnabledMarketplaces, saveEnergyRecoverySettings, saveSettingsModalSettings, saveHorseAnalyzerSettings, type AllSettings } from '../storage';
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
let currentSettings: AllSettings = {
  converterEnabled: true,
  enabledCurrencies: DEFAULT_ENABLED_CURRENCIES.slice(),
  marketplaceLinksEnabled: true,
  enabledMarketplaces: DEFAULT_ENABLED_MARKETPLACES.slice(),
  energyRecoveryEnabled: true
};
let wxtContext: any = null; // Store WXT context for applying changes

/**
 * Shows the settings modal
 */
export async function showSettingsModal(): Promise<void> {
  // Load current settings from storage using centralized function
  currentSettings = await loadAllSettings();
  
  // Mount modal if not already mounted
  if (modalUI && !modalContainer) {
    modalUI.mount();
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
    
    // Update energy recovery toggle state in UI
    updateEnergyRecoveryToggleUI();
    
  }
}

/**
 * Hides the settings modal
 */
export function hideSettingsModal(): void {
  if (modalContainer && isModalVisible) {
    modalContainer.classList.remove('visible');
    isModalVisible = false;
    
    // Unmount modal to clean up DOM
    if (modalUI) {
      modalUI.remove();
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
    toggleInput.checked = currentSettings.converterEnabled;
  }
  
  if (statusText) {
    statusText.textContent = currentSettings.converterEnabled ? 'ON' : 'OFF';
  }
}

/**
 * Updates currency list section visibility based on toggle state
 */
function updateCurrencyListVisibility(): void {
  const currencyListSection = modalContainer?.querySelector(`.${CONFIG.CSS_CLASSES.CURRENCY_LIST_SECTION}`);
  if (currencyListSection) {
    currencyListSection.style.display = currentSettings.converterEnabled ? 'block' : 'none';
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
      checkbox.checked = currentSettings.enabledCurrencies.includes(currencyKey);
    }
  });
}

/**
 * Handles currency checkbox change
 * @param currencyKey - The currency that was toggled
 * @param enabled - Whether the currency is now enabled
 */
function handleCurrencyToggle(currencyKey: ConversionKey, enabled: boolean): void {
  if (enabled) {
    // Add currency if not already enabled
    if (!currentSettings.enabledCurrencies.includes(currencyKey)) {
      currentSettings.enabledCurrencies.push(currencyKey);
    }
  } else {
    // Remove currency from enabled list
    currentSettings.enabledCurrencies = currentSettings.enabledCurrencies.filter(key => key !== currencyKey);
  }
  
  // CRITICAL FIX: Synchronize UI after state change
  updateCurrencyCheckboxes();
  
  // Auto-disable converter if all currencies are unchecked
  if (currentSettings.enabledCurrencies.length === 0 && currentSettings.converterEnabled) {
    handleToggleChange(false);
  }
  
}

/**
 * Handles toggle state change
 * @param enabled - New toggle state
 */
function handleToggleChange(enabled: boolean): void {
  currentSettings.converterEnabled = enabled;
  
  // Auto-enable default currencies when turning ON with no selections
  if (enabled && currentSettings.enabledCurrencies.length === 0) {
    currentSettings.enabledCurrencies = DEFAULT_ENABLED_CURRENCIES.slice();
    updateCurrencyCheckboxes();
  }
  
  updateToggleUI();
  updateCurrencyListVisibility();
}

/**
 * Updates the marketplace toggle UI to reflect current state
 */
function updateMarketplaceToggleUI(): void {
  const toggleInput = modalContainer?.querySelector(`.${CONFIG.CSS_CLASSES.TOGGLE_SWITCH}[data-marketplace]`) as HTMLInputElement;
  const statusText = modalContainer?.querySelector(`.${CONFIG.CSS_CLASSES.TOGGLE_STATUS_TEXT}[data-marketplace]`) as HTMLSpanElement;
  
  if (toggleInput) {
    toggleInput.checked = currentSettings.marketplaceLinksEnabled;
  }
  
  if (statusText) {
    statusText.textContent = currentSettings.marketplaceLinksEnabled ? 'ON' : 'OFF';
  }
}

/**
 * Updates marketplace list section visibility based on toggle state
 */
function updateMarketplaceListVisibility(): void {
  const marketplaceListSection = modalContainer?.querySelector(`[data-marketplace-section]`);
  if (marketplaceListSection) {
    marketplaceListSection.style.display = currentSettings.marketplaceLinksEnabled ? 'block' : 'none';
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
      checkbox.checked = currentSettings.enabledMarketplaces.includes(marketplaceKey);
    }
  });
}

/**
 * Handles marketplace checkbox change
 * @param marketplaceKey - The marketplace that was toggled
 * @param enabled - Whether the marketplace is now enabled
 */
function handleMarketplaceToggle(marketplaceKey: string, enabled: boolean): void {
  if (enabled) {
    // Add marketplace if not already enabled
    if (!currentSettings.enabledMarketplaces.includes(marketplaceKey)) {
      currentSettings.enabledMarketplaces.push(marketplaceKey);
    }
  } else {
    // Remove marketplace from enabled list
    currentSettings.enabledMarketplaces = currentSettings.enabledMarketplaces.filter(key => key !== marketplaceKey);
  }
  
  // CRITICAL FIX: Synchronize UI after state change
  updateMarketplaceCheckboxes();
  
  // Auto-disable marketplace links if all marketplaces are unchecked
  if (currentSettings.enabledMarketplaces.length === 0 && currentSettings.marketplaceLinksEnabled) {
    handleMarketplaceToggleChange(false);
  }
  
}

/**
 * Handles marketplace toggle state change
 * @param enabled - New marketplace toggle state
 */
function handleMarketplaceToggleChange(enabled: boolean): void {
  currentSettings.marketplaceLinksEnabled = enabled;
  
  // Auto-enable default marketplaces when turning ON with no selections
  if (enabled && currentSettings.enabledMarketplaces.length === 0) {
    currentSettings.enabledMarketplaces = DEFAULT_ENABLED_MARKETPLACES.slice();
    updateMarketplaceCheckboxes();
  }
  
  updateMarketplaceToggleUI();
  updateMarketplaceListVisibility();
}

/**
 * Updates the energy recovery toggle UI to reflect current state
 */
function updateEnergyRecoveryToggleUI(): void {
  const toggleInput = modalContainer?.querySelector(`.${CONFIG.CSS_CLASSES.TOGGLE_SWITCH}[data-energy-recovery]`) as HTMLInputElement;
  const statusText = modalContainer?.querySelector(`.${CONFIG.CSS_CLASSES.TOGGLE_STATUS_TEXT}[data-energy-recovery]`) as HTMLSpanElement;
  
  if (toggleInput) {
    toggleInput.checked = currentSettings.energyRecoveryEnabled;
  }
  
  if (statusText) {
    statusText.textContent = currentSettings.energyRecoveryEnabled ? 'ON' : 'OFF';
  }
}

/**
 * Handles energy recovery toggle state change
 * @param enabled - New energy recovery toggle state
 */
function handleEnergyRecoveryToggleChange(enabled: boolean): void {
  currentSettings.energyRecoveryEnabled = enabled;
  
  updateEnergyRecoveryToggleUI();
}

/**
 * Handles save button click - saves settings and applies changes
 */
async function handleSaveSettings(): Promise<void> {
  const saveButton = modalContainer?.querySelector(`.${CONFIG.CSS_CLASSES.SAVE_BUTTON}`) as HTMLButtonElement;
  const originalButtonText = saveButton?.textContent || 'Save';
  
  try {
    // Show loading state
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = 'Saving...';
      saveButton.style.opacity = '0.7';
    }
    
    // Save all settings to storage in parallel for efficiency
    await Promise.all([
      saveConverterSettings(currentSettings.converterEnabled),
      saveEnabledCurrencies(currentSettings.enabledCurrencies),
      saveMarketplaceSettings(currentSettings.marketplaceLinksEnabled),
      saveEnabledMarketplaces(currentSettings.enabledMarketplaces),
      saveEnergyRecoverySettings(currentSettings.energyRecoveryEnabled)
    ]);
    
    // Show success state briefly
    if (saveButton) {
      saveButton.textContent = '✓ Saved!';
      saveButton.style.backgroundColor = '#4CAF50';
    }
    
    // Apply changes immediately by dispatching custom event
    // This allows main.ts to listen and reinitialize components
    const settingsChangedEvent = new CustomEvent('phorseSettingsChanged', {
      detail: currentSettings
    });
    document.dispatchEvent(settingsChangedEvent);
    
    debugLog('Settings saved and applied successfully');
    
    // Close modal after brief success display
    setTimeout(() => {
      hideSettingsModal();
    }, 500);
    
  } catch (error) {
    debugLog('Error saving settings:', error);
    
    // Show error state
    if (saveButton) {
      saveButton.textContent = '✗ Error - Try Again';
      saveButton.style.backgroundColor = '#f44336';
      saveButton.disabled = false;
      saveButton.style.opacity = '1';
      
      // Reset button after error display
      setTimeout(() => {
        saveButton.textContent = originalButtonText;
        saveButton.style.backgroundColor = '';
      }, 2000);
    }
  }
}

/**
 * Creates a settings toggle section (DRY principle - consolidates toggle creation pattern)
 * @param label - Label text for the toggle
 * @param isEnabled - Current toggle state
 * @param onChange - Callback when toggle changes
 * @param dataAttribute - Optional data attribute for identification (e.g., 'data-marketplace')
 * @returns HTMLElement - Complete settings section with toggle
 */
function createSettingsToggleSection(
  label: string, 
  isEnabled: boolean, 
  onChange: (enabled: boolean) => void,
  dataAttribute?: string
): HTMLElement {
  // Settings section
  const settingsSection = document.createElement('div');
  settingsSection.classList.add(CONFIG.CSS_CLASSES.SETTINGS_SECTION);
  
  // Label for toggle
  const labelElement = document.createElement('label');
  labelElement.classList.add(CONFIG.CSS_CLASSES.SETTINGS_LABEL);
  labelElement.textContent = label;
  
  // Toggle container
  const toggleContainer = document.createElement('div');
  toggleContainer.classList.add(CONFIG.CSS_CLASSES.TOGGLE_CONTAINER);
  
  // Toggle switch (checkbox input)
  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.classList.add(CONFIG.CSS_CLASSES.TOGGLE_SWITCH);
  toggleInput.checked = isEnabled;
  if (dataAttribute) {
    toggleInput.setAttribute(dataAttribute, '');
  }
  
  // Toggle slider visual element
  const toggleSlider = document.createElement('span');
  toggleSlider.classList.add(CONFIG.CSS_CLASSES.TOGGLE_SLIDER);
  
  // Add toggle event listener
  toggleInput.addEventListener('change', () => {
    onChange(toggleInput.checked);
  });
  
  // Toggle status text
  const statusText = document.createElement('span');
  statusText.classList.add(CONFIG.CSS_CLASSES.TOGGLE_STATUS_TEXT);
  statusText.textContent = isEnabled ? 'ON' : 'OFF';
  if (dataAttribute) {
    statusText.setAttribute(dataAttribute, '');
  }
  
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
  settingsSection.appendChild(labelElement);
  settingsSection.appendChild(toggleGroup);
  
  return settingsSection;
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
    checkbox.checked = currentSettings.enabledCurrencies.includes(currencyKey);
    
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
    checkbox.checked = currentSettings.enabledMarketplaces.includes(marketplace.key);
    
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
  
  // Price Converter Section using helper function
  const converterSection = createSettingsToggleSection(
    'Enable Price Converter',
    currentSettings.converterEnabled,
    handleToggleChange
  );
  
  // Currency list section (only visible when converter is enabled)
  const currencyListSection = createCurrencyListSection();
  
  // Marketplace Links Section using helper function
  const marketplaceSection = createSettingsToggleSection(
    'Enable Marketplace Links',
    currentSettings.marketplaceLinksEnabled,
    handleMarketplaceToggleChange,
    'data-marketplace'
  );
  marketplaceSection.style.marginTop = '20px';
  
  // Marketplace list section (only visible when marketplace links are enabled)
  const marketplaceListSection = createMarketplaceListSection();
  
  // Energy Recovery Section using helper function
  const energyRecoverySection = createSettingsToggleSection(
    'Enable Energy Recovery Info',
    currentSettings.energyRecoveryEnabled,
    handleEnergyRecoveryToggleChange,
    'data-energy-recovery'
  );
  energyRecoverySection.style.marginTop = '20px';
  
  
  
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
  
  // Assemble modal body with all sections
  body.appendChild(converterSection);
  body.appendChild(currencyListSection);
  body.appendChild(marketplaceSection);
  body.appendChild(marketplaceListSection);
  body.appendChild(energyRecoverySection);
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
          await showSettingsModal();
        });
        
        container.appendChild(button);
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
        
      },
      onRemove: () => {
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
  // Store context for settings application
  wxtContext = ctx;
  
  createModal(ctx);
  createSettingsButton(ctx);
  
}

/**
 * Cleans up settings modal components
 */
export function cleanupSettingsModal(): void {
  
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
  
}