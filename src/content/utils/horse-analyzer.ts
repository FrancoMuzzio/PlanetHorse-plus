// ============= HORSE ANALYZER MODULE =============
// Analyzes and extracts information from Planet Horse game horses

import { debugLog } from '../config';
import { saveHorseAnalysisData, loadHorseAnalysisData, type StoredHorseAnalysis } from '../storage';

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
        }
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

