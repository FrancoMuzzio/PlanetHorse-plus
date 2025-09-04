import { CONFIG, debugLog, type ConversionKey } from './config';
import { storage } from '#imports';
import { isValidConversion } from './utils/validation';

/**
 * Storage module for persisting user preferences using WXT Storage API
 * Provides type-safe access to user currency preferences with automatic validation
 */

// Horse data interfaces (simplified for storage)
interface StoredHorseStats {
  level: number;
  exp: { current: string; required: string; };
  power: number;
  spirit: { base: number; bonus?: number; };
  speed: { base: number; bonus?: number; };
  energy: { current: number; max: number; };
}

interface StoredHorseInfo {
  id: number;
  name: string;
  gender: string;
  rarity: string;
  generation: number;
  breeds: { used: number; total: number; };
  status: string;
  stats: StoredHorseStats;
  items: Array<{ name: string; imageSrc: string; quantity?: number; }>;
  imageSrc?: string;
}

interface StoredHorseAnalysis {
  horses: StoredHorseInfo[];
  timestamp: string;
}

// WXT storage item definition with automatic validation and fallback
const userPreferredCurrency = storage.defineItem<ConversionKey>('local:user_preferred_currency', {
  fallback: CONFIG.DEFAULT_CURRENCY,
});

// WXT storage item for price converter enabled/disabled setting
const priceConverterEnabled = storage.defineItem<boolean>('local:price_converter_enabled', {
  fallback: true, // Default to enabled (same as current CONFIG.FEATURES.PRICE_CONVERTER_ENABLED)
});

// WXT storage item for enabled currencies (persists even when converter is disabled)
const enabledCurrencies = storage.defineItem<ConversionKey[]>('local:enabled_currencies', {
  fallback: ['usd', 'ron'], // Default to USD and RON enabled
});

// WXT storage item for horse analysis data
const horseAnalysisData = storage.defineItem<StoredHorseAnalysis | null>('local:horse_analysis_data', {
  fallback: null, // No data by default
});

// WXT storage item for marketplace links enabled/disabled setting
const marketplaceLinksEnabled = storage.defineItem<boolean>('local:marketplace_links_enabled', {
  fallback: true, // Default to enabled (both marketplaces enabled by default)
});

// WXT storage item for enabled marketplaces (persists even when marketplace links are disabled)
const enabledMarketplaces = storage.defineItem<string[]>('local:enabled_marketplaces', {
  fallback: ['ronin', 'opensea'], // Default to both marketplaces enabled
});

// WXT storage item for energy recovery info enabled/disabled setting
const energyRecoveryEnabled = storage.defineItem<boolean>('local:energy_recovery_enabled', {
  fallback: true, // Default to enabled (same as current behavior)
});

// WXT storage item for settings modal enabled/disabled setting
const settingsModalEnabled = storage.defineItem<boolean>('local:settings_modal_enabled', {
  fallback: true, // Default to enabled (same as previous CONFIG.FEATURES.SETTINGS_MODAL_ENABLED)
});

// WXT storage item for horse analyzer enabled/disabled setting
const horseAnalyzerEnabled = storage.defineItem<boolean>('local:horse_analyzer_enabled', {
  fallback: true, // Default to enabled (same as previous CONFIG.FEATURES.HORSE_ANALYZER_ENABLED)
});

/**
 * Loads user's preferred currency from WXT storage
 * @returns Promise that resolves to user's preferred currency or default currency
 */
export async function loadUserPreferredCurrency(): Promise<ConversionKey> {
  try {
    const savedCurrency = await userPreferredCurrency.getValue();
    
    // Validate that saved currency is still valid (business logic validation)
    if (isValidConversion(savedCurrency)) {
      return savedCurrency;
    } else {
      // Reset to default if invalid
      await userPreferredCurrency.setValue(CONFIG.DEFAULT_CURRENCY);
      return CONFIG.DEFAULT_CURRENCY;
    }
  } catch (error) {
    return CONFIG.DEFAULT_CURRENCY;
  }
}

/**
 * Saves user's preferred currency to WXT storage
 * @param currency - The currency to save as user preference
 */
export async function saveUserPreferredCurrency(currency: ConversionKey): Promise<void> {
  try {
    await userPreferredCurrency.setValue(currency);
  } catch (error) {
    // Non-critical error - extension continues to function without persistence
  }
}

/**
 * Clears user's preferred currency from storage (resets to default)
 */
export async function clearUserPreferredCurrency(): Promise<void> {
  try {
    await userPreferredCurrency.removeValue();
  } catch (error) {
  }
}

/**
 * Gets WXT storage item for direct access (for advanced use cases)
 * @returns WXT storage item instance
 */
export function getUserPreferredCurrencyStorageItem() {
  return userPreferredCurrency;
}

/**
 * Loads price converter enabled setting from WXT storage
 * @returns Promise that resolves to boolean indicating if converter is enabled
 */
export async function loadConverterSettings(): Promise<boolean> {
  try {
    const isEnabled = await priceConverterEnabled.getValue();
    return isEnabled;
  } catch (error) {
    return true; // Default to enabled
  }
}

/**
 * Saves price converter enabled setting to WXT storage
 * @param enabled - Boolean indicating if converter should be enabled
 */
export async function saveConverterSettings(enabled: boolean): Promise<void> {
  try {
    await priceConverterEnabled.setValue(enabled);
  } catch (error) {
  }
}

/**
 * Gets WXT storage item for converter settings (for advanced use cases)
 * @returns WXT storage item instance
 */
export function getConverterSettingsStorageItem() {
  return priceConverterEnabled;
}

/**
 * Loads enabled currencies from WXT storage
 * @returns Promise that resolves to array of enabled currency keys
 */
export async function loadEnabledCurrencies(): Promise<ConversionKey[]> {
  try {
    const enabled = await enabledCurrencies.getValue();
    return enabled;
  } catch (error) {
    return ['usd', 'ron']; // Default fallback
  }
}

/**
 * Saves enabled currencies to WXT storage
 * @param currencies - Array of currency keys to enable
 */
export async function saveEnabledCurrencies(currencies: ConversionKey[]): Promise<void> {
  try {
    await enabledCurrencies.setValue(currencies);
  } catch (error) {
  }
}

/**
 * Gets WXT storage item for enabled currencies (for advanced use cases)
 * @returns WXT storage item instance
 */
export function getEnabledCurrenciesStorageItem() {
  return enabledCurrencies;
}

/**
 * Saves horse analysis data to WXT storage
 * @param data - The horse analysis data to save
 */
export async function saveHorseAnalysisData(data: StoredHorseAnalysis): Promise<void> {
  try {
    await horseAnalysisData.setValue(data);
  } catch (error) {
  }
}

/**
 * Loads horse analysis data from WXT storage
 * @returns Promise that resolves to stored horse data or null
 */
export async function loadHorseAnalysisData(): Promise<StoredHorseAnalysis | null> {
  try {
    const data = await horseAnalysisData.getValue();
    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Clears horse analysis data from storage
 */
export async function clearHorseAnalysisData(): Promise<void> {
  try {
    await horseAnalysisData.removeValue();
  } catch (error) {
  }
}

/**
 * Loads marketplace links enabled setting from WXT storage
 * @returns Promise that resolves to boolean indicating if marketplace links are enabled
 */
export async function loadMarketplaceSettings(): Promise<boolean> {
  try {
    const isEnabled = await marketplaceLinksEnabled.getValue();
    return isEnabled;
  } catch (error) {
    return true; // Default to enabled
  }
}

/**
 * Saves marketplace links enabled setting to WXT storage
 * @param enabled - Boolean indicating if marketplace links should be enabled
 */
export async function saveMarketplaceSettings(enabled: boolean): Promise<void> {
  try {
    await marketplaceLinksEnabled.setValue(enabled);
  } catch (error) {
  }
}

/**
 * Gets WXT storage item for marketplace settings (for advanced use cases)
 * @returns WXT storage item instance
 */
export function getMarketplaceSettingsStorageItem() {
  return marketplaceLinksEnabled;
}

/**
 * Loads enabled marketplaces from WXT storage
 * @returns Promise that resolves to array of enabled marketplace keys
 */
export async function loadEnabledMarketplaces(): Promise<string[]> {
  try {
    const enabled = await enabledMarketplaces.getValue();
    return enabled;
  } catch (error) {
    return ['ronin', 'opensea']; // Default fallback
  }
}

/**
 * Saves enabled marketplaces to WXT storage
 * @param marketplaces - Array of marketplace keys to enable
 */
export async function saveEnabledMarketplaces(marketplaces: string[]): Promise<void> {
  try {
    await enabledMarketplaces.setValue(marketplaces);
  } catch (error) {
  }
}

/**
 * Gets WXT storage item for enabled marketplaces (for advanced use cases)
 * @returns WXT storage item instance
 */
export function getEnabledMarketplacesStorageItem() {
  return enabledMarketplaces;
}

/**
 * Loads energy recovery info enabled setting from WXT storage
 * @returns Promise that resolves to boolean indicating if energy recovery info is enabled
 */
export async function loadEnergyRecoverySettings(): Promise<boolean> {
  try {
    const isEnabled = await energyRecoveryEnabled.getValue();
    return isEnabled;
  } catch (error) {
    return true; // Default to enabled
  }
}

/**
 * Saves energy recovery info enabled setting to WXT storage
 * @param enabled - Boolean indicating if energy recovery info should be enabled
 */
export async function saveEnergyRecoverySettings(enabled: boolean): Promise<void> {
  try {
    await energyRecoveryEnabled.setValue(enabled);
  } catch (error) {
  }
}

/**
 * Gets WXT storage item for energy recovery settings (for advanced use cases)
 * @returns WXT storage item instance
 */
export function getEnergyRecoverySettingsStorageItem() {
  return energyRecoveryEnabled;
}

/**
 * Loads settings modal enabled setting from WXT storage
 * @returns Promise that resolves to boolean indicating if settings modal is enabled
 */
export async function loadSettingsModalSettings(): Promise<boolean> {
  try {
    const isEnabled = await settingsModalEnabled.getValue();
    return isEnabled;
  } catch (error) {
    return true; // Default to enabled
  }
}

/**
 * Saves settings modal enabled setting to WXT storage
 * @param enabled - Boolean indicating if settings modal should be enabled
 */
export async function saveSettingsModalSettings(enabled: boolean): Promise<void> {
  try {
    await settingsModalEnabled.setValue(enabled);
  } catch (error) {
  }
}

/**
 * Gets WXT storage item for settings modal settings (for advanced use cases)
 * @returns WXT storage item instance
 */
export function getSettingsModalSettingsStorageItem() {
  return settingsModalEnabled;
}

/**
 * Loads horse analyzer enabled setting from WXT storage
 * @returns Promise that resolves to boolean indicating if horse analyzer is enabled
 */
export async function loadHorseAnalyzerSettings(): Promise<boolean> {
  try {
    const isEnabled = await horseAnalyzerEnabled.getValue();
    return isEnabled;
  } catch (error) {
    return true; // Default to enabled
  }
}

/**
 * Saves horse analyzer enabled setting to WXT storage
 * @param enabled - Boolean indicating if horse analyzer should be enabled
 */
export async function saveHorseAnalyzerSettings(enabled: boolean): Promise<void> {
  try {
    await horseAnalyzerEnabled.setValue(enabled);
  } catch (error) {
  }
}

/**
 * Gets WXT storage item for horse analyzer settings (for advanced use cases)
 * @returns WXT storage item instance
 */
export function getHorseAnalyzerSettingsStorageItem() {
  return horseAnalyzerEnabled;
}

/**
 * Interface for all application settings
 */
export interface AllSettings {
  converterEnabled: boolean;
  enabledCurrencies: ConversionKey[];
  marketplaceLinksEnabled: boolean;
  enabledMarketplaces: string[];
  energyRecoveryEnabled: boolean;
}

/**
 * Loads all application settings in a single function call
 * @returns Promise that resolves to object with all current settings
 */
export async function loadAllSettings(): Promise<AllSettings> {
  try {
    const [
      converterEnabled,
      enabledCurrencies,
      marketplaceLinksEnabled,
      enabledMarketplaces,
      energyRecoveryEnabled
    ] = await Promise.all([
      loadConverterSettings(),
      loadEnabledCurrencies(),
      loadMarketplaceSettings(),
      loadEnabledMarketplaces(),
      loadEnergyRecoverySettings()
    ]);

    const settings = {
      converterEnabled,
      enabledCurrencies,
      marketplaceLinksEnabled,
      enabledMarketplaces,
      energyRecoveryEnabled
    };

    return settings;
  } catch (error) {
    // Return default fallback settings
    return {
      converterEnabled: true,
      enabledCurrencies: ['usd', 'ron'],
      marketplaceLinksEnabled: true,
      enabledMarketplaces: ['ronin', 'opensea'],
      energyRecoveryEnabled: true
    };
  }
}

// Export types for use in other modules
export type { StoredHorseInfo, StoredHorseAnalysis, StoredHorseStats };