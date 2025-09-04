import { CONFIG, debugLog, getConversionDisplayText, type ConversionKey } from './config';
import { getConvertedPrice } from './api';
import { getCurrentConversion, setCurrentConversion, setIsReconnecting, setHasBeenAuthenticated } from './state';
import { formatPrice } from './utils/formatting';
import { createDropdownOptions, createDropdownButton, setupDropdownToggle, type DropdownCallbacks } from './utils/dropdown';
import { restartHorseAnalyzer } from './main';

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
    onMount: async (container) => {
      const balanceElement = document.getElementById(CONFIG.BALANCE_ELEMENT_ID);
      if (!balanceElement) {
        debugLog('Balance element not found during currency UI mount');
        return;
      }

      // Set up grid layout on the anchor element (styles_currencyGroup__)
      const gridContainer = container.parentElement as HTMLElement | null;
      if (gridContainer && gridContainer.className.includes(CONFIG.CSS_CLASSES.CURRENCY_GROUP_PREFIX)) {
        gridContainer.classList.add(CONFIG.CSS_CLASSES.GRID_LAYOUT);
      }

      // Make WXT container transparent to grid layout
      container.classList.add(CONFIG.CSS_CLASSES.DISPLAY_CONTENTS);

      // Style the balance element for grid positioning
      balanceElement.classList.add(CONFIG.CSS_CLASSES.TEXT_CENTER);
      balanceElement.classList.add(CONFIG.CSS_CLASSES.GRID_BALANCE);

      // Create custom dropdown container
      const dropdownContainer = document.createElement('div');
      dropdownContainer.classList.add(CONFIG.CSS_CLASSES.CURRENCY_SELECTOR);
      dropdownContainer.classList.add(CONFIG.CSS_CLASSES.DROPDOWN_CONTAINER);
      dropdownContainer.classList.add(CONFIG.CSS_CLASSES.GRID_DROPDOWN);
      
      // Create dropdown button using utility
      const dropdownButtonComponents = createDropdownButton(getCurrentConversion());
      const { element: dropdownButton, updateSelection } = dropdownButtonComponents;
      
      // Create converted price span (defined here so it can be used in callbacks)
      const convertedPrice = document.createElement('span');
      convertedPrice.classList.add(CONFIG.CSS_CLASSES.CONVERTED_PRICE);
      convertedPrice.classList.add(CONFIG.CSS_CLASSES.TEXT_CENTER);
      convertedPrice.classList.add(CONFIG.CSS_CLASSES.GRID_CONVERTED);
      
      // Create dropdown options using utility (now async)
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
      
      const optionsContainer = await createDropdownOptions(dropdownCallbacks);
      
      // Assemble dropdown
      dropdownContainer.appendChild(dropdownButton);
      dropdownContainer.appendChild(optionsContainer);
      
      // Setup dropdown toggle behavior
      const cleanupDropdown = setupDropdownToggle(
        dropdownButton, 
        dropdownButtonComponents.arrow, 
        optionsContainer
      );

      // Calculate and display initial converted price
      const convertedValue = getConvertedPrice(getCurrentConversion(), balanceElement.textContent || '0');
      convertedPrice.textContent = formatPrice(convertedValue);

      // Balance change detection via polling
      let lastBalance = balanceElement.textContent || '0';
      const balancePoller = setInterval(() => {
        const currentBalance = balanceElement.textContent || '0';
        if (currentBalance !== lastBalance) {
          // Detect user disconnection: balance changes from > 0 to 0
          const lastBalanceNum = parseFloat(lastBalance) || 0;
          const currentBalanceNum = parseFloat(currentBalance) || 0;
          if (lastBalanceNum > 0 && currentBalanceNum === 0) {
            debugLog('User disconnection detected - balance changed from positive to zero');
            setHasBeenAuthenticated(false); // Reset authentication state using centralized flag
          }
          
          // Detect user reconnection: balance changes from 0 to positive
          if (lastBalanceNum === 0 && currentBalanceNum > 0) {
            debugLog('User reconnection detected - balance changed from zero to positive');
            setIsReconnecting(true); // Set reconnection flag for coordination
            // The horse analyzer will check this flag and handle reconnection appropriately
          }
          
          lastBalance = currentBalance;
          // Update converted price when balance changes
          const newConvertedValue = getConvertedPrice(getCurrentConversion(), currentBalance);
          convertedPrice.textContent = formatPrice(newConvertedValue);
          debugLog(`Balance changed to: ${currentBalance}, converted: ${formatPrice(newConvertedValue)}`);
        }
      }, 500);

      // Apply icon styles to ensure consistent display
      const phorseIcon = gridContainer?.querySelector('img[alt="phorse"], img[alt="phorse coin"]') as HTMLImageElement | null;
      const phorseIconContainer = phorseIcon?.parentElement;
      if (phorseIconContainer) {
        phorseIconContainer.classList.add(CONFIG.CSS_CLASSES.GRID_ICON);
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
