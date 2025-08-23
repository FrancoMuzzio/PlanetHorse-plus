// ============= WXT CONTENT SCRIPT ENTRY POINT =============
// This file serves as the WXT entry point for content scripts
// All business logic remains in src/content/ (unchanged)

import { defineContentScript } from '#imports';

export default defineContentScript({
  matches: ['https://planethorse.io/game*'],
  async main() {
    // Import and execute the main content script logic
    await import('../src/content/main.js');
  },
});