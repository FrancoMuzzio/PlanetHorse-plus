// ============= HORSE ANALYZER MODULE =============
// Analyzes and extracts information from Planet Horse game horses

import { debugLog, CONFIG, calculateEnergyRecoveryPer6Hours } from '../config';
import { saveHorseAnalysisData, loadHorseAnalysisData, loadMarketplaceSettings, loadEnabledMarketplaces, loadEnergyRecoverySettings, type StoredHorseAnalysis } from '../storage';

// Track last analysis to avoid duplicates
let lastAnalysisTimestamp = 0;
const ANALYSIS_COOLDOWN = 3000; // 3 seconds cooldown between analyses

/**
 * Interface for horse item equipment
 */
interface HorseItem {
  name: string;
  imageSrc: string;
  quantity?: number;
}

/**
 * Interface for horse statistics
 */
interface HorseStats {
  level: number;
  exp: {
    current: string;
    required: string;
  };
  power: number;
  spirit: {
    base: number;
    bonus?: number;
  };
  speed: {
    base: number;
    bonus?: number;
  };
  energy: {
    current: number;
    max: number;
  };
  energyRecovery6h: number;
}

/**
 * Main interface for horse information
 */
interface HorseInfo {
  id: number;
  name: string;
  gender: string;
  rarity: string;
  generation: number;
  breeds: {
    used: number;
    total: number;
  };
  status: string;
  stats: HorseStats;
  items: HorseItem[];
  imageSrc?: string;
  element?: HTMLElement;
}

/**
 * Extracts text content safely from an element
 */
function safeTextExtract(element: Element | null, defaultValue: string = ''): string {
  return element?.textContent?.trim() || defaultValue;
}

/**
 * Parses numeric value from text, handling K/M suffixes
 */
function parseNumericValue(text: string): number {
  const cleaned = text.replace(/[^0-9.KM]/gi, '');
  if (cleaned.includes('K')) {
    return parseFloat(cleaned.replace('K', '')) * 1000;
  }
  if (cleaned.includes('M')) {
    return parseFloat(cleaned.replace('M', '')) * 1000000;
  }
  return parseFloat(cleaned) || 0;
}

/**
 * Extracts stat with bonus from text like "90 +28"
 */
function extractStatWithBonus(text: string): { base: number; bonus?: number } {
  const parts = text.split(/\s+/);
  const base = parseInt(parts[0]) || 0;
  const bonus = parts[1] ? parseInt(parts[1].replace('+', '')) : undefined;
  return { base, bonus };
}

/**
 * Extracts horse data from a single horse element
 */
function extractHorseData(horseElement: HTMLElement): HorseInfo | null {
  try {
    // Extract ID
    const idElement = horseElement.querySelector('[class*="styles_horseId__"]');
    const id = parseInt(safeTextExtract(idElement)) || 0;

    // Extract name
    const nameElement = horseElement.querySelector('[class*="styles_horseItemDescriptionName__"] span');
    const name = safeTextExtract(nameElement, 'Unknown');

    // Extract gender and rarity from dynamic elements
    const dynamicElements = horseElement.querySelectorAll('[class*="styles_horseItemDynamic__"]');
    const gender = safeTextExtract(dynamicElements[0], 'unknown').toLowerCase();
    const rarity = safeTextExtract(dynamicElements[1], 'COMMON').toUpperCase();

    // Extract horse info descriptions
    const descriptions = horseElement.querySelectorAll('[class*="styles_horseItemDescription__"]');
    let generation = 0;
    let breedsUsed = 0;
    let breedsTotal = 20;
    let status = 'UNKNOWN';
    let level = 0;
    let expCurrent = '0';
    let expRequired = '0';
    let power = 0;
    let spirit = { base: 0, bonus: undefined as number | undefined };
    let speed = { base: 0, bonus: undefined as number | undefined };
    let energyCurrent = 0;
    let energyMax = 0;

    descriptions.forEach(desc => {
      const text = desc.textContent?.trim() || '';
      
      if (text.startsWith('GEN:')) {
        generation = parseInt(text.replace('GEN:', '').trim()) || 0;
      } else if (text.startsWith('BREEDS:')) {
        const breedsText = text.replace('BREEDS:', '').trim();
        const [used, total] = breedsText.split('/').map(s => parseInt(s.trim()));
        breedsUsed = used || 0;
        breedsTotal = total || 20;
      } else if (text.startsWith('LEVEL:')) {
        level = parseInt(text.replace('LEVEL:', '').trim()) || 0;
      } else if (text.startsWith('EXP:')) {
        const expText = text.replace('EXP:', '').trim();
        const [current, required] = expText.split('/');
        expCurrent = current?.trim() || '0';
        expRequired = required?.trim() || '0';
      } else if (text.startsWith('PWR:')) {
        power = parseInt(text.replace('PWR:', '').trim()) || 0;
      } else if (text.startsWith('SPT:')) {
        const sptText = text.replace('SPT:', '').trim();
        spirit = extractStatWithBonus(sptText);
      } else if (text.startsWith('SPD:')) {
        const spdText = text.replace('SPD:', '').trim();
        speed = extractStatWithBonus(spdText);
      } else if (text.startsWith('ENERGY:')) {
        const energyText = text.replace('ENERGY:', '').trim();
        const [current, max] = energyText.split('/').map(s => parseInt(s.trim()));
        energyCurrent = current || 0;
        energyMax = max || 0;
      } else if (text.match(/^[A-Z]+$/) && !text.includes(':')) {
        // Status like SLEEP, AWAKE, RACING
        status = text;
      }
    });

    // Extract items
    const items: HorseItem[] = [];
    const itemElements = horseElement.querySelectorAll('[class*="styles_singleItem__"] img');
    itemElements.forEach(img => {
      const itemImg = img as HTMLImageElement;
      items.push({
        name: itemImg.alt || 'Unknown Item',
        imageSrc: itemImg.src
      });
    });

    // Check for item quantities (badges)
    const itemBadges = horseElement.querySelectorAll('[class*="styles_itemBadge__"]');
    itemBadges.forEach((badge, index) => {
      if (items[index]) {
        items[index].quantity = parseInt(safeTextExtract(badge)) || 1;
      }
    });

    // Extract horse image
    const horseImg = horseElement.querySelector('[class*="styles_horseGif__"] img') as HTMLImageElement;
    const imageSrc = horseImg?.src;

    return {
      id,
      name,
      gender,
      rarity,
      generation,
      breeds: {
        used: breedsUsed,
        total: breedsTotal
      },
      status,
      stats: {
        level,
        exp: {
          current: expCurrent,
          required: expRequired
        },
        power,
        spirit,
        speed,
        energy: {
          current: energyCurrent,
          max: energyMax
        },
        energyRecovery6h: calculateEnergyRecoveryPer6Hours(level)
      },
      items,
      imageSrc,
      element: horseElement
    };
  } catch (error) {
    debugLog('Error extracting horse data:', error);
    return null;
  }
}


/**
 * Formats horse data for console output
 */
function formatHorseForConsole(horse: HorseInfo): object {
  return {
    ID: horse.id,
    Name: horse.name,
    Rarity: horse.rarity,
    Level: horse.stats.level,
    Status: horse.status,
    Energy: `${horse.stats.energy.current}/${horse.stats.energy.max}`,
    Power: horse.stats.power,
    Spirit: horse.stats.spirit.base,
    Speed: horse.stats.speed.base
  };
}

/**
 * Main function to analyze all horses on the page
 */
export function analyzeHorses(): void {
  // Find all horse elements using the dynamic class pattern
  const horseElements = document.querySelectorAll('[class*="styles_singleHorse__"]');
  
  // Only proceed if horses are found (silent return if not)
  if (horseElements.length === 0) {
    return;
  }
  
  // Check cooldown to avoid duplicate analyses
  const now = Date.now();
  if (now - lastAnalysisTimestamp < ANALYSIS_COOLDOWN) {
    return;
  }
  lastAnalysisTimestamp = now;
  
  debugLog('🐴 Starting horse analysis...');
  debugLog(`Found ${horseElements.length} horse cards`);
  
  // Extract data from each horse
  const horses: HorseInfo[] = [];
  horseElements.forEach((element, index) => {
    const horseData = extractHorseData(element as HTMLElement);
    if (horseData) {
      horses.push(horseData);
    } else {
      debugLog(`Failed to extract data from horse element ${index}`);
    }
  });
  
  if (horses.length === 0) {
    debugLog('No horse data could be extracted');
    return;
  }
  
  // Output to console - simple table
  console.log(`🐴 Found ${horses.length} horses`);
  console.table(horses.map(formatHorseForConsole));
  
  // Store analysis data
  const analysisData = {
    horses: horses.map(h => {
      // Remove HTMLElement reference for storage
      const { element, ...horseWithoutElement } = h;
      return horseWithoutElement;
    }),
    timestamp: new Date().toISOString()
  };
  
  // Store in window for immediate access
  (window as any).__horseAnalysisData = analysisData;
  
  // Save to persistent storage
  saveHorseAnalysisData(analysisData as StoredHorseAnalysis);
  
  debugLog('Horse analysis complete. Data stored in memory and storage');
}

/**
 * Initializes horse analyzer and loads persisted data
 */
export async function initializeHorseAnalyzer(): Promise<void> {
  debugLog('Initializing horse analyzer...');
  
  // Try to load from storage first
  const storedData = await loadHorseAnalysisData();
  if (storedData) {
    (window as any).__horseAnalysisData = storedData;
    debugLog('Loaded horse data from storage:', storedData.horses.length, 'horses');
  } else {
    debugLog('No stored horse data found');
  }
}

/**
 * Gets all horses from memory or storage
 */
export async function getHorses(): Promise<any[]> {
  let data = (window as any).__horseAnalysisData;
  
  // If no data in memory, try loading from storage
  if (!data || !data.horses) {
    data = await loadHorseAnalysisData();
    if (data) {
      (window as any).__horseAnalysisData = data;
    }
  }
  
  return data?.horses || [];
}

/**
 * Gets detailed information about a specific horse by ID
 */
export async function getHorseById(id: number): Promise<HorseInfo | null> {
  const horses = await getHorses();
  return horses.find((h: any) => h.id === id) || null;
}

/**
 * Filters horses by specific criteria
 */
export async function filterHorses(criteria: {
  rarity?: string;
  status?: string;
  minLevel?: number;
  maxLevel?: number;
  lowEnergy?: boolean;
}): Promise<HorseInfo[]> {
  const horses = await getHorses();
  if (horses.length === 0) {
    return [];
  }
  
  let filtered = horses;
  
  if (criteria.rarity) {
    filtered = filtered.filter(h => h.rarity === criteria.rarity);
  }
  
  if (criteria.status) {
    filtered = filtered.filter(h => h.status === criteria.status);
  }
  
  if (criteria.minLevel !== undefined) {
    filtered = filtered.filter(h => h.stats.level >= criteria.minLevel!);
  }
  
  if (criteria.maxLevel !== undefined) {
    filtered = filtered.filter(h => h.stats.level <= criteria.maxLevel!);
  }
  
  if (criteria.lowEnergy) {
    filtered = filtered.filter(h => 
      (h.stats.energy.current / h.stats.energy.max) < 0.3
    );
  }
  
  return filtered;
}

/**
 * Creates marketplace buttons (Ronin Market and OpenSea) for each horse
 */
export async function addMarketplaceButtons(): Promise<void> {
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
  
  const horses = await getHorses();
  
  if (horses.length === 0) {
    debugLog('No horses found for marketplace buttons');
    return;
  }
  
  debugLog(`Adding marketplace buttons for ${horses.length} horses with enabled marketplaces:`, enabledMarketplaces);
  
  horses.forEach((horse: any) => {
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
      
      debugLog(`Added marketplace buttons for horse ${horse.id} (Gen ${horse.generation}) - enabled:`, enabledMarketplaces);
    } else {
      // Just add the text back if no buttons are enabled
      idElement.appendChild(idTextSpan);
      debugLog(`No marketplace buttons added for horse ${horse.id} - no marketplaces enabled`);
    }
  });
  
  debugLog('Marketplace buttons setup complete');
}

/**
 * Determines if a horse will lose energy in the next 6-hour period
 * @param horse - Horse data object
 * @returns true if horse will lose energy, false if it will recover
 */
function willLoseEnergyNextRecovery(horse: any): boolean {
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
  if (wastedEnergy > recoveryAmount * 0.5) { // More than 50% wasted
    return true;
  }
  
  return false;
}

/**
 * Adds energy recovery information to horse cards
 * Modifies energy display to show recovery per 6 hours: "ENERGY: X/Y (+Z)" or "ENERGY: X/Y (-Z)"
 */
export async function addEnergyRecoveryInfo(): Promise<void> {
  // Check if energy recovery info is enabled via storage settings
  const energyRecoveryEnabled = await loadEnergyRecoverySettings();
  if (!energyRecoveryEnabled) {
    debugLog('Energy recovery info disabled - skipping info display');
    return;
  }
  
  // Clean up any existing energy recovery info first
  cleanupEnergyRecoveryInfo();
  
  const horses = await getHorses();
  
  if (horses.length === 0) {
    debugLog('No horses found for energy recovery info');
    return;
  }
  
  debugLog(`Adding energy recovery info for ${horses.length} horses`);
  
  horses.forEach((horse: any) => {
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
    
    // Store the original text content
    const originalText = energyDescriptionElement.textContent || '';
    
    // Only proceed if we haven't already modified this element
    if (originalText.includes(' +') || originalText.includes(' -') || originalText.includes(' ±')) {
      return;
    }
    
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
        recoverySpan.title = `Will lose ~${Math.floor(recoveryPer6h * 0.5)} energy every 6 hours while ${status.toLowerCase()}`;
      } else if (currentEnergy >= maxEnergy) {
        // Horse has full energy, recovery wasted
        recoverySpan.textContent = ` ±0`;
        recoverySpan.title = `Energy is full - recovery of ${recoveryPer6h} will be wasted every 6 hours`;
      } else {
        // Partial recovery waste
        const energyAfterRecovery = currentEnergy + recoveryPer6h;
        const wastedEnergy = Math.max(0, energyAfterRecovery - maxEnergy);
        const effectiveRecovery = recoveryPer6h - wastedEnergy;
        recoverySpan.textContent = ` +${effectiveRecovery}`;
        recoverySpan.title = `Will recover ${effectiveRecovery} energy (${wastedEnergy} wasted) every 6 hours`;
      }
      recoverySpan.className = CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT_NEGATIVE;
    } else {
      // Show normal energy recovery in green
      recoverySpan.textContent = ` +${recoveryPer6h}`;
      recoverySpan.className = CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT;
      recoverySpan.title = `Recovers ${recoveryPer6h} energy every 6 hours`;
    }
    
    // Add all elements to the energy element
    energyDescriptionElement.appendChild(energyLabelText);        // "ENERGY: " (plain text)
    energyDescriptionElement.appendChild(energyNumbersSpan);     // "1/72" (bold)
    energyDescriptionElement.appendChild(recoverySpan);          // " +15" (colored)
    
    debugLog(`Added energy recovery info for horse ${horse.id}: +${recoveryPer6h}/6h`);
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
    
    // Find all elements that have energy recovery info
    const elementsWithRecoveryInfo = document.querySelectorAll(`.${CONFIG.CSS_CLASSES.ENERGY_DISPLAY_CONTAINER}`);
    
    elementsWithRecoveryInfo.forEach(energyContainer => {
      // Reconstruct original text from text nodes and spans
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
        
        // Also remove any recovery text classes that might be lingering
        const recoverySpan = energyContainer.querySelector(`.${CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT}, .${CONFIG.CSS_CLASSES.ENERGY_RECOVERY_TEXT_NEGATIVE}`);
        if (recoverySpan) {
          recoverySpan.remove();
        }
        
        // Restore the original simple text content
        energyContainer.innerHTML = originalText;
        
        debugLog(`Cleaned up energy recovery info: ${originalText}`);
      }
    });
    
    debugLog('Energy recovery info cleanup complete');
  } catch (error) {
    debugLog('Error cleaning up energy recovery info:', error);
  }
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
        
        debugLog(`Cleaned up marketplace buttons for horse ID: ${originalText}`);
      }
    });
    
    debugLog('Marketplace buttons cleanup complete');
  } catch (error) {
    debugLog('Error cleaning up marketplace buttons:', error);
  }
}

