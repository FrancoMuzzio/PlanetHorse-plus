import { defineConfig } from 'wxt';

export default defineConfig({
  // Project metadata
  manifest: {
    name: 'PlanetHorse+',
    version: '1.0.1', 
    description: 'Real-time multi-currency value converter for PH tokens',
    
    // Permissions
    permissions: [],
    host_permissions: [
      'https://exchange-rate.skymavis.com/*'
    ],

    // Content Security Policy
    content_security_policy: {
      extension_pages: "script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none';"
    }
  },

  // Browser startup configuration (v0.20+ syntax)
  webExt: {
    startUrls: ["https://planethorse.io/game"]
  }
});