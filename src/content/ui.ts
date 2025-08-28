import { CONFIG, debugLog, getConversionDisplayText, type ConversionKey } from './config';
import { getConvertedPrice } from './api';
import { getCurrentConversion, setCurrentConversion } from './state';
import { formatPrice } from './utils/formatting';
import { createDropdownOptions, createDropdownButton, setupDropdownToggle, type DropdownCallbacks } from './utils/dropdown';

// Removed WeakMap cache - elements recreate frequently in SPA navigation

/**
 * Creates a WXT UI component for currency conversion display
 * Replaces manual DOM manipulation with native WXT component
 * @param ctx - WXT content script context
 * @returns WXT UI component that handles currency conversion
 */
export function createCurrencyConversionUI(ctx: any) {
  return createIntegratedUi(ctx, {
    position: 'inline',
    anchor: `[class*="${CONFIG.CSS_CLASSES.CURRENCY_GROUP_PREFIX}"]`,
    onMount: (container) => {
      const balanceElement = document.getElementById(CONFIG.BALANCE_ELEMENT_ID);
      if (!balanceElement) {
        debugLog('Balance element not found during currency UI mount');
        return;
      }

      // Set up grid layout on the anchor element (styles_currencyGroup__)
      const gridContainer = container.parentElement as HTMLElement | null;
      if (gridContainer && gridContainer.className.includes(CONFIG.CSS_CLASSES.CURRENCY_GROUP_PREFIX)) {
        gridContainer.style.cssText = CONFIG.CSS_STYLES.GRID_LAYOUT;
      }

      // Make WXT container transparent to grid layout
      container.style.cssText = CONFIG.CSS_STYLES.DISPLAY_CONTENTS;

      // Style the balance element for grid positioning
      balanceElement.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER + ' ' + CONFIG.CSS_STYLES.GRID_BALANCE;

      // Create custom dropdown container
      const dropdownContainer = document.createElement('div');
      dropdownContainer.classList.add(CONFIG.CSS_CLASSES.CURRENCY_SELECTOR);
      dropdownContainer.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER + ' ' + CONFIG.CSS_STYLES.GRID_DROPDOWN + ' ' + CONFIG.CSS_STYLES.POSITION_RELATIVE;
      
      // Create dropdown button using utility
      const dropdownButtonComponents = createDropdownButton(getCurrentConversion());
      const { element: dropdownButton, updateSelection } = dropdownButtonComponents;
      
      // Create dropdown options using utility
      const dropdownCallbacks: DropdownCallbacks = {
        onSelectionChange: (newCurrency: ConversionKey) => {
          // Update current selection display
          updateSelection(newCurrency);
          
          // Update conversion state
          setCurrentConversion(newCurrency);
          
          // Update converted price immediately
          const newConvertedValue = getConvertedPrice(newCurrency, balanceElement.textContent || '0');
          convertedPrice.textContent = formatPrice(newConvertedValue);
          
          debugLog(`Currency changed to: ${newCurrency}`);
        }
      };
      
      const optionsContainer = createDropdownOptions(dropdownCallbacks);
      
      // Assemble dropdown
      dropdownContainer.appendChild(dropdownButton);
      dropdownContainer.appendChild(optionsContainer);
      
      // Setup dropdown toggle behavior
      const cleanupDropdown = setupDropdownToggle(
        dropdownButton, 
        dropdownButtonComponents.arrow, 
        optionsContainer
      );

      // Create converted price span
      const convertedPrice = document.createElement('span');
      convertedPrice.classList.add(CONFIG.CSS_CLASSES.CONVERTED_PRICE);
      convertedPrice.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER + ' ' + CONFIG.CSS_STYLES.GRID_CONVERTED;

      // Calculate and display initial converted price
      const convertedValue = getConvertedPrice(getCurrentConversion(), balanceElement.textContent || '0');
      convertedPrice.textContent = formatPrice(convertedValue);

      // Balance change detection via polling
      let lastBalance = balanceElement.textContent || '0';
      const balancePoller = setInterval(() => {
        const currentBalance = balanceElement.textContent || '0';
        if (currentBalance !== lastBalance) {
          lastBalance = currentBalance;
          // Update converted price when balance changes
          const newConvertedValue = getConvertedPrice(getCurrentConversion(), currentBalance);
          convertedPrice.textContent = formatPrice(newConvertedValue);
          debugLog(`Balance changed to: ${currentBalance}, converted: ${formatPrice(newConvertedValue)}`);
        }
      }, 500);

      // Apply icon styles to ensure consistent display
      const phorseIcon = gridContainer?.querySelector('img[alt="phorse"], img[alt="phorse coin"]') as HTMLImageElement | null;
      if (phorseIcon) {
        phorseIcon.style.cssText += ' ' + CONFIG.CSS_STYLES.GRID_ICON;
      }

      // Add elements to container (WXT will handle positioning)
      container.appendChild(dropdownContainer);
      container.appendChild(convertedPrice);

      debugLog('Currency conversion UI mounted via WXT component');

      // Return cleanup function for unmounting
      return () => {
        clearInterval(balancePoller);
        cleanupDropdown();
        debugLog('Currency conversion UI unmounted');
      };
    },
    onRemove: (cleanupFn) => {
      if (cleanupFn && typeof cleanupFn === 'function') {
        cleanupFn();
      }
    }
  });
}

// Obsolete functions moved to utils/formatting.ts and utils/dropdown.ts
// This promotes modularity and reusability while following DRY principles

// Legacy functions removed and replaced:
// - calculateConvertedPrice() -> utils/formatting.ts
// - formatPrice() -> utils/formatting.ts
// - Custom dropdown logic -> utils/dropdown.ts utilities
// - Validation logic -> utils/validation.ts

// WXT component patterns maintained with improved modular architecture

