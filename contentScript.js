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
  pollingTimer: null,
  lastBalances: new Map(), // Cache para detectar cambios
  
  // Initialize the extension
  init() {
    const timestamp = new Date().toISOString();
    console.log(`🚀 [ULTRA-DEBUG] ${timestamp} - PlanetHorse USD Viewer - ULTRA DEBUG MODE`);
    console.log('🔧 [ULTRA-DEBUG] Starting initialization sequence...');
    
    this.setupNavigation();
    this.setupObserver();
    this.setupPollingBackup();
    this.updateAllBadges();
    
    console.log('✅ [ULTRA-DEBUG] Initialization completed');
  },
  
  // Setup navigation detection for SPA
  setupNavigation() {
    console.log('🧭 [ULTRA-DEBUG] Setting up navigation detection');
    
    // URL change detection
    console.log('🧭 [ULTRA-DEBUG] Setting up URL change detection (500ms interval)');
    setInterval(() => {
      if (window.location.href !== this.currentURL) {
        console.log('🧭 [ULTRA-DEBUG] URL change detected:', {
          from: this.currentURL,
          to: window.location.href
        });
        this.currentURL = window.location.href;
        console.log('🧭 [ULTRA-DEBUG] Triggering updateAllBadges after URL change (500ms delay)');
        setTimeout(() => this.updateAllBadges(), 500);
      }
    }, 500);
    
    // Visibility change
    console.log('🧭 [ULTRA-DEBUG] Setting up visibility change detection');
    document.addEventListener('visibilitychange', () => {
      console.log('🧭 [ULTRA-DEBUG] Visibility change detected:', {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      });
      
      if (!document.hidden) {
        console.log('🧭 [ULTRA-DEBUG] Tab became visible - triggering updateAllBadges (300ms delay)');
        setTimeout(() => this.updateAllBadges(), 300);
      }
    });
    
    console.log('✅ [ULTRA-DEBUG] Navigation detection setup completed');
  },
  
  // Setup DOM observer with ultra-aggressive logging
  setupObserver() {
    console.log('🔧 [ULTRA-DEBUG] Setting up MutationObserver with aggressive logging');
    if (this.observer) this.observer.disconnect();
    
    this.observer = new MutationObserver((mutations) => {
      const timestamp = new Date().toISOString();
      console.log(`👀 [ULTRA-DEBUG] ${timestamp} - MutationObserver triggered with ${mutations.length} mutations`);
      
      mutations.forEach((mutation, index) => {
        const target = mutation.target;
        console.log(`🔍 [ULTRA-DEBUG] Mutation ${index}:`, {
          type: mutation.type,
          target: target.tagName,
          targetClass: target.className,
          textContent: target.textContent?.substring(0, 50) + (target.textContent?.length > 50 ? '...' : ''),
          oldValue: mutation.oldValue,
          addedNodes: mutation.addedNodes?.length || 0,
          removedNodes: mutation.removedNodes?.length || 0,
          attributeName: mutation.attributeName
        });
        
        // Log específico para currency groups
        if (target.className?.includes('currencyGroup') || target.closest?.('[class*="currencyGroup"]')) {
          console.log(`💰 [ULTRA-DEBUG] CURRENCY-RELATED MUTATION DETECTED!`, {
            type: mutation.type,
            target: target.tagName,
            className: target.className,
            textContent: target.textContent,
            parentClass: target.parentElement?.className
          });
        }
        
        // Log para spans con números
        if (target.tagName === 'SPAN' && target.textContent?.match(/^\d+$/)) {
          console.log(`🔢 [ULTRA-DEBUG] NUMERIC SPAN CHANGE DETECTED!`, {
            newValue: target.textContent,
            oldValue: mutation.oldValue,
            parentClass: target.parentElement?.className
          });
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
          console.log('🎯 [ULTRA-DEBUG] RELEVANT MUTATION FOUND - will trigger updateAllBadges');
        }
        
        return isRelevant;
      });
      
      if (relevantMutations) {
        if (this.debounceTimer) {
          console.log('⏱️ [ULTRA-DEBUG] Clearing previous debounce timer');
          clearTimeout(this.debounceTimer);
        }
        
        console.log('⏱️ [ULTRA-DEBUG] Setting debounce timer (100ms)');
        this.debounceTimer = setTimeout(() => {
          console.log('🔄 [ULTRA-DEBUG] Debounce timer fired - calling updateAllBadges');
          this.updateAllBadges();
        }, 100);
      } else {
        console.log('❌ [ULTRA-DEBUG] No relevant mutations found - ignoring');
      }
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
    
    console.log('✅ [ULTRA-DEBUG] MutationObserver setup completed');
  },
  
  // Setup polling backup
  setupPollingBackup() {
    console.log('⏰ [ULTRA-DEBUG] Setting up polling backup every 5 seconds');
    this.pollingTimer = setInterval(() => {
      if (!document.hidden) {
        console.log('🔄 [ULTRA-DEBUG] Polling backup triggered - checking for changes');
        this.checkForBalanceChanges();
      }
    }, 5000);
  },
  
  // Check for balance changes manually
  checkForBalanceChanges() {
    const timestamp = new Date().toISOString();
    console.log(`🕵️ [ULTRA-DEBUG] ${timestamp} - Manual balance change check`);
    
    const currencyGroups = document.querySelectorAll('[class*="currencyGroup"]');
    console.log(`🔍 [ULTRA-DEBUG] Found ${currencyGroups.length} currency groups`);
    
    let changesDetected = false;
    
    currencyGroups.forEach((group, index) => {
      const img = group.querySelector('img[alt*="phorse"]');
      if (!img) return;
      
      const valueElement = group.querySelector(`span:last-child:not(.${CONFIG.BADGE_CLASS})`);
      if (!valueElement) return;
      
      const currentValue = valueElement.textContent?.trim();
      const groupKey = `group-${index}-${group.className}`;
      const previousValue = this.lastBalances.get(groupKey);
      
      console.log(`🔍 [ULTRA-DEBUG] Group ${index} - Current: "${currentValue}", Previous: "${previousValue}"`);
      
      if (previousValue !== undefined && previousValue !== currentValue) {
        console.log(`🚨 [ULTRA-DEBUG] BALANCE CHANGE DETECTED! Group ${index}: "${previousValue}" → "${currentValue}"`);
        changesDetected = true;
      }
      
      this.lastBalances.set(groupKey, currentValue);
    });
    
    if (changesDetected) {
      console.log('🔄 [ULTRA-DEBUG] Balance changes detected - triggering updateAllBadges');
      this.updateAllBadges();
    } else {
      console.log('✅ [ULTRA-DEBUG] No balance changes detected');
    }
  },
  
  // Update all PlanetHorse token badges
  updateAllBadges() {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [ULTRA-DEBUG] ${timestamp} - updateAllBadges called`);
    
    if (this.updateTimer) {
      console.log('⏱️ [ULTRA-DEBUG] Clearing previous update timer');
      clearTimeout(this.updateTimer);
    }
    
    this.updateTimer = setTimeout(() => {
      console.log('🚀 [ULTRA-DEBUG] Update timer fired - starting badge update process');
      
      // Find all PlanetHorse token elements with multiple selectors
      const selectors = [
        '[class*="currencyGroup"] img[alt*="phorse"]',
        '.styles_currencyGroup__9k8gf img[alt*="phorse"]'
      ];
      
      let allImages = [];
      selectors.forEach((selector, i) => {
        const found = document.querySelectorAll(selector);
        console.log(`🔍 [ULTRA-DEBUG] Selector ${i} (${selector}): found ${found.length} elements`);
        found.forEach(img => {
          if (!allImages.includes(img)) allImages.push(img);
        });
      });
      
      console.log('🔍 [ULTRA-DEBUG] Total unique images found:', allImages.length);
      
      if (allImages.length === 0) {
        console.log('⚠️ [ULTRA-DEBUG] NO PHORSE IMAGES FOUND - this might be the problem!');
        // Log all images on page for debugging
        const allImgs = document.querySelectorAll('img');
        console.log(`🔍 [ULTRA-DEBUG] Total images on page: ${allImgs.length}`);
        Array.from(allImgs).slice(0, 10).forEach((img, i) => {
          console.log(`🔍 [ULTRA-DEBUG] Image ${i}:`, {
            alt: img.alt,
            src: img.src.substring(0, 100),
            className: img.className
          });
        });
      }
      
      allImages.forEach((img, index) => {
        console.log(`🔍 [ULTRA-DEBUG] Processing image ${index}:`, {
          alt: img.alt,
          src: img.src.substring(0, 100),
          currencyGroupClass: img.closest('[class*="currencyGroup"]')?.className,
          imageType: img.alt.includes('coin') ? 'phorse coin' : 'phorse'
        });
        this.processPhorseElement(img);
      });
      
      console.log('✅ [ULTRA-DEBUG] Badge update process completed');
    }, 50);
  },
  
  // Process individual PlanetHorse element
  processPhorseElement(img) {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [ULTRA-DEBUG] ${timestamp} - processPhorseElement called with img:`, {
      alt: img.alt,
      src: img.src.substring(0, 100),
      className: img.className
    });
    
    // Skip if this is a medal or chest price (double-check safety)
    if (img.alt.includes('medal') || img.alt.includes('Medal')) {
      console.log('⏭️ [ULTRA-DEBUG] Skipping medal image');
      return;
    }
    if (img.alt === 'PHORSE') {
      console.log('⏭️ [ULTRA-DEBUG] Skipping chest price image');
      return;
    }
    
    const currencyGroup = img.closest('[class*="currencyGroup"]');
    console.log('🔍 [ULTRA-DEBUG] currencyGroup search result:', {
      found: !!currencyGroup,
      className: currencyGroup?.className,
      innerHTML: currencyGroup?.innerHTML?.substring(0, 200)
    });
    
    if (!currencyGroup) {
      console.log('❌ [ULTRA-DEBUG] No currencyGroup found - this might be the issue!');
      // Log parent elements for debugging
      let parent = img.parentElement;
      let level = 0;
      while (parent && level < 5) {
        console.log(`🔍 [ULTRA-DEBUG] Parent level ${level}:`, {
          tagName: parent.tagName,
          className: parent.className,
          hasPhorse: parent.innerHTML?.includes('phorse')
        });
        parent = parent.parentElement;
        level++;
      }
      return;
    }
    
    // Find the value element (ignore existing badges)
    const selector = `span:last-child:not(.${CONFIG.BADGE_CLASS})`;
    console.log('🔍 [ULTRA-DEBUG] Searching for value element with selector:', selector);
    
    const valueElement = currencyGroup.querySelector(selector);
    console.log('🔍 [ULTRA-DEBUG] valueElement search result:', {
      found: !!valueElement,
      element: valueElement?.tagName,
      text: valueElement?.textContent?.trim(),
      className: valueElement?.className,
      parentClass: valueElement?.parentElement?.className,
      allSpans: currencyGroup.querySelectorAll('span').length
    });
    
    // Log all spans in currencyGroup for debugging
    const allSpans = currencyGroup.querySelectorAll('span');
    console.log(`🔍 [ULTRA-DEBUG] All spans in currencyGroup (${allSpans.length}):`);
    allSpans.forEach((span, i) => {
      console.log(`🔍 [ULTRA-DEBUG] Span ${i}:`, {
        textContent: span.textContent?.trim(),
        className: span.className,
        hasBadgeClass: span.classList.contains(CONFIG.BADGE_CLASS),
        isLastChild: span === span.parentElement.lastElementChild
      });
    });
    
    if (!valueElement) {
      console.log('❌ [ULTRA-DEBUG] No valueElement found with selector');
      return;
    }
    
    const textContent = valueElement.textContent.trim();
    const isNumeric = /^\d+$/.test(textContent);
    
    console.log('🔍 [ULTRA-DEBUG] Value validation:', {
      textContent: `"${textContent}"`,
      isNumeric: isNumeric,
      length: textContent.length,
      regex: textContent.match(/^\d+$/)
    });
    
    if (!isNumeric) {
      console.log('❌ [ULTRA-DEBUG] Skipping - not numeric text');
      return;
    }
    
    const amount = parseFloat(textContent) || 0;
    console.log('🔍 [ULTRA-DEBUG] Amount parsing:', {
      textContent: textContent,
      parsed: amount,
      isNaN: isNaN(amount),
      isNegative: amount < 0
    });
    
    if (isNaN(amount) || amount < 0) {
      console.log('❌ [ULTRA-DEBUG] Skipping - invalid amount (NaN or negative)');
      return;
    }
    
    console.log('✅ [ULTRA-DEBUG] All validations passed - proceeding to fetchPriceAndAddBadge for amount:', amount);
    this.fetchPriceAndAddBadge(amount, valueElement);
  },
  
  // Fetch price and add USD badge
  fetchPriceAndAddBadge(amount, targetElement) {
    const timestamp = new Date().toISOString();
    console.log(`💰 [ULTRA-DEBUG] ${timestamp} - fetchPriceAndAddBadge called with:`, {
      amount,
      targetElement: targetElement?.tagName,
      targetText: targetElement?.textContent?.trim(),
      targetClass: targetElement?.className
    });
    
    const apiUrl = `${CONFIG.API_BASE_URL}${CONFIG.TOKEN_ADDRESS}&vs_currencies=usd`;
    console.log('💰 [ULTRA-DEBUG] Sending message to background script:', {
      action: 'getPHPrice',
      url: apiUrl,
      address: CONFIG.TOKEN_ADDRESS
    });
    
    chrome.runtime.sendMessage(
      { action: 'getPHPrice', url: apiUrl, address: CONFIG.TOKEN_ADDRESS },
      response => {
        console.log('💰 [ULTRA-DEBUG] Received response from background script:', response);
        
        if (response?.error) {
          console.log('❌ [ULTRA-DEBUG] Error in response:', response.error);
          return;
        }
        
        if (!response?.price) {
          console.log('❌ [ULTRA-DEBUG] No price in response');
          return;
        }
        
        const usdValue = (amount * response.price).toFixed(2);
        console.log('💰 [ULTRA-DEBUG] Calculated USD value:', {
          amount,
          price: response.price,
          usdValue
        });
        
        this.addUSDBadge(targetElement, usdValue);
      }
    );
  },
  
  // Add USD badge to element
  addUSDBadge(targetElement, usdValue) {
    const timestamp = new Date().toISOString();
    console.log(`🏷️ [ULTRA-DEBUG] ${timestamp} - addUSDBadge called:`, {
      usdValue,
      targetText: targetElement?.textContent?.trim(),
      targetClass: targetElement?.className,
      parentClass: targetElement?.parentElement?.className
    });
    
    const parent = targetElement.parentElement;
    const expectedText = `≈ $${usdValue}`;
    
    console.log('🏷️ [ULTRA-DEBUG] Badge creation details:', {
      parent: parent?.tagName,
      parentClass: parent?.className,
      expectedText
    });
    
    // Check if badge already exists with correct value
    const existingBadge = parent.querySelector(`.${CONFIG.BADGE_CLASS}`);
    console.log('🏷️ [ULTRA-DEBUG] Existing badge check:', {
      existingBadge: !!existingBadge,
      existingText: existingBadge?.textContent,
      expectedText,
      textMatch: existingBadge?.textContent === expectedText
    });
    
    if (existingBadge && existingBadge.textContent === expectedText) {
      console.log('✅ [ULTRA-DEBUG] Badge already exists with correct value - skipping');
      return;
    }
    
    // Remove existing badge if value changed
    if (existingBadge) {
      console.log('🗑️ [ULTRA-DEBUG] Removing existing badge with different value');
      existingBadge.remove();
    }
    
    // Create badge
    console.log('🏗️ [ULTRA-DEBUG] Creating new badge element');
    const badge = document.createElement('div');
    badge.className = CONFIG.BADGE_CLASS;
    badge.textContent = expectedText;
    
    // Style badge
    console.log('🎨 [ULTRA-DEBUG] Applying badge styles');
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
    console.log('📐 [ULTRA-DEBUG] Setting parent position to relative');
    if (parent.style.position !== 'relative') {
      parent.style.position = 'relative';
    }
    
    // Add badge
    console.log('➕ [ULTRA-DEBUG] Appending badge to parent');
    parent.appendChild(badge);
    
    // Verify badge was added
    const verification = parent.querySelector(`.${CONFIG.BADGE_CLASS}`);
    console.log('✅ [ULTRA-DEBUG] Badge addition verification:', {
      badgeAdded: !!verification,
      badgeText: verification?.textContent,
      badgeVisible: verification?.offsetHeight > 0,
      parentChildrenCount: parent.children.length
    });
    
    console.log('🎉 [ULTRA-DEBUG] Badge creation completed successfully');
  },
  
  // Cleanup method
  cleanup() {
    console.log('🧹 [ULTRA-DEBUG] Starting cleanup...');
    
    if (this.observer) {
      this.observer.disconnect();
      console.log('🧹 [ULTRA-DEBUG] MutationObserver disconnected');
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      console.log('🧹 [ULTRA-DEBUG] Debounce timer cleared');
    }
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      console.log('🧹 [ULTRA-DEBUG] Update timer cleared');
    }
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      console.log('🧹 [ULTRA-DEBUG] Polling timer cleared');
    }
    
    // Remove all badges
    const badges = document.querySelectorAll(`.${CONFIG.BADGE_CLASS}`);
    console.log(`🧹 [ULTRA-DEBUG] Removing ${badges.length} badges`);
    badges.forEach(badge => badge.remove());
    
    console.log('✅ [ULTRA-DEBUG] Cleanup completed');
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