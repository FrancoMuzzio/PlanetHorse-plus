// ============= HORSE ANALYZER MODULE =============
// Single Responsibility: Orchestrate horse analysis and data storage

import { debugLog } from '../config';
import { saveHorseAnalysisData, loadHorseAnalysisData, type StoredHorseAnalysis } from '../storage';
import { extractHorseData, type HorseInfo } from './horse-data-extractor';
import { addMarketplaceButtons, cleanupMarketplaceButtons } from './marketplace-buttons';
import { addEnergyRecoveryInfo, cleanupEnergyRecoveryInfo, cleanupTooltips } from './energy-recovery';

// Track last analysis to avoid duplicates
let lastAnalysisTimestamp = 0;
const ANALYSIS_COOLDOWN = 3000; // 3 seconds cooldown between analyses

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
export async function getHorses(): Promise<HorseInfo[]> {
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
  return horses.find((h: HorseInfo) => h.id === id) || null;
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

// Re-export the cleanup functions from their respective modules
export { 
  addMarketplaceButtons,
  cleanupMarketplaceButtons,
  addEnergyRecoveryInfo,
  cleanupEnergyRecoveryInfo,
  cleanupTooltips
};