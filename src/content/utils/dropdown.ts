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
  optionsContainer.classList.add(CONFIG.CSS_CLASSES.DROPDOWN_OPTIONS);

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
  option.classList.add(CONFIG.CSS_CLASSES.DROPDOWN_OPTION);
  option.textContent = getConversionDisplayText(conversionKey);
  option.dataset.value = conversionKey;
  
  // Hover effects are now handled by CSS :hover pseudo-class
  // No need for JavaScript event listeners

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
  dropdownButton.classList.add(CONFIG.CSS_CLASSES.DROPDOWN_BUTTON);
  
  // Current selection display
  const currentSelectionSpan = document.createElement('span');
  currentSelectionSpan.textContent = getConversionDisplayText(currentSelection);
  
  // Dropdown arrow
  const dropdownArrow = document.createElement('span');
  dropdownArrow.textContent = '▼';
  dropdownArrow.classList.add(CONFIG.CSS_CLASSES.DROPDOWN_ARROW);
  
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