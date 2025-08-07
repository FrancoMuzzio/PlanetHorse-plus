// ============= CONFIGURATION =============
const CONFIG = {
  TOKEN_ADDRESS: '0x7f8e304eb2894e57f8b930000f396319729bd1f1',
  API_BASE_URL: 'https://exchange-rate.skymavis.com/v2/prices?addresses=',
  BADGE_CLASS: 'ph-usd-badge'
};

// ============= MAIN CLASS =============
const PlanetHorseUSD = {
  observer: null,
  currentURL: window.location.href,
  debounceTimer: null,
  updateTimer: null,
  
  // Initialize the extension
  init() {
    this.setupNavigation();
    this.setupObserver();
    this.updateAllBadges();
    console.log('🚀 PlanetHorse USD Viewer - Simplified');
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
  
  // Setup DOM observer with debouncing
  setupObserver() {
    if (this.observer) this.observer.disconnect();
    
    this.observer = new MutationObserver(() => {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      
      this.debounceTimer = setTimeout(() => {
        this.updateAllBadges();
      }, 200);
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
  },
  
  // Update all PlanetHorse token badges
  updateAllBadges() {
    if (this.updateTimer) clearTimeout(this.updateTimer);
    
    this.updateTimer = setTimeout(() => {
      console.log('🔍 [DEBUG] Starting updateAllBadges');
      
      // Find all PlanetHorse token elements
      const allImages = document.querySelectorAll('[class*="currencyGroup"] img[alt*="phorse"]');
      console.log('🔍 [DEBUG] Found images:', allImages.length);
      
      allImages.forEach((img, index) => {
        console.log(`🔍 [DEBUG] Processing image ${index}:`, {
          alt: img.alt,
          src: img.src.substring(0, 100),
          currencyGroupClass: img.closest('[class*="currencyGroup"]')?.className,
          containerClass: img.closest('[class*="countCurrency"]')?.className,
          imageType: img.alt.includes('coin') ? 'phorse coin' : 'phorse'
        });
        this.processPhorseElement(img);
      });
    }, 50);
  },
  
  // Process individual PlanetHorse element
  processPhorseElement(img) {
    console.log('🔍 [DEBUG] processPhorseElement called with img:', {
      alt: img.alt,
      src: img.src.substring(0, 100)
    });
    
    // Skip if this is a medal or chest price (double-check safety)
    if (img.alt.includes('medal') || img.alt.includes('Medal')) {
      console.log('🔍 [DEBUG] Skipping medal image');
      return;
    }
    if (img.alt === 'PHORSE') {
      console.log('🔍 [DEBUG] Skipping chest price image');
      return;
    }
    
    const currencyGroup = img.closest('[class*="currencyGroup"]');
    console.log('🔍 [DEBUG] currencyGroup found:', currencyGroup?.className);
    if (!currencyGroup) return;
    
    // Find the value element
    const valueElement = currencyGroup.querySelector('span:last-child');
    console.log('🔍 [DEBUG] valueElement found:', {
      element: valueElement?.tagName,
      text: valueElement?.textContent?.trim(),
      searchedIn: 'currencyGroup (FIXED)',
      currencyGroupClass: currencyGroup.className
    });
    
    if (!valueElement || !valueElement.textContent.trim().match(/^\d+$/)) {
      console.log('🔍 [DEBUG] Skipping - no valid valueElement');
      return;
    }
    
    const amount = parseFloat(valueElement.textContent.trim()) || 0;
    console.log('🔍 [DEBUG] Amount parsed:', amount);
    if (amount === 0) {
      console.log('🔍 [DEBUG] Skipping - amount is 0');
      return;
    }
    
    console.log('🔍 [DEBUG] Proceeding to fetchPriceAndAddBadge for amount:', amount);
    this.fetchPriceAndAddBadge(amount, valueElement);
  },
  
  // Fetch price and add USD badge
  fetchPriceAndAddBadge(amount, targetElement) {
    console.log('🔍 [DEBUG] fetchPriceAndAddBadge called with:', {
      amount,
      targetElement: targetElement?.tagName,
      targetText: targetElement?.textContent?.trim()
    });
    
    const apiUrl = `${CONFIG.API_BASE_URL}${CONFIG.TOKEN_ADDRESS}&vs_currencies=usd`;
    
    chrome.runtime.sendMessage(
      { action: 'getPHPrice', url: apiUrl, address: CONFIG.TOKEN_ADDRESS },
      response => {
        if (response?.error || !response?.price) {
          console.log('🔍 [DEBUG] No price response or error');
          return;
        }
        
        const usdValue = (amount * response.price).toFixed(2);
        console.log('🔍 [DEBUG] Creating badge with USD value:', usdValue);
        this.addUSDBadge(targetElement, usdValue);
      }
    );
  },
  
  // Add USD badge to element
  addUSDBadge(targetElement, usdValue) {
    console.log('🔍 [DEBUG] addUSDBadge called:', {
      usdValue,
      targetText: targetElement?.textContent?.trim(),
      parentClass: targetElement?.parentElement?.className
    });
    
    const parent = targetElement.parentElement;
    const expectedText = `≈ $${usdValue}`;
    
    // Check if badge already exists with correct value
    const existingBadge = parent.querySelector(`.${CONFIG.BADGE_CLASS}`);
    if (existingBadge && existingBadge.textContent === expectedText) {
      console.log('🔍 [DEBUG] Badge already exists with correct value');
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
    console.log('🔍 [DEBUG] Badge added successfully to parent:', parent.className);
  },
  
  // Cleanup method
  cleanup() {
    if (this.observer) this.observer.disconnect();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (this.updateTimer) clearTimeout(this.updateTimer);
    
    // Remove all badges
    document.querySelectorAll(`.${CONFIG.BADGE_CLASS}`).forEach(badge => badge.remove());
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