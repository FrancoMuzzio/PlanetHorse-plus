// ============= ENERGY RECOVERY MODULE =============
// Single Responsibility: Manage energy recovery calculations and UI display

import { CONFIG, debugLog, calculateEnergyRecoveryPer6Hours } from '../config';
import { loadEnergyRecoverySettings } from '../storage';
import { createTooltip, type Tooltip } from './tooltip';
import type { HorseInfo } from './horse-data-extractor';

// Track tooltip instances for cleanup
const activeTooltips: Tooltip[] = [];

/**
 * Determines if a horse is actively losing energy (racing/working)
 * @param horse - Horse data object
 * @returns true if horse is actively losing energy, false if it's recovering
 */
function isHorseActivelyLosingEnergy(horse: HorseInfo): boolean {
  const status = horse.status || 'UNKNOWN';
  
  // Only horses in active states will actually lose energy
  const activeStates = ['RACING', 'BUSY', 'WORKING'];
  return activeStates.includes(status.toUpperCase());
}

/**
 * Extracts energy values from text like "ENERGY: 4/12"
 * @param text - The energy text from DOM element
 * @returns Object with current and max energy values
 */
function extractEnergyFromText(text: string): { current: number; max: number } {
  const energyText = text.replace('ENERGY:', '').trim();
  const [current, max] = energyText.split('/').map(s => parseInt(s.trim()));
  return {
    current: current || 0,
    max: max || 0
  };
}

/**
 * Finds the energy description element for a given horse element
 * @param horseElement - The horse card element
 * @returns The energy description element or null if not found
 */
function findEnergyElement(horseElement: HTMLElement): HTMLElement | null {
  const descriptions = horseElement.querySelectorAll('[class*="styles_horseItemDescription__"]');
  
  for (const desc of descriptions) {
    const text = desc.textContent?.trim() || '';
    if (text.startsWith('ENERGY:')) {
      return desc as HTMLElement;
    }
  }
  
  return null;
}

/**
 * Adds energy recovery information to horse cards (NON-INVASIVE VERSION)
 * Appends recovery info without modifying original energy display
 */
export async function addEnergyRecoveryInfo(horses: HorseInfo[]): Promise<void> {
  // Check if energy recovery info is enabled via storage settings
  const energyRecoveryEnabled = await loadEnergyRecoverySettings();
  if (!energyRecoveryEnabled) {
    debugLog('Energy recovery info disabled - skipping info display');
    return;
  }
  
  if (horses.length === 0) {
    debugLog('No horses found for energy recovery info');
    return;
  }
  
  debugLog(`Adding energy recovery info for ${horses.length} horses (non-invasive)`);
  
  horses.forEach((horse: HorseInfo) => {
    addEnergyRecoveryInfoToSingleHorse(horse);
  });
  
  debugLog('Energy recovery info setup complete');
}

/**
 * Non-invasive function to add energy recovery info to a single horse
 * @param horse - Horse data object
 */
function addEnergyRecoveryInfoToSingleHorse(horse: HorseInfo): void {
  // Find the horse element
  const horseElements = document.querySelectorAll('[class*="styles_singleHorse__"]');
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
  
  // Find energy element using helper function
  const energyDescriptionElement = findEnergyElement(targetHorseElement);
  if (!energyDescriptionElement) {
    debugLog(`Could not find energy element for horse ${horse.id}`);
    return;
  }
  
  // Remove any existing recovery span first (for refresh scenarios)
  const existingRecoverySpan = energyDescriptionElement.querySelector(
    `.${CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT}, .${CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT_NEGATIVE}`
  );
  if (existingRecoverySpan) {
    existingRecoverySpan.remove();
  }
  
  // Get current energy values directly from DOM (game-controlled)
  const currentEnergyText = energyDescriptionElement.textContent || '';
  const { current: currentEnergy, max: maxEnergy } = extractEnergyFromText(currentEnergyText);
  
  // Calculate recovery based on horse level
  const recoveryPer6h = horse.stats?.energyRecovery6h || calculateEnergyRecoveryPer6Hours(horse.stats?.level || 1);
  const status = horse.status || 'UNKNOWN';
  
  // Create recovery span
  const recoverySpan = document.createElement('span');
  
  // Determine recovery info based on horse state
  if (isHorseActivelyLosingEnergy(horse)) {
    // Horse is actively losing energy - show estimated loss
    const estimatedLoss = Math.floor(recoveryPer6h * 0.5);
    recoverySpan.textContent = ` –${estimatedLoss}`;
    recoverySpan.className = CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT_NEGATIVE;
    
    // Create tooltip for energy loss due to active status
    const lossTooltip = createTooltip(recoverySpan, {
      title: 'Energy Loss',
      description: `Will lose approximately ${estimatedLoss} energy on next recharge.<br>Horse status: <strong>${status}</strong>.`,
      additionalInfo: `Energy loss occurs while horse is <strong>${status.toLowerCase()}</strong>`
    });
    activeTooltips.push(lossTooltip);
  } else {
    // Horse is recovering - check for energy waste
    const energyAfterRecovery = currentEnergy + recoveryPer6h;
    const wastedEnergy = Math.max(0, energyAfterRecovery - maxEnergy);
    
    if (wastedEnergy > 0) {
      // Show wasted energy in red (negative)
      recoverySpan.textContent = ` –${wastedEnergy}`;
      recoverySpan.className = CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT_NEGATIVE;
      
      // Create tooltip for energy waste
      const wasteTooltip = createTooltip(recoverySpan, {
        title: 'Energy Waste',
        description: `${wastedEnergy} energy will be wasted on next recharge.<br>Horse will reach maximum capacity (${maxEnergy}).`,
        additionalInfo: `Consider using this horse to prevent energy waste!`
      });
      activeTooltips.push(wasteTooltip);
    } else {
      // Show full recovery in green (positive)
      recoverySpan.textContent = ` +${recoveryPer6h}`;
      recoverySpan.className = CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT;
      
      // Create tooltip for normal energy recovery
      const recoveryTooltip = createTooltip(recoverySpan, {
        title: 'Energy Recovery',
        description: `Will recover ${recoveryPer6h} energy with no waste on next recharge.`,
        additionalInfo: `This horse is efficiently recovering energy!`
      });
      activeTooltips.push(recoveryTooltip);
    }
  }
  
  // APPEND recovery span (NON-INVASIVE)
  energyDescriptionElement.appendChild(recoverySpan);
  
  debugLog(`Added energy recovery info to horse ${horse.id}: ${currentEnergy}/${maxEnergy} ${recoverySpan.textContent}`);
}

/**
 * Removes all existing energy recovery info (NON-INVASIVE VERSION)
 * Simply removes the recovery spans without affecting game-controlled content
 */
export function cleanupEnergyRecoveryInfo(): void {
  try {
    debugLog('Cleaning up existing energy recovery info (non-invasive)...');
    
    // First cleanup all tooltips
    cleanupTooltips();
    
    // Find and remove all energy recovery spans
    const recoverySpans = document.querySelectorAll(
      `.${CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT}, .${CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT_NEGATIVE}`
    );
    
    recoverySpans.forEach(span => {
      span.remove();
    });
    
    debugLog(`Removed ${recoverySpans.length} energy recovery spans`);
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