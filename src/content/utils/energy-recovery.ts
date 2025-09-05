// ============= ENERGY RECOVERY MODULE =============
// Single Responsibility: Manage energy recovery calculations and UI display

import { CONFIG, debugLog, calculateEnergyRecoveryPer6Hours } from '../config';
import { loadEnergyRecoverySettings } from '../storage';
import { createTooltip, type Tooltip } from './tooltip';
import { extractHorseData, type HorseInfo } from './horse-data-extractor';

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
 * Creates a recovery span element with proper calculation and styling
 * @param horse - Horse data object
 * @param currentEnergy - Current energy value
 * @param maxEnergy - Maximum energy value
 * @returns Configured span element with recovery info
 */
function createRecoverySpan(horse: HorseInfo, currentEnergy: number, maxEnergy: number): HTMLSpanElement {
  const recoveryPer6h = horse.stats?.energyRecovery6h || calculateEnergyRecoveryPer6Hours(horse.stats?.level || 1);
  const status = horse.status || 'UNKNOWN';
  
  const recoverySpan = document.createElement('span');
  recoverySpan.setAttribute('data-horse-id', horse.id.toString());
  
  // Determine recovery info based on horse state
  if (isHorseActivelyLosingEnergy(horse)) {
    // Horse is actively losing energy - show estimated loss
    const estimatedLoss = Math.floor(recoveryPer6h * 0.5);
    recoverySpan.textContent = ` –${estimatedLoss}`;
    recoverySpan.className = CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT_NEGATIVE;
    
    // Create tooltip
    const lossTooltip = createTooltip(recoverySpan, {
      title: 'Energy Loss',
      description: `Will lose approximately ${estimatedLoss} energy on next recharge.<br>Horse status: <strong>${status}</strong>.`,
      additionalInfo: `Energy loss occurs while horse is <strong>${status.toLowerCase()}</strong>`
    });
    activeTooltips.push(lossTooltip);
  } else {
    // Horse is recovering - calculate actual recovery and waste
    const energyNeeded = maxEnergy - currentEnergy;
    const actualRecovery = Math.min(recoveryPer6h, energyNeeded);
    const wastedRecovery = recoveryPer6h - actualRecovery;
    
    debugLog(`Recovery calculation for horse ${horse.id}: energy=${currentEnergy}/${maxEnergy}, recovery=${recoveryPer6h}, needed=${energyNeeded}, actual=${actualRecovery}, waste=${wastedRecovery}`);
    
    if (wastedRecovery > 0) {
      // Can't use all recovery → show waste as negative
      recoverySpan.textContent = ` –${wastedRecovery}`;
      recoverySpan.className = CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT_NEGATIVE;
      
      // Create tooltip
      const wasteTooltip = createTooltip(recoverySpan, {
        title: 'Energy Waste',
        description: `${wastedRecovery} energy will be wasted on next recharge.<br>Horse will recover ${actualRecovery} and reach ${currentEnergy + actualRecovery}/${maxEnergy}.`,
        additionalInfo: `Consider using this horse to prevent energy waste!`
      });
      activeTooltips.push(wasteTooltip);
    } else {
      // Can use all recovery → show full recovery as positive
      recoverySpan.textContent = ` +${recoveryPer6h}`;
      recoverySpan.className = CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT;
      
      // Create tooltip
      const recoveryTooltip = createTooltip(recoverySpan, {
        title: 'Energy Recovery',
        description: `Will recover ${recoveryPer6h} energy with no waste on next recharge.`,
        additionalInfo: `This horse is efficiently recovering energy!`
      });
      activeTooltips.push(recoveryTooltip);
    }
  }
  
  return recoverySpan;
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
  // Use the horse element directly from the horse object if available
  const targetHorseElement = horse.element;
  
  if (!targetHorseElement) {
    debugLog(`No element provided for horse ${horse.id}`);
    return;
  }
  
  // Find energy element using helper function
  const energyDescriptionElement = findEnergyElement(targetHorseElement);
  if (!energyDescriptionElement) {
    debugLog(`Could not find energy element for horse ${horse.id}`);
    return;
  }
  
  // Remove any existing recovery span using the unique data-horse-id
  const existingRecoverySpan = document.querySelector(`[data-horse-id="${horse.id}"]`);
  if (existingRecoverySpan) {
    existingRecoverySpan.remove();
  }
  
  // Use the energy values directly from the horse stats
  const currentEnergy = horse.stats.energy.current;
  const maxEnergy = horse.stats.energy.max;
  
  debugLog(`Adding recovery info for horse ${horse.id}: ${currentEnergy}/${maxEnergy}`);
  
  // Create and append recovery span using the helper function
  const recoverySpan = createRecoverySpan(horse, currentEnergy, maxEnergy);
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
    
    // Stop energy polling system
    stopEnergyPolling();
    
    // Find and remove all energy recovery spans using data-horse-id
    const recoverySpans = document.querySelectorAll('[data-horse-id]');
    
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

// ============= ENERGY POLLING SYSTEM =============
// Cache for previous energy values to detect changes
const energyCache = new Map<number, number>();
let pollingInterval: number | null = null;
const POLLING_INTERVAL = 500; // Check every 500ms

/**
 * Polls for energy changes and updates recovery info when detected
 * Ultra-simple solution that works regardless of how the game updates energy
 */
function pollEnergyChanges(): void {
  // Find all horses with energy recovery spans (already processed)
  const recoverySpans = document.querySelectorAll('[data-horse-id]');
  
  if (recoverySpans.length === 0) {
    // No horses to monitor, stop polling
    stopEnergyPolling();
    return;
  }
  
  recoverySpans.forEach(span => {
    const horseIdStr = span.getAttribute('data-horse-id');
    if (!horseIdStr) return;
    
    const horseId = parseInt(horseIdStr);
    
    // Find the horse element and energy description
    const horseElement = span.closest('[class*="styles_singleHorse__"]') as HTMLElement;
    if (!horseElement) return;
    
    const energyElement = findEnergyElement(horseElement);
    if (!energyElement) return;
    
    // Extract current energy from DOM
    const energyText = energyElement.textContent?.trim() || '';
    const currentEnergy = extractEnergyFromText(energyText).current;
    
    // Compare with cached value
    const previousEnergy = energyCache.get(horseId);
    
    if (previousEnergy !== undefined && previousEnergy !== currentEnergy) {
      debugLog(`Energy change detected for horse ${horseId}: ${previousEnergy} → ${currentEnergy}`);
      
      // Extract full horse data and refresh energy info
      const extractedHorseData = extractHorseData(horseElement);
      if (extractedHorseData) {
        // Update just this horse's energy recovery info
        addEnergyRecoveryInfoToSingleHorse(extractedHorseData);
      }
    }
    
    // Update cache
    energyCache.set(horseId, currentEnergy);
  });
}

/**
 * Starts the energy polling system
 * Called after horses are initially processed
 */
export function startEnergyPolling(): void {
  // Don't start multiple intervals
  if (pollingInterval !== null) {
    return;
  }
  
  debugLog('Starting energy polling system');
  pollingInterval = setInterval(pollEnergyChanges, POLLING_INTERVAL);
}

/**
 * Stops the energy polling system
 * Called during cleanup or when no horses are present
 */
export function stopEnergyPolling(): void {
  if (pollingInterval !== null) {
    debugLog('Stopping energy polling system');
    clearInterval(pollingInterval);
    pollingInterval = null;
    energyCache.clear();
  }
}