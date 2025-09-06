import { defineConfig } from 'wxt';

export default defineConfig({
  // Project metadata
  manifest: {
    name: 'PlanetHorse+',
    description: 'Complete horse analysis, energy management, and marketplace integration tool for Planet Horse with multi-currency conversion',
    
    // Icons
    icons: {
      16: '/icons/icon-16.png',
      48: '/icons/icon-48.png',
      128: '/icons/icon-128.png'
    },
    
    // Permissions
    permissions: ['storage'],
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