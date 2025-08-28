/**
 * Custom dropdown utilities for currency selection
 * Extracted from ui.ts to improve modularity and reusability
 */

import { CONFIG, getConversionDisplayText, type ConversionKey } from '../config';
import { getAllValidConversions } from './validation';

/**
 * Callback functions interface for dropdown events
 */
export interface DropdownCallbacks {
  /** Called when a user selects a new currency option */
  onSelectionChange: (newSelection: ConversionKey) => void;
}

/**
 * Creates dropdown option elements for all available conversions
 * @param callbacks - Callback functions for dropdown events
 * @returns HTML element containing all dropdown options
 */
export function createDropdownOptions(callbacks: DropdownCallbacks): HTMLElement {
  const optionsContainer = document.createElement('div');
  optionsContainer.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${CONFIG.CSS_TOKENS.COLORS.PRIMARY_BG};
    border: 1px solid ${CONFIG.CSS_TOKENS.COLORS.BORDER_PRIMARY};
    border-radius: 0 0 ${CONFIG.CSS_TOKENS.SPACING.BORDER_RADIUS_SM} ${CONFIG.CSS_TOKENS.SPACING.BORDER_RADIUS_SM};
    border-top: none;
    max-height: ${CONFIG.CSS_TOKENS.SIZES.OPTIONS_MAX_HEIGHT};
    overflow-y: auto;
    z-index: 1000;
    display: none;
  `;

  // Generate options for all available conversions
  const availableConversions = getAllValidConversions();
  availableConversions.forEach(conversionKey => {
    const option = createDropdownOption(conversionKey);
    optionsContainer.appendChild(option);
  });

  // Add event listener for option selection
  optionsContainer.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.dataset.value) {
      callbacks.onSelectionChange(target.dataset.value);
    }
  });

  return optionsContainer;
}

/**
 * Creates a single dropdown option element
 * @param conversionKey - The conversion key for this option
 * @returns HTML element representing the dropdown option
 */
function createDropdownOption(conversionKey: ConversionKey): HTMLElement {
  const option = document.createElement('div');
  option.style.cssText = `
    padding: 6px 8px;
    color: ${CONFIG.CSS_TOKENS.COLORS.TEXT_PRIMARY};
    font-family: ${CONFIG.CSS_TOKENS.FONTS.FAMILY_PRIMARY};
    border-bottom: 1px solid ${CONFIG.CSS_TOKENS.COLORS.BORDER_PRIMARY};
  `;
  option.textContent = getConversionDisplayText(conversionKey);
  option.dataset.value = conversionKey;
  
  // Add hover effects
  option.addEventListener('mouseenter', () => {
    option.style.backgroundColor = CONFIG.CSS_TOKENS.COLORS.HOVER_BG;
  });
  
  option.addEventListener('mouseleave', () => {
    option.style.backgroundColor = CONFIG.CSS_TOKENS.COLORS.TRANSPARENT;
  });

  return option;
}

/**
 * Creates the dropdown button (shows current selection)
 * @param currentSelection - The currently selected conversion
 * @returns Object containing the button element, selection span, arrow, and update function
 * @example
 * const { element, updateSelection } = createDropdownButton('usd');
 * container.appendChild(element);
 * updateSelection('eur'); // Updates the displayed selection
 */
export function createDropdownButton(currentSelection: ConversionKey) {
  const dropdownButton = document.createElement('div');
  dropdownButton.style.cssText = CONFIG.CSS_STYLES.DROPDOWN_STYLES + ' display: flex; align-items: center;';
  
  // Current selection display
  const currentSelectionSpan = document.createElement('span');
  currentSelectionSpan.textContent = getConversionDisplayText(currentSelection);
  
  // Dropdown arrow
  const dropdownArrow = document.createElement('span');
  dropdownArrow.textContent = '▼';
  dropdownArrow.style.cssText = 'font-size: 10px;';
  
  dropdownButton.appendChild(currentSelectionSpan);
  dropdownButton.appendChild(dropdownArrow);

  return {
    element: dropdownButton,
    selectionSpan: currentSelectionSpan,
    arrow: dropdownArrow,
    updateSelection: (newSelection: ConversionKey) => {
      currentSelectionSpan.textContent = getConversionDisplayText(newSelection);
    }
  };
}

/**
 * Sets up dropdown toggle behavior with click handlers and outside-click detection
 * @param button - The dropdown button element
 * @param arrow - The dropdown arrow element  
 * @param optionsContainer - The options container element
 * @returns Cleanup function for removing event listeners
 * @example
 * const cleanup = setupDropdownToggle(button, arrow, options);
 * // Later, when component unmounts:
 * cleanup();
 */
export function setupDropdownToggle(
  button: HTMLElement, 
  arrow: HTMLElement, 
  optionsContainer: HTMLElement
): () => void {
  let isOpen = false;
  
  // Toggle dropdown on button click
  const buttonClickHandler = (e: Event) => {
    e.stopPropagation();
    isOpen = !isOpen;
    optionsContainer.style.display = isOpen ? 'block' : 'none';
    arrow.textContent = isOpen ? '▲' : '▼';
  };

  // Close dropdown when clicking outside
  const documentClickHandler = () => {
    if (isOpen) {
      isOpen = false;
      optionsContainer.style.display = 'none';
      arrow.textContent = '▼';
    }
  };

  button.addEventListener('click', buttonClickHandler);
  document.addEventListener('click', documentClickHandler);

  // Return cleanup function
  return () => {
    button.removeEventListener('click', buttonClickHandler);
    document.removeEventListener('click', documentClickHandler);
  };
}