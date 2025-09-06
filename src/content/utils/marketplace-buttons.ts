// ============= MARKETPLACE BUTTONS MODULE =============
// Single Responsibility: Manage marketplace integration buttons for horses

import { CONFIG, debugLog } from '../config';
import { loadMarketplaceSettings, loadEnabledMarketplaces } from '../storage';
import type { HorseInfo } from './horse-data-extractor';

/**
 * Creates marketplace buttons (Ronin Market and OpenSea) for each horse
 */
export async function addMarketplaceButtons(horses: HorseInfo[]): Promise<void> {
  // Clean up any existing marketplace buttons first
  cleanupMarketplaceButtons();
  
  // Load marketplace settings first
  const marketplaceLinksEnabled = await loadMarketplaceSettings();
  const enabledMarketplaces = await loadEnabledMarketplaces();
  
  // If marketplace links are disabled, don't add any buttons
  if (!marketplaceLinksEnabled) {
    debugLog('Marketplace links disabled - skipping button creation');
    return;
  }
  
  // If no marketplaces are enabled, don't add any buttons
  if (enabledMarketplaces.length === 0) {
    debugLog('No marketplaces enabled - skipping button creation');
    return;
  }
  
  if (horses.length === 0) {
    debugLog('No horses found for marketplace buttons');
    return;
  }
  
  debugLog(`Adding marketplace buttons for ${horses.length} horses with enabled marketplaces:`, enabledMarketplaces);
  
  horses.forEach((horse: HorseInfo) => {
    // Find the horse ID element using the same selector as in extractHorseData
    const horseElements = document.querySelectorAll('[class*="styles_singleHorse__"]');
    
    // Find the specific horse element by looking for its ID
    let targetHorseElement: HTMLElement | null = null;
    horseElements.forEach(element => {
      const idElement = element.querySelector('[class*="styles_horseId__"]');
      const elementId = parseInt(idElement?.textContent?.trim() || '0');
      if (elementId === horse.id) {
        targetHorseElement = element as HTMLElement;
      }
    });
    
    if (!targetHorseElement) {
      debugLog(`Could not find horse element for ID ${horse.id}`);
      return;
    }
    
    const idElement = targetHorseElement.querySelector('[class*="styles_horseId__"]') as HTMLElement;
    if (!idElement) {
      debugLog(`Could not find ID element for horse ${horse.id}`);
      return;
    }
    
    // Store the original ID text content
    const originalText = idElement.textContent || '';
    
    // Clear the element and create text span and buttons container
    idElement.innerHTML = '';
    
    // Apply flexbox styling to ID container for button alignment
    idElement.classList.add(CONFIG.CSS_CLASSES.HORSE_ID_CONTAINER);
    
    // Create span for ID text
    const idTextSpan = document.createElement('span');
    idTextSpan.textContent = originalText;
    
    // Create marketplace buttons container
    const buttonsContainer = document.createElement('span');
    buttonsContainer.className = CONFIG.CSS_CLASSES.MARKETPLACE_BUTTONS_CONTAINER;
    
    // Determine URLs based on generation
    let roninUrl: string;
    let openseaUrl: string;
    
    if (horse.generation === 0) {
      roninUrl = `${CONFIG.MARKETPLACE_URLS.RONIN_BASE}${CONFIG.MARKETPLACE_URLS.RONIN_ORIGIN_HORSES}/${horse.id}`;
      openseaUrl = `${CONFIG.MARKETPLACE_URLS.OPENSEA_BASE}${CONFIG.MARKETPLACE_URLS.OPENSEA_ORIGIN_HORSES}/${horse.id}`;
    } else {
      roninUrl = `${CONFIG.MARKETPLACE_URLS.RONIN_BASE}${CONFIG.MARKETPLACE_URLS.RONIN_OFFSPRING}/${horse.id}`;
      openseaUrl = `${CONFIG.MARKETPLACE_URLS.OPENSEA_BASE}${CONFIG.MARKETPLACE_URLS.OPENSEA_OFFSPRING}/${horse.id}`;
    }
    
    // Create Ronin Market button only if enabled
    if (enabledMarketplaces.includes('ronin')) {
      const roninButton = document.createElement('a');
      roninButton.href = roninUrl;
      roninButton.target = '_blank';
      roninButton.rel = 'noopener noreferrer';
      roninButton.className = `${CONFIG.CSS_CLASSES.MARKETPLACE_BUTTON} ${CONFIG.CSS_CLASSES.RONIN_BUTTON}`;
      
      // Create image element for wRON icon
      const roninImage = document.createElement('img');
      roninImage.src = CONFIG.MARKETPLACE_IMAGES.RONIN_ICON_URL;
      roninImage.alt = 'wRON';
      roninImage.className = CONFIG.CSS_CLASSES.RONIN_IMAGE;
      roninButton.appendChild(roninImage);
      roninButton.title = 'View on Ronin Market';
      buttonsContainer.appendChild(roninButton);
    }
    
    // Create OpenSea button only if enabled
    if (enabledMarketplaces.includes('opensea')) {
      const openseaButton = document.createElement('a');
      openseaButton.href = openseaUrl;
      openseaButton.target = '_blank';
      openseaButton.rel = 'noopener noreferrer';
      openseaButton.className = `${CONFIG.CSS_CLASSES.MARKETPLACE_BUTTON} ${CONFIG.CSS_CLASSES.OPENSEA_BUTTON}`;
      
      // Create image element for OpenSea icon
      const openseaImage = document.createElement('img');
      openseaImage.src = CONFIG.MARKETPLACE_IMAGES.OPENSEA_ICON_URL;
      openseaImage.alt = 'OpenSea';
      openseaImage.className = CONFIG.CSS_CLASSES.OPENSEA_IMAGE;
      openseaButton.appendChild(openseaImage);
      openseaButton.title = 'View on OpenSea';
      buttonsContainer.appendChild(openseaButton);
    }
    
    // Only add the buttons container if it has buttons
    if (buttonsContainer.children.length > 0) {
      // Add both text and buttons to the ID element
      idElement.appendChild(idTextSpan);
      idElement.appendChild(buttonsContainer); 
    } else {
      // Just add the text back if no buttons are enabled
      idElement.appendChild(idTextSpan);
      debugLog(`No marketplace buttons added for horse ${horse.id} - no marketplaces enabled`);
    }
  });
  
  debugLog('Marketplace buttons setup complete');
}

/**
 * Removes all existing marketplace buttons and restores original horse ID elements
 * Used when settings change or components are reinitializing
 */
export function cleanupMarketplaceButtons(): void {
  try {
    debugLog('Cleaning up existing marketplace buttons...');
    
    // Find all elements that have marketplace buttons
    const elementsWithButtons = document.querySelectorAll(`.${CONFIG.CSS_CLASSES.MARKETPLACE_BUTTONS_CONTAINER}`);
    
    elementsWithButtons.forEach(buttonContainer => {
      // Find the parent horse ID element
      const idElement = buttonContainer.closest(`[class*="styles_horseId__"]`) as HTMLElement;
      
      if (idElement) {
        // Get the original text from the text span
        const textSpan = idElement.querySelector('span:first-child');
        const originalText = textSpan?.textContent || '';
        
        // Remove the CSS class we added
        idElement.classList.remove(CONFIG.CSS_CLASSES.HORSE_ID_CONTAINER);
        
        // Restore the original simple text content
        idElement.innerHTML = originalText;
        
      }
    });
    
    debugLog('Marketplace buttons cleanup complete');
  } catch (error) {
    debugLog('Error cleaning up marketplace buttons:', error);
  }
}