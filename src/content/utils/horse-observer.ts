// ============= HORSE OBSERVER MODULE =============
// MutationObserver permanente para detectar y procesar caballos automáticamente

import { CONFIG, debugLog } from '../config';
import { extractHorseData, type HorseInfo } from './horse-data-extractor';
import { addMarketplaceButtons, cleanupMarketplaceButtons } from './marketplace-buttons';
import { addEnergyRecoveryInfo, cleanupEnergyRecoveryInfo } from './energy-recovery';
import { loadAllSettings } from '../storage';

// WeakMap para trackear elementos ya procesados
const processedElements = new WeakMap<HTMLElement, boolean>();

// Observer instance
let observer: MutationObserver | null = null;

// Feature check interval
let featureCheckInterval: number | null = null;

// Throttle para evitar procesamiento excesivo
let lastProcessTime = 0;
const PROCESS_THROTTLE = 100; // ms
const FEATURE_CHECK_INTERVAL = 1000; // Check every second

// Settings cache
let cachedSettings = {
  marketplaceLinksEnabled: true,
  energyRecoveryEnabled: true,
  enabledMarketplaces: ['ronin', 'opensea']
};

/**
 * Initialize the permanent MutationObserver
 * This observer runs continuously and detects new horse elements
 */
export async function initializeHorseObserver(): Promise<void> {
  // Load settings once
  const settings = await loadAllSettings();
  cachedSettings = {
    marketplaceLinksEnabled: settings.marketplaceLinksEnabled,
    energyRecoveryEnabled: settings.energyRecoveryEnabled,
    enabledMarketplaces: settings.enabledMarketplaces
  };
  
  if (observer) {
    debugLog('Horse observer already initialized');
    return;
  }
  
  debugLog('Initializing permanent horse observer...');
  
  observer = new MutationObserver((mutations) => {
    // Early return if not on game page
    if (!window.location.pathname.includes('/game')) return;
    
    // Throttle processing
    const now = Date.now();
    if (now - lastProcessTime < PROCESS_THROTTLE) return;
    lastProcessTime = now;
    
    // Find new horse elements in mutations
    const newHorses = findNewHorseElements(mutations);
    
    if (newHorses.length > 0) {
      debugLog(`Observer detected ${newHorses.length} new horse element(s)`);
      processNewHorses(newHorses);
    }
  });
  
  // Start observing - never stops
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false, // We don't need attribute changes
    characterData: false // We don't need text changes
  });
  
  debugLog('Horse observer started - watching for DOM changes');
  
  // Process any existing horses on initial load
  processExistingHorses();
  
  // Start periodic feature check
  // This catches cases where the game modifies innerHTML directly
  if (featureCheckInterval) {
    clearInterval(featureCheckInterval);
  }
  
  featureCheckInterval = setInterval(() => {
    if (!window.location.pathname.includes('/game')) return;
    
    // Check all processed elements to see if they lost their features
    const existingHorses = document.querySelectorAll('[class*="styles_singleHorse__"]');
    const horsesToReprocess: HTMLElement[] = [];
    
    existingHorses.forEach(element => {
      const el = element as HTMLElement;
      // If element was processed but lost features, re-apply them
      if (processedElements.has(el) && !hasFeatures(el)) {
        horsesToReprocess.push(el);
      }
    });
    
    if (horsesToReprocess.length > 0) {
      debugLog(`Feature check: ${horsesToReprocess.length} horses lost their features, re-applying...`);
      processNewHorses(horsesToReprocess);
    }
  }, FEATURE_CHECK_INTERVAL);
  
  debugLog('Feature check interval started');
}

/**
 * Find new horse elements in mutation records
 */
function findNewHorseElements(mutations: MutationRecord[]): HTMLElement[] {
  const newHorses: HTMLElement[] = [];
  
  mutations.forEach(mutation => {
    // Only process childList mutations
    if (mutation.type !== 'childList') return;
    
    // Check added nodes
    mutation.addedNodes.forEach(node => {
      // Skip non-elements
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      
      const element = node as HTMLElement;
      
      // Check if this is a horse element
      if (isHorseElement(element) && !processedElements.has(element)) {
        newHorses.push(element);
      }
      
      // Also check children recursively
      if (element.querySelectorAll) {
        element.querySelectorAll('[class*="styles_singleHorse__"]').forEach(el => {
          const horseEl = el as HTMLElement;
          if (!processedElements.has(horseEl)) {
            newHorses.push(horseEl);
          }
        });
      }
    });
  });
  
  return newHorses;
}

/**
 * Check if an element is a horse element
 */
function isHorseElement(element: HTMLElement): boolean {
  return element.className?.includes('styles_singleHorse__') || false;
}

/**
 * Check if a horse element already has features applied
 */
function hasFeatures(element: HTMLElement): boolean {
  // Check for marketplace buttons
  const hasMarketplaceButtons = element.querySelector(`.${CONFIG.CSS_CLASSES.MARKETPLACE_BUTTONS_CONTAINER}`) !== null;
  
  // Check for energy recovery info
  const hasEnergyInfo = element.querySelector(`.${CONFIG.CSS_CLASSES.ENERGY_DISPLAY_CONTAINER}`) !== null;
  
  return hasMarketplaceButtons || hasEnergyInfo;
}

/**
 * Process new horse elements by adding features
 */
function processNewHorses(elements: HTMLElement[]): void {
  const horseDataArray: HorseInfo[] = [];
  
  elements.forEach(element => {
    // Check if element was processed but lost its features
    const wasProcessed = processedElements.has(element);
    const needsFeatures = !hasFeatures(element);
    
    if (wasProcessed && !needsFeatures) {
      // Already processed and still has features, skip
      return;
    }
    
    // Mark as processed (or re-mark if features were lost)
    processedElements.set(element, true);
    
    // Extract horse data
    const data = extractHorseData(element);
    if (data) {
      horseDataArray.push(data);
      
      if (wasProcessed && needsFeatures) {
        debugLog(`Re-applying features to horse ${data.id} (features were lost)`);
      }
    }
  });
  
  if (horseDataArray.length === 0) return;
  
  // Apply features based on settings
  if (cachedSettings.marketplaceLinksEnabled) {
    addMarketplaceButtons(horseDataArray);
  }
  
  if (cachedSettings.energyRecoveryEnabled) {
    addEnergyRecoveryInfo(horseDataArray).catch(err => {
      debugLog('Error adding energy recovery info:', err);
    });
  }
  
  debugLog(`Processed ${horseDataArray.length} horses with features`);
}

/**
 * Process existing horses on page (for initial load and re-check)
 */
function processExistingHorses(): void {
  const existingHorses = document.querySelectorAll('[class*="styles_singleHorse__"]');
  
  if (existingHorses.length === 0) return;
  
  debugLog(`Found ${existingHorses.length} existing horses on scan`);
  
  const horsesToProcess: HTMLElement[] = [];
  existingHorses.forEach(element => {
    const el = element as HTMLElement;
    // Process if never processed OR if processed but lost features
    if (!processedElements.has(el) || !hasFeatures(el)) {
      horsesToProcess.push(el);
    }
  });
  
  if (horsesToProcess.length > 0) {
    debugLog(`Processing ${horsesToProcess.length} horses (new or missing features)`);
    processNewHorses(horsesToProcess);
  }
}

/**
 * Update cached settings (called when settings change)
 */
export async function updateObserverSettings(): Promise<void> {
  const settings = await loadAllSettings();
  
  // Store old settings to compare changes
  const oldSettings = { ...cachedSettings };
  
  // Update cached settings
  cachedSettings = {
    marketplaceLinksEnabled: settings.marketplaceLinksEnabled,
    energyRecoveryEnabled: settings.energyRecoveryEnabled,
    enabledMarketplaces: settings.enabledMarketplaces
  };
  
  debugLog('Observer settings updated', { oldSettings, newSettings: cachedSettings });
  
  // If marketplace links were disabled, clean up existing buttons
  if (oldSettings.marketplaceLinksEnabled && !cachedSettings.marketplaceLinksEnabled) {
    debugLog('Marketplace links disabled - cleaning up existing buttons');
    cleanupMarketplaceButtons();
  }
  
  // If energy recovery was disabled, clean up existing energy recovery info
  if (oldSettings.energyRecoveryEnabled && !cachedSettings.energyRecoveryEnabled) {
    debugLog('Energy recovery disabled - cleaning up existing info');
    cleanupEnergyRecoveryInfo();
  }
  
  // Force reprocessing of existing horses when settings change
  // This ensures immediate application of new settings
  debugLog('Forcing reprocessing of existing horses with new settings');
  processExistingHorses();
}

/**
 * Clear processed elements (for cleanup/reset)
 */
export function clearProcessedElements(): void {
  // WeakMap clears automatically when elements are removed
  // This is just for explicit reset if needed
  debugLog('Processed elements cache will be cleared by GC');
}

/**
 * Stop observer (for cleanup)
 */
export function stopHorseObserver(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
    debugLog('Horse observer stopped');
  }
  
  if (featureCheckInterval) {
    clearInterval(featureCheckInterval);
    featureCheckInterval = null;
    debugLog('Feature check interval stopped');
  }
}