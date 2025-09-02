// ============= HORSE ANALYZER MODULE =============
// Analyzes and extracts information from Planet Horse game horses

import { debugLog } from '../config';

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
 * Summary statistics for all horses
 */
interface HorseSummary {
  totalHorses: number;
  byRarity: Record<string, number>;
  byStatus: Record<string, number>;
  averageLevel: number;
  totalPower: number;
  totalSpirit: number;
  totalSpeed: number;
  highestLevel: HorseInfo | null;
  lowestEnergy: HorseInfo | null;
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
 * Calculates summary statistics for all horses
 */
function calculateSummary(horses: HorseInfo[]): HorseSummary {
  const summary: HorseSummary = {
    totalHorses: horses.length,
    byRarity: {},
    byStatus: {},
    averageLevel: 0,
    totalPower: 0,
    totalSpirit: 0,
    totalSpeed: 0,
    highestLevel: null,
    lowestEnergy: null
  };

  if (horses.length === 0) return summary;

  let totalLevel = 0;
  let lowestEnergyRatio = Infinity;

  horses.forEach(horse => {
    // Count by rarity
    summary.byRarity[horse.rarity] = (summary.byRarity[horse.rarity] || 0) + 1;
    
    // Count by status
    summary.byStatus[horse.status] = (summary.byStatus[horse.status] || 0) + 1;
    
    // Sum stats
    totalLevel += horse.stats.level;
    summary.totalPower += horse.stats.power;
    summary.totalSpirit += horse.stats.spirit.base + (horse.stats.spirit.bonus || 0);
    summary.totalSpeed += horse.stats.speed.base + (horse.stats.speed.bonus || 0);
    
    // Track highest level
    if (!summary.highestLevel || horse.stats.level > summary.highestLevel.stats.level) {
      summary.highestLevel = horse;
    }
    
    // Track lowest energy ratio
    const energyRatio = horse.stats.energy.current / horse.stats.energy.max;
    if (energyRatio < lowestEnergyRatio) {
      lowestEnergyRatio = energyRatio;
      summary.lowestEnergy = horse;
    }
  });

  summary.averageLevel = Math.round(totalLevel / horses.length * 10) / 10;

  return summary;
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
    Spirit: horse.stats.spirit.bonus 
      ? `${horse.stats.spirit.base} +${horse.stats.spirit.bonus}` 
      : horse.stats.spirit.base,
    Speed: horse.stats.speed.bonus 
      ? `${horse.stats.speed.base} +${horse.stats.speed.bonus}` 
      : horse.stats.speed.base,
    Breeds: `${horse.breeds.used}/${horse.breeds.total}`,
    Items: horse.items.length
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
  
  // Calculate summary statistics
  const summary = calculateSummary(horses);
  
  // Output to console
  console.group(`🐴 Planet Horse Analysis - ${horses.length} Horses Found`);
  
  // Display summary
  console.group('📊 Summary Statistics');
  console.log('Total Horses:', summary.totalHorses);
  console.log('Average Level:', summary.averageLevel);
  console.log('Total Power:', summary.totalPower);
  console.log('Total Spirit:', summary.totalSpirit);
  console.log('Total Speed:', summary.totalSpeed);
  console.log('By Rarity:', summary.byRarity);
  console.log('By Status:', summary.byStatus);
  if (summary.highestLevel) {
    console.log('Highest Level:', `${summary.highestLevel.name} (Lvl ${summary.highestLevel.stats.level})`);
  }
  if (summary.lowestEnergy) {
    console.log('Lowest Energy:', `${summary.lowestEnergy.name} (${summary.lowestEnergy.stats.energy.current}/${summary.lowestEnergy.stats.energy.max})`);
  }
  console.groupEnd();
  
  // Display individual horses in table format
  console.group('🐎 Individual Horses');
  const tableData = horses.map(formatHorseForConsole);
  console.table(tableData);
  console.groupEnd();
  
  // Group by rarity
  const rarities = Object.keys(summary.byRarity).sort();
  rarities.forEach(rarity => {
    const rarityHorses = horses.filter(h => h.rarity === rarity);
    console.group(`${rarity} Horses (${rarityHorses.length})`);
    console.table(rarityHorses.map(formatHorseForConsole));
    console.groupEnd();
  });
  
  console.groupEnd();
  
  // Store in window for potential further analysis
  (window as any).__horseAnalysisData = {
    horses,
    summary,
    timestamp: new Date().toISOString()
  };
  
  debugLog('Horse analysis complete. Data stored in window.__horseAnalysisData');
}

/**
 * Gets detailed information about a specific horse by ID
 */
export function getHorseById(id: number): HorseInfo | null {
  const data = (window as any).__horseAnalysisData;
  if (!data || !data.horses) {
    debugLog('No horse analysis data available. Run analyzeHorses() first.');
    return null;
  }
  
  return data.horses.find((h: HorseInfo) => h.id === id) || null;
}

/**
 * Filters horses by specific criteria
 */
export function filterHorses(criteria: {
  rarity?: string;
  status?: string;
  minLevel?: number;
  maxLevel?: number;
  lowEnergy?: boolean;
}): HorseInfo[] {
  const data = (window as any).__horseAnalysisData;
  if (!data || !data.horses) {
    debugLog('No horse analysis data available. Run analyzeHorses() first.');
    return [];
  }
  
  let filtered = data.horses as HorseInfo[];
  
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
 * Exports horse data to JSON
 */
export function exportHorsesToJSON(): string {
  const data = (window as any).__horseAnalysisData;
  if (!data) {
    debugLog('No horse analysis data available. Run analyzeHorses() first.');
    return '{}';
  }
  
  return JSON.stringify(data, null, 2);
}

/**
 * Exports horse data to CSV format
 */
export function exportHorsesToCSV(): string {
  const data = (window as any).__horseAnalysisData;
  if (!data || !data.horses || data.horses.length === 0) {
    debugLog('No horse analysis data available. Run analyzeHorses() first.');
    return '';
  }
  
  const headers = [
    'ID', 'Name', 'Gender', 'Rarity', 'Generation', 'Level', 'Status',
    'Power', 'Spirit Base', 'Spirit Bonus', 'Speed Base', 'Speed Bonus',
    'Energy Current', 'Energy Max', 'Breeds Used', 'Breeds Total', 'Items Count'
  ];
  
  const rows = data.horses.map((h: HorseInfo) => [
    h.id,
    h.name,
    h.gender,
    h.rarity,
    h.generation,
    h.stats.level,
    h.status,
    h.stats.power,
    h.stats.spirit.base,
    h.stats.spirit.bonus || 0,
    h.stats.speed.base,
    h.stats.speed.bonus || 0,
    h.stats.energy.current,
    h.stats.energy.max,
    h.breeds.used,
    h.breeds.total,
    h.items.length
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csv;
}