// ============= HORSE DATA EXTRACTOR MODULE =============
// Single Responsibility: Extract and parse horse data from DOM elements

import { calculateEnergyRecoveryPer6Hours } from '../config';

/**
 * Interface for horse item equipment
 */
export interface HorseItem {
  name: string;
  imageSrc: string;
  quantity?: number;
}

/**
 * Interface for horse statistics
 */
export interface HorseStats {
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
export interface HorseInfo {
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
export function extractHorseData(horseElement: HTMLElement): HorseInfo | null {
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
    console.error('[Planet Horse Extension] Error extracting horse data:', error);
    return null;
  }
}

/**
 * Formats horse data for console output
 */
export function formatHorseForConsole(horse: HorseInfo): object {
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