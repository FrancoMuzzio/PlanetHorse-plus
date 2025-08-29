// ============= WXT CONTENT SCRIPT ENTRY POINT =============
// This file serves as the WXT entry point for content scripts
// All business logic remains in src/content/ (unchanged)

import { defineContentScript } from '#imports';
// Import CSS styles for the extension
import '../src/content/styles/dropdown.css';
import '../src/content/styles/grid.css';
import '../src/content/styles/modal.css';

export default defineContentScript({
  matches: ['*://planethorse.io/*'],
  async main(ctx) {
    // Import and execute the main content script logic
    const { initialize } = await import('../src/content/main');
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initialize(ctx));
    } else {
      initialize(ctx);
    }
  },
});