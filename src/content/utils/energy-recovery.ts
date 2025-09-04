// ============= ENERGY RECOVERY MODULE =============
// Single Responsibility: Manage energy recovery calculations and UI display

import { CONFIG, debugLog, calculateEnergyRecoveryPer6Hours } from '../config';
import { loadEnergyRecoverySettings } from '../storage';
import { createTooltip, type Tooltip } from './tooltip';
import type { HorseInfo } from './horse-data-extractor';

// Track tooltip instances for cleanup
const activeTooltips: Tooltip[] = [];

/**
 * Determines if a horse will lose energy in the next 6-hour period
 * @param horse - Horse data object
 * @returns true if horse will lose energy, false if it will recover
 */
function willLoseEnergyNextRecovery(horse: HorseInfo): boolean {
  const currentEnergy = horse.stats?.energy?.current || 0;
  const maxEnergy = horse.stats?.energy?.max || 0;
  const recoveryAmount = horse.stats?.energyRecovery6h || 0;
  const status = horse.status || 'UNKNOWN';
  
  // If horse is racing or in active state, it will likely lose energy
  const activeStates = ['RACING', 'BUSY', 'WORKING'];
  if (activeStates.includes(status.toUpperCase())) {
    return true;
  }
  
  // If horse already has full energy, recovery won't help (energy waste)
  if (currentEnergy >= maxEnergy) {
    return true;
  }
  
  // If horse has very high energy relative to recovery (close to max), might be wasted
  const energyAfterRecovery = currentEnergy + recoveryAmount;
  const wastedEnergy = energyAfterRecovery - maxEnergy;
  if (wastedEnergy > 0) { // Any energy waste should show warning color
    return true;
  }
  
  return false;
}

/**
 * Adds energy recovery information to horse cards
 * Modifies energy display to show recovery per 6 hours: "ENERGY: X/Y (+Z)" or "ENERGY: X/Y (-Z)"
 */
export async function addEnergyRecoveryInfo(horses: HorseInfo[]): Promise<void> {
  // Check if energy recovery info is enabled via storage settings
  const energyRecoveryEnabled = await loadEnergyRecoverySettings();
  if (!energyRecoveryEnabled) {
    debugLog('Energy recovery info disabled - skipping info display');
    return;
  }
  
  // Clean up any existing energy recovery info first
  cleanupEnergyRecoveryInfo();
  
  if (horses.length === 0) {
    debugLog('No horses found for energy recovery info');
    return;
  }
  
  debugLog(`Adding energy recovery info for ${horses.length} horses`);
  
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
    
    // Find the energy description element within this horse card
    const descriptions = targetHorseElement.querySelectorAll('[class*="styles_horseItemDescription__"]');
    let energyDescriptionElement: HTMLElement | null = null;
    
    descriptions.forEach(desc => {
      const text = desc.textContent?.trim() || '';
      if (text.startsWith('ENERGY:')) {
        energyDescriptionElement = desc as HTMLElement;
      }
    });
    
    if (!energyDescriptionElement) {
      debugLog(`Could not find energy element for horse ${horse.id}`);
      return;
    }
    
    // Store the original HTML content to preserve formatting when cleaning up
    const originalHTML = energyDescriptionElement.innerHTML || '';
    const originalText = energyDescriptionElement.textContent || '';
    
    // Only proceed if we haven't already modified this element
    if (originalText.includes(' +') || originalText.includes(' -') || originalText.includes(' ±')) {
      return;
    }
    
    // Store original HTML for cleanup using a data attribute
    energyDescriptionElement.setAttribute('data-phorse-original-html', originalHTML);
    
    // Calculate energy recovery (use stored value or calculate from level)
    const recoveryPer6h = horse.stats?.energyRecovery6h || calculateEnergyRecoveryPer6Hours(horse.stats?.level || 1);
    
    // Determine if horse will lose energy instead of recovering
    const willLoseEnergy = willLoseEnergyNextRecovery(horse);
    
    // Parse original text to separate "ENERGY:" from numbers
    const energyParts = originalText.split('ENERGY:');
    const energyLabel = 'ENERGY:';
    const energyNumbers = energyParts[1]?.trim() || '';
    
    // Clear the element and create structured content
    energyDescriptionElement.innerHTML = '';
    energyDescriptionElement.classList.add(CONFIG.CSS_CLASSES.ENERGY_DISPLAY_CONTAINER);
    
    // Create text node for "ENERGY:" (no span, no styling)
    const energyLabelText = document.createTextNode(energyLabel + ' ');
    
    // Create span for energy numbers only (inherits original styles including font-weight)
    const energyNumbersSpan = document.createElement('span');
    energyNumbersSpan.textContent = energyNumbers;
    
    // Create span for recovery/loss info
    const recoverySpan = document.createElement('span');
    
    if (willLoseEnergy) {
      // Show energy loss or waste in red
      const currentEnergy = horse.stats?.energy?.current || 0;
      const maxEnergy = horse.stats?.energy?.max || 0;
      const status = horse.status || 'UNKNOWN';
      
      if (['RACING', 'BUSY', 'WORKING'].includes(status.toUpperCase())) {
        // Horse is active and will lose energy
        recoverySpan.textContent = ` -${Math.floor(recoveryPer6h * 0.5)}`;
        
        // Create tooltip for energy loss due to negative status
        const lossTooltip = createTooltip(recoverySpan, {
          title: 'Energy Loss',
          description: `Will lose approximately ${Math.floor(recoveryPer6h * 0.5)} energy every 6 hours<br>Horse status: <strong>${status}</strong>`,
          additionalInfo: `Energy loss occurs while horse is <strong>${status.toLowerCase()}</strong>`
        });
        activeTooltips.push(lossTooltip);
      } else if (currentEnergy >= maxEnergy) {
        // Horse has full energy, recovery wasted
        recoverySpan.textContent = ` ±0`;
        
        // Create tooltip for full energy waste
        const fullTooltip = createTooltip(recoverySpan, {
          title: 'Energy Full',
          description: `Energy is at maximum capacity<br>Recovery of ${recoveryPer6h} will be completely wasted every 6 hours`,
          usesLeft: `(${recoveryPer6h} wasted)`,
          additionalInfo: `Consider using this horse to prevent energy waste!`
        });
        activeTooltips.push(fullTooltip);
      } else {
        // Partial recovery waste
        const energyAfterRecovery = currentEnergy + recoveryPer6h;
        const wastedEnergy = Math.max(0, energyAfterRecovery - maxEnergy);
        const effectiveRecovery = recoveryPer6h - wastedEnergy;
        recoverySpan.textContent = ` +${effectiveRecovery}`;
        
        // Create rich tooltip for energy recovery with waste info
        const tooltip = createTooltip(recoverySpan, {
          title: 'Energy Recovery',
          description: `Will recover ${effectiveRecovery} energy every 6 hours<br>${wastedEnergy} energy will be wasted due to max capacity`,
          usesLeft: `(${wastedEnergy} wasted)`,
          additionalInfo: `This horse can only hold <strong>${maxEnergy}</strong> energy maximum!`
        });
        activeTooltips.push(tooltip);
      }
      recoverySpan.className = CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT_NEGATIVE;
    } else {
      // Show normal energy recovery in green
      recoverySpan.textContent = ` +${recoveryPer6h}`;
      recoverySpan.className = CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT;
      
      // Create tooltip for normal energy recovery
      const normalTooltip = createTooltip(recoverySpan, {
        title: 'Energy Recovery',
        description: `Recovers ${recoveryPer6h} energy every 6 hours`,
        additionalInfo: `This horse is efficiently recovering energy with no waste!`
      });
      activeTooltips.push(normalTooltip);
    }
    
    // Add all elements to the energy element
    energyDescriptionElement.appendChild(energyLabelText);        // "ENERGY: " (plain text)
    energyDescriptionElement.appendChild(energyNumbersSpan);     // "1/72" (bold)
    energyDescriptionElement.appendChild(recoverySpan);          // " +15" (colored)
    });
  
  debugLog('Energy recovery info setup complete');
}

/**
 * Removes all existing energy recovery info and restores original energy display
 * Used when settings change or components are reinitializing
 */
export function cleanupEnergyRecoveryInfo(): void {
  try {
    debugLog('Cleaning up existing energy recovery info...');
    
    // First cleanup all tooltips
    cleanupTooltips();
    
    // Find all elements that have energy recovery info
    const elementsWithRecoveryInfo = document.querySelectorAll(`.${CONFIG.CSS_CLASSES.ENERGY_DISPLAY_CONTAINER}`);
    
    elementsWithRecoveryInfo.forEach(energyContainer => {
      // Get the stored original HTML content that preserves formatting
      const originalHTML = energyContainer.getAttribute('data-phorse-original-html');
      
      if (originalHTML) {
        // Remove the CSS classes we added
        energyContainer.classList.remove(CONFIG.CSS_CLASSES.ENERGY_DISPLAY_CONTAINER);
        
        // Remove the data attribute
        energyContainer.removeAttribute('data-phorse-original-html');
        
        // Restore the original HTML content to preserve formatting (bold, etc.)
        energyContainer.innerHTML = originalHTML;
        
      } else {
        // Fallback to text-based cleanup for elements that don't have stored HTML
        let originalText = '';
        energyContainer.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            originalText += node.textContent || '';
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (!element.classList.contains(CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT) && 
                !element.classList.contains(CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT_NEGATIVE)) {
              originalText += element.textContent || '';
            }
          }
        });
        originalText = originalText.trim();
        
        if (originalText) {
          // Remove the CSS classes we added
          energyContainer.classList.remove(CONFIG.CSS_CLASSES.ENERGY_DISPLAY_CONTAINER);
          
          // Restore the original simple text content (fallback)
          energyContainer.innerHTML = originalText;
          
        }
      }
    });
    
    debugLog('Energy recovery info cleanup complete');
  } catch (error) {
    debugLog('Error cleaning up energy recovery info:', error);
  }
}

/**
 * Cleans up all active tooltip instances
 * Used when settings change or components are reinitializing
 */
export function cleanupTooltips(): void {
  try {
    debugLog('Cleaning up active tooltips...');
    
    // Destroy all active tooltips
    activeTooltips.forEach(tooltip => {
      tooltip.destroy();
    });
    
    // Clear the array
    activeTooltips.length = 0;
    
    debugLog('Tooltips cleanup complete');
  } catch (error) {
    debugLog('Error cleaning up tooltips:', error);
  }
}