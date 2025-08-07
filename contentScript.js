// ============= CONFIGURATION =============
const CONFIG = {
  TOKEN_ADDRESS: '0x7f8e304eb2894e57f8b930000f396319729bd1f1',
  API_BASE_URL: 'https://exchange-rate.skymavis.com/v2/prices?addresses=',
  BADGE_CLASS: 'ph-usd-badge',
  DEBUG: false // PRODUCTION: false, DEVELOPMENT: true
};

// ============= LOGGING SYSTEM =============
const log = CONFIG.DEBUG ? console.log.bind(console) : () => {};
const logError = CONFIG.DEBUG ? console.error.bind(console) : () => {};

// ============= MAIN CLASS =============
const PlanetHorseUSD = {
  observer: null,
  currentURL: window.location.href,
  debounceTimer: null,
  updateTimer: null,
  pollingTimer: null,
  lastBalances: new Map(), // Cache para detectar cambios
  
  // Initialize the extension
  init() {
    log('PlanetHorse USD Extension loaded');
    this.setupNavigation();
    this.setupObserver();
    this.setupPollingBackup();
    this.updateAllBadges();
  },
  
  // Setup navigation detection for SPA
  setupNavigation() {
    // URL change detection
    setInterval(() => {
      if (window.location.href !== this.currentURL) {

        this.currentURL = window.location.href;

        setTimeout(() => this.updateAllBadges(), 500);
      }
    }, 500);
    
    // Visibility change

    document.addEventListener('visibilitychange', () => {

      
      if (!document.hidden) {

        setTimeout(() => this.updateAllBadges(), 300);
      }
    });
    

  },
  
  // Setup DOM observer with ultra-aggressive logging
  setupObserver() {

    if (this.observer) this.observer.disconnect();
    
    this.observer = new MutationObserver((mutations) => {

      
      mutations.forEach((mutation, index) => {
        const target = mutation.target;
        
        // Log específico para currency groups
        if (target.className?.includes('currencyGroup') || target.closest?.('[class*="currencyGroup"]')) {
  
        }
        
        // Log para spans con números
        if (target.tagName === 'SPAN' && target.textContent?.match(/^\d+$/)) {
  
        }
      });
      
      // Filtrar solo mutaciones relevantes
      const relevantMutations = mutations.some(mutation => {
        const target = mutation.target;
        const isRelevant = (
          // Cambios en currency groups
          target.className?.includes('currencyGroup') ||
          target.closest?.('[class*="currencyGroup"]') ||
          // Cambios en spans que podrían ser valores
          (target.tagName === 'SPAN' && target.textContent?.match(/^\d+$/)) ||
          // Cambios en elementos con imágenes de phorse
          target.querySelector?.('img[alt*="phorse"]') ||
          target.closest?.('[class*="currencyGroup"]')
        );
        
        if (isRelevant) {

        }
        
        return isRelevant;
      });
      
      if (relevantMutations) {
        if (this.debounceTimer) {

          clearTimeout(this.debounceTimer);
        }
        

        this.debounceTimer = setTimeout(() => {

          this.updateAllBadges();
        }, 100);
      } else {

      }
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
    

  },
  
  // Setup polling backup
  setupPollingBackup() {

    this.pollingTimer = setInterval(() => {
      if (!document.hidden) {

        this.checkForBalanceChanges();
      }
    }, 5000);
  },
  
  // Check for balance changes manually
  checkForBalanceChanges() {
    const timestamp = new Date().toISOString();

    
    const currencyGroups = document.querySelectorAll('[class*="currencyGroup"]');

    
    let changesDetected = false;
    
    currencyGroups.forEach((group, index) => {
      const img = group.querySelector('img[alt*="phorse"]');
      if (!img) return;
      
      // Find value element using robust content-based logic
      const candidateSpans = group.querySelectorAll(`span:not(.${CONFIG.BADGE_CLASS})`);
      let valueElement = null;
      for (const span of candidateSpans) {
        const text = span.textContent?.trim();
        if (text && /^\d+$/.test(text)) {
          valueElement = span;
          break;
        }
      }
      if (!valueElement && candidateSpans.length > 0) {
        valueElement = candidateSpans[candidateSpans.length - 1];
      }
      if (!valueElement) return;
      
      const currentValue = valueElement.textContent?.trim();
      const groupKey = `group-${index}-${group.className}`;
      const previousValue = this.lastBalances.get(groupKey);
      

      
      if (previousValue !== undefined && previousValue !== currentValue) {

        changesDetected = true;
      }
      
      this.lastBalances.set(groupKey, currentValue);
    });
    
    if (changesDetected) {

      this.updateAllBadges();
    } else {

    }
  },
  
  // Update all PlanetHorse token badges
  updateAllBadges() {

    
    if (this.updateTimer) {

      clearTimeout(this.updateTimer);
    }
    
    this.updateTimer = setTimeout(() => {

      
      // Find all PlanetHorse token elements with multiple selectors
      const selectors = [
        '[class*="currencyGroup"] img[alt*="phorse"]',
        '.styles_currencyGroup__9k8gf img[alt*="phorse"]'
      ];
      
      let allImages = [];
      selectors.forEach((selector, i) => {
        const found = document.querySelectorAll(selector);

        found.forEach(img => {
          if (!allImages.includes(img)) allImages.push(img);
        });
      });
      

      
      if (allImages.length === 0) {

        // Log all images on page for debugging
        const allImgs = document.querySelectorAll('img');

        Array.from(allImgs).slice(0, 10).forEach((img, i) => {

        });
      }
      
      allImages.forEach((img, index) => {

        this.processPhorseElement(img);
      });
      

    }, 50);
  },
  
  // Process individual PlanetHorse element
  processPhorseElement(img) {

    
    // Skip if this is a medal or chest price (double-check safety)
    if (img.alt.includes('medal') || img.alt.includes('Medal')) {

      return;
    }
    if (img.alt === 'PHORSE') {

      return;
    }
    
    const currencyGroup = img.closest('[class*="currencyGroup"]');

    
    if (!currencyGroup) {

      // Log parent elements for debugging
      let parent = img.parentElement;
      let level = 0;
      while (parent && level < 5) {

        parent = parent.parentElement;
        level++;
      }
      return;
    }
    
    // Find the value element using robust content-based logic (ignore existing badges)

    
    // Get all spans that are not our badge
    const candidateSpans = currencyGroup.querySelectorAll(`span:not(.${CONFIG.BADGE_CLASS})`);
    let valueElement = null;
    
    // Find the span with numeric content
    for (const span of candidateSpans) {
      const text = span.textContent?.trim();
      if (text && /^\d+$/.test(text)) {
        valueElement = span;
        break;
      }
    }
    
    // Fallback: if no numeric content found, try the last non-badge span
    if (!valueElement && candidateSpans.length > 0) {
      valueElement = candidateSpans[candidateSpans.length - 1];
    }

    
    // Log all spans in currencyGroup for debugging
    const allSpans = currencyGroup.querySelectorAll('span');

    
    if (!valueElement) {

      return;
    }
    
    const textContent = valueElement.textContent.trim();
    const isNumeric = /^\d+$/.test(textContent);
    

    
    if (!isNumeric) {

      return;
    }
    
    const amount = parseFloat(textContent) || 0;

    
    if (isNaN(amount) || amount < 0) {

      return;
    }
    

    this.fetchPriceAndAddBadge(amount, valueElement);
  },
  
  // Fetch price and add USD badge
  fetchPriceAndAddBadge(amount, targetElement) {
    const timestamp = new Date().toISOString();
    
    const apiUrl = `${CONFIG.API_BASE_URL}${CONFIG.TOKEN_ADDRESS}&vs_currencies=usd`;
    
    chrome.runtime.sendMessage(
      { action: 'getPHPrice', url: apiUrl, address: CONFIG.TOKEN_ADDRESS },
      response => {
        if (response?.error) {
          logError('PlanetHorse Extension: API error:', response.error);
          return;
        }
        
        if (!response?.price) {
          return;
        }
        
        const usdValue = (amount * response.price).toFixed(2);
        
        this.addUSDBadge(targetElement, usdValue);
      }
    );
  },
  
  // Add USD badge to element
  addUSDBadge(targetElement, usdValue) {
    const timestamp = new Date().toISOString();
    
    const parent = targetElement.parentElement;
    const expectedText = `≈ $${usdValue}`;
    
    // Check if badge already exists with correct value
    const existingBadge = parent.querySelector(`.${CONFIG.BADGE_CLASS}`);
    
    if (existingBadge && existingBadge.textContent === expectedText) {
      return;
    }
    
    // Remove existing badge if value changed
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Create badge
    const badge = document.createElement('div');
    badge.className = CONFIG.BADGE_CLASS;
    badge.textContent = expectedText;
    
    // Style badge
    Object.assign(badge.style, {
      position: 'absolute',
      bottom: '-26px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      color: 'rgb(253, 218, 57)',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontFamily: 'SpaceHorse, monospace',
      fontWeight: 'bold',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
      whiteSpace: 'nowrap',
      zIndex: '1000',
      minWidth: '60px',
      textAlign: 'center',
      transition: 'opacity 0.2s ease-in-out',
      pointerEvents: 'none'
    });
    
    // Make parent relative for positioning
    if (parent.style.position !== 'relative') {
      parent.style.position = 'relative';
    }
    
    // Add badge
    parent.appendChild(badge);
    
    // Verify badge was added
    const verification = parent.querySelector(`.${CONFIG.BADGE_CLASS}`);
  },
  
  // Cleanup method
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
    }
    
    // Remove all badges
    const badges = document.querySelectorAll(`.${CONFIG.BADGE_CLASS}`);
    badges.forEach(badge => badge.remove());
  }
};

// ============= INITIALIZATION =============
setTimeout(() => {
  PlanetHorseUSD.init();
}, 1000);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  PlanetHorseUSD.cleanup();
});