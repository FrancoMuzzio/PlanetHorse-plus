import { defineConfig } from 'wxt';

export default defineConfig({
  // Project metadata
  manifest: {
    name: 'PlanetHorse+',
    description: 'Real-time multi-currency value converter for PH tokens',
    
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
    },

    // Web accessible resources for content scripts
    web_accessible_resources: [
      {
        resources: [
          "icons/setting-gear.svg"
        ],
        matches: [
          "https://planethorse.io/*"
        ]
      }
    ]
  },

  // Browser startup configuration (v0.20+ syntax)
  webExt: {
    startUrls: ["https://planethorse.io/game"]
  }
});