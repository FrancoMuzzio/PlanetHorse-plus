import { CONFIG, debugLog, getAvailableConversions, getConversionDisplayText, type ConversionKey } from './config';
import { getConvertedPrice } from './api';
import { getCurrentConversion, setCurrentConversion } from './state';
import { createIntegratedUi } from 'wxt/utils/content-script-ui/integrated';

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
      container.style.cssText = 'display: contents;';

      // Style the balance element for grid positioning
      balanceElement.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER + ' ' + CONFIG.CSS_STYLES.GRID_BALANCE;

      // Create currency selector dropdown
      const currencySelector = document.createElement('select');
      currencySelector.classList.add(CONFIG.CSS_CLASSES.CURRENCY_SELECTOR);
      
      // Generate options for all available conversions
      const availableConversions = getAvailableConversions();
      availableConversions.forEach(conversionKey => {
        const option = document.createElement('option');
        option.value = conversionKey;
        option.textContent = getConversionDisplayText(conversionKey);
        currencySelector.appendChild(option);
      });
      
      // Set current selected value
      currencySelector.value = getCurrentConversion();
      
      // Apply dropdown styling from configuration with grid positioning
      currencySelector.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER + ' ' + CONFIG.CSS_STYLES.GRID_DROPDOWN + ' ' + CONFIG.CSS_STYLES.DROPDOWN_STYLES;

      // Create converted price span
      const convertedPrice = document.createElement('span');
      convertedPrice.classList.add(CONFIG.CSS_CLASSES.CONVERTED_PRICE);
      convertedPrice.style.cssText = CONFIG.CSS_STYLES.TEXT_CENTER + ' ' + CONFIG.CSS_STYLES.GRID_CONVERTED;

      // Calculate and display initial converted price
      const convertedValue = getConvertedPrice(getCurrentConversion(), balanceElement.textContent || '0');
      convertedPrice.textContent = formatPrice(convertedValue);

      // Add event listener for currency selector changes
      currencySelector.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        setCurrentConversion(target.value);
        
        // Update converted price immediately
        const newConvertedValue = getConvertedPrice(target.value, balanceElement.textContent || '0');
        convertedPrice.textContent = formatPrice(newConvertedValue);
        
        debugLog(`Currency changed to: ${target.value}`);
      });

      // Apply icon styles to ensure consistent display
      const phorseIcon = gridContainer?.querySelector('img[alt="phorse"], img[alt="phorse coin"]') as HTMLImageElement | null;
      if (phorseIcon) {
        phorseIcon.style.cssText += ' ' + CONFIG.CSS_STYLES.GRID_ICON;
      }

      // Add elements to container (WXT will handle positioning)
      container.appendChild(currencySelector);
      container.appendChild(convertedPrice);

      debugLog('Currency conversion UI mounted via WXT component');

      // Return cleanup function for unmounting
      return () => {
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

// findBalanceElement() removed - WXT components handle element detection automatically

/**
 * Calculates the USD value of the token balance
 * @param balanceText - The balance text to parse
 * @param tokenPrice - The current token price in USD
 * @returns The calculated USD value
 */
function calculateConvertedPrice(balanceText: string, tokenPrice: number): number {
  const balanceValue = parseFloat(balanceText) || 0;
  return balanceValue * tokenPrice;
}

/**
 * Formats a numeric price value for display
 * @param value - The price value to format
 * @returns The formatted price with 2 decimal places
 */
function formatPrice(value: number): string {
  return value.toFixed(2);
}

// Obsolete UI utility functions removed - replaced by WXT component patterns

// createGridElements() removed - replaced by WXT component in createCurrencyConversionUI()

// Main UI functions removed - replaced by WXT component in createCurrencyConversionUI()
// - addConvertedPrice() -> WXT component onMount callback
// - handleCurrencyChange() -> Event listener within WXT component  
// - updateCurrencySelector() -> Direct updates within WXT component
// - updateConvertedPrice() -> Not needed with WXT component reactivity

