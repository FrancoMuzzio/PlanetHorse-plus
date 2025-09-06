# PlanetHorse+ v2.0.0

A comprehensive Chrome extension for [Planet Horse](https://planethorse.io) that provides **complete horse analysis, management, and optimization tools**. Features real-time multi-currency conversion, automatic horse data extraction, energy recovery calculations, marketplace integration, and intelligent tooltips with persistent storage.

**Transform your Planet Horse experience with advanced analytics and automation.**

Built with **WXT Framework** and **TypeScript** for modern, fast development experience with Hot Module Replacement (HMR).

## What is Planet Horse?

Planet Horse is a Play-to-Earn horse racing game on the Ronin Network where players can race, train, and evolve their horses while earning PHORSE tokens. This extension enhances your gaming experience by automatically showing the real-time converted value of your token balance.

## Features

### 🐎 **Complete Horse Analysis System**
- **Automatic Data Extraction**: Real-time extraction of horse statistics, levels, energy, equipment, and breeding info
- **Intelligent Analysis**: Automated horse performance analysis with persistent storage
- **Dynamic Detection**: Monitors horse list changes and updates analysis automatically
- **Data Persistence**: Stores complete horse analysis data using WXT Storage API

### ⚡ **Energy Recovery Management**
- **Smart Calculations**: Precise energy recovery time estimates per horse
- **Status Detection**: Automatically detects if horses are racing/working or recovering
- **Interactive Tooltips**: Hover over horses to see detailed energy recovery information
- **Real-time Updates**: Continuously monitors energy states and recovery progress

### 🏪 **Marketplace Integration**
- **Direct Links**: One-click access to horse marketplace listings on Ronin and OpenSea
- **Contextual Buttons**: Marketplace buttons integrated seamlessly into horse displays
- **Multi-platform Support**: Access multiple marketplaces for each horse
- **Quick Navigation**: Streamlined workflow for trading and browsing horses

### 💰 **Advanced Currency Conversion**
- **Multi-Currency Support**: Convert PHORSE tokens to USD, EUR, ARS (fiat) or RON (token)
- **Custom Dropdown Selector**: Fully customized dropdown with game interface integration
- **Smart Caching**: Single API call for all exchange rates with session persistence
- **Real-time Updates**: Automatic balance detection with 500ms polling

### 📊 **Intelligent Tooltip System**
- **Contextual Information**: Rich tooltips displaying horse data, energy info, and analysis
- **Dynamic Positioning**: Smart tooltip placement avoiding UI conflicts
- **Comprehensive Data**: Shows statistics, equipment, breeding info, and recovery estimates
- **Visual Integration**: Consistent Planet Horse theming with professional styling

### ⚙️ **Advanced Settings & Configuration**
- **Comprehensive Settings Modal**: Full control over all extension features
- **Feature Toggles**: Enable/disable individual systems (conversion, analysis, tooltips, marketplace)
- **Currency Selection**: Granular control over enabled currencies and display preferences
- **Marketplace Configuration**: Choose which marketplace platforms to integrate
- **Shadow Root Isolation**: Settings interface with proper z-index management

### 🔧 **Technical Excellence**
- **Modular Architecture**: 9+ specialized utility modules for maintainability
- **Type-safe Storage**: Advanced persistent storage with automatic validation
- **Zero Configuration**: Works immediately after installation
- **TypeScript Support**: Full TypeScript with strict typing throughout
- **Performance Optimized**: Efficient DOM observation and smart caching
- **Cross-browser Ready**: Built with WXT for multi-browser compatibility

## Installation

### Development Mode

1. **Clone the repository**:
   ```bash
   git clone https://github.com/FrancoMuzzio/PlanetHorse-plus.git
   cd PlanetHorse-plus
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```

4. **Load in Chrome**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3/` folder (not the project root)

## Usage

Once installed, simply navigate to [Planet Horse](https://planethorse.io/game) and the extension will automatically provide:

1. **🐎 Horse Analysis**: Automatic extraction and analysis of all visible horses with persistent storage
2. **⚡ Energy Recovery Info**: Hover over horses to see detailed energy recovery calculations and status
3. **🏪 Marketplace Integration**: Direct access buttons to Ronin and OpenSea for each horse
4. **💰 Currency Conversion**: Interactive dropdown next to your PHORSE token balance
5. **⚙️ Advanced Settings**: Comprehensive settings modal for configuring all features

**Smart Tooltips** display rich information when hovering over horses. **Settings button** (⚙️) provides granular control over all features. **Zero configuration required** – all systems activate automatically!

## Development

### Available Scripts

- **`npm run dev`**: Start development mode with Hot Module Replacement (HMR)
- **`npm run build`**: Build the extension for production  
- **`npm run build:prod`**: Build for production with optimizations
- **`npm run zip`**: Build and create ZIP file for Chrome Web Store

### Project Structure

```
entrypoints/              # WXT entry points
├── content.ts            # Content script entry point
└── background.ts         # Background service worker
src/content/              # Business logic (TypeScript with ES modules)
├── main.ts              # Main orchestration, DOM observation, system coordination
├── config.ts            # Configuration constants, debug logging, design tokens
├── api.ts               # API communication with SkyMavis exchange rates
├── ui.ts                # WXT UI components for currency conversion
├── state.ts             # State management and conversion logic
├── storage.ts           # Advanced WXT Storage API for all persistent data
├── modals/              # Modal components with Shadow Root isolation
│   └── settings-modal.ts  # Comprehensive settings interface (798 lines)
├── utils/               # Specialized utility modules (9 files)
│   ├── dropdown.ts        # Custom dropdown component logic
│   ├── formatting.ts      # Price formatting and calculation utilities
│   ├── validation.ts      # Type validation and fallback utilities
│   ├── horse-analyzer.ts  # Main horse analysis orchestration
│   ├── horse-data-extractor.ts # DOM parsing and data extraction
│   ├── horse-observer.ts  # Dynamic horse detection and monitoring
│   ├── energy-recovery.ts # Energy calculations and tooltip management
│   ├── marketplace-buttons.ts # Marketplace integration and links
│   └── tooltip.ts         # Intelligent tooltip system
└── styles/              # Separated CSS architecture (5 files)
    ├── dropdown.css       # Custom dropdown component styles
    ├── grid.css           # Grid layout system for currency conversion
    ├── modal.css          # Settings modal and button styling
    ├── marketplace.css    # Marketplace buttons and integration
    └── tooltip.css        # Tooltip system styling and positioning
assets/icons/            # Extension assets
└── setting-gear.svg      # Settings button SVG icon
public/icons/            # WXT public icons
wxt.config.js            # WXT Framework configuration
.output/chrome-mv3/      # Built extension files (generated)
```

### Development Workflow

#### **Fast Development with HMR:**
1. **Start development server**:
   ```bash
   npm run dev
   ```
   → **Auto-opens Chrome** at `https://planethorse.io/game`  
   → **Extension pre-loaded** and ready for testing  
   → **Zero manual setup** required!

2. **Make changes**: Edit files in `src/content/` 
3. **Auto-reload**: Extension automatically updates with your changes!

#### **Production Build:**
1. **Build extension**:
   ```bash
   npm run build
   ```
2. **Test build**: Manually load `.output/chrome-mv3/` in Chrome for production testing
3. **Create ZIP for store**:
   ```bash
   npm run zip
   ```

### Architecture

#### **Core Framework & Infrastructure**
- **WXT Framework**: Modern web extension build system with Vite and HMR
- **Modular TypeScript**: 9+ specialized utility modules with strict typing throughout
- **Advanced Storage System**: Type-safe persistent storage for horse analysis and user preferences
- **No External Dependencies**: Pure browser APIs and WXT framework only
- **Shadow Root Isolation**: Modal interfaces with proper z-index management

#### **Horse Analysis & Data Systems**
- **Intelligent DOM Parsing**: Automated extraction of horse statistics, equipment, and breeding data
- **Dynamic Horse Detection**: MutationObserver-based monitoring of horse list changes
- **Persistent Analysis Storage**: Complete horse data persistence with automatic validation
- **Real-time Data Sync**: Continuous synchronization of horse states and analysis

#### **Energy Management Architecture**
- **Smart Energy Calculations**: Precise recovery time estimates based on horse status
- **State Detection Logic**: Automatic detection of racing/working vs recovery states
- **Contextual Tooltip System**: Rich information display with dynamic positioning
- **Real-time Monitoring**: Continuous energy state tracking and updates

#### **UI & Integration Systems**
- **Custom Component Library**: Native implementations resolving game cursor conflicts
- **Marketplace Integration**: Direct marketplace linking with multi-platform support
- **Design Token System**: Centralized theming via CONFIG.CSS_TOKENS
- **Features Toggle System**: Granular control via CONFIG.FEATURES flags
- **Multi-Currency Engine**: Smart caching with single API call architecture

#### **Performance & Compatibility**
- **Efficient DOM Observation**: Debounced initialization preventing infinite loops
- **Chrome Messaging Architecture**: Background script handling CORS-restricted API calls
- **Smart Caching Strategies**: Session-duration storage minimizing API requests
- **Cross-browser Compatibility**: WXT-based architecture for multi-browser support

## Support

### Found this helpful?

If you're new to Planet Horse and found this extension useful, you can use my referral link:
- **Referral URL**: https://planethorse.io/?ref=kevlar
- **Referral Code**: `kevlar`

### Donations

If you'd like to support the development of this extension, donations are welcome but never required:
- **Ronin Address**: `0x27eB87e9a58624f590653b0F164d82eE2Bf2D9f6`

### Bug Reports

Found an issue? Please report it on [GitHub Issues](https://github.com/FrancoMuzzio/PlanetHorse-plus/issues).

## Contributing

Contributions are welcome! Please follow these guidelines:

### Prerequisites
- Node.js (v18+) and npm installed
- Basic understanding of Chrome extension development
- TypeScript knowledge (helpful but not required)
- Familiarity with WXT Framework (optional - easy to learn!)

### Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feat/new-feature`
3. Install dependencies: `npm install` 
4. Start development: `npm run dev`
5. Make your changes in `src/content/`
6. Build and test: `npm run build`
7. Test the extension by loading `.output/chrome-mv3/` in Chrome
8. Submit a pull request with a clear description

### Conventions

- **Branches**: Use [Conventional Branch](https://conventional-branch.github.io/) format
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)  
- **Code**: TypeScript with strict typing, function/variable names in English, comments in English
- **Build**: Always test that `npm run build` works before submitting PRs
- **Testing**: Comprehensive testing of all systems: horse analysis, energy recovery, marketplace integration, currency conversion, tooltips, and settings modal

### Development Tips

- Use `npm run dev` for fastest development with HMR and auto-navigation
- **Modular Development**: Place utilities in `utils/` and styles in `styles/` for better organization
- **Design Tokens**: Use `CONFIG.CSS_TOKENS` instead of hardcoded values for consistent theming
- **Features Flags**: Toggle functionality via `CONFIG.FEATURES` for easier testing
- **Storage Testing**: Test WXT Storage persistence by refreshing browser
- **Custom Components**: Extend dropdown.ts for new custom UI components
- Enable debug logging: Set `CONFIG.DEBUG = true` in `src/content/config.ts`
- Debug logs use `debugLog()` function and are prefixed with '[Planet Horse Extension]'
- Test on planethorse.io/game after every change
- **CSS Development**: Edit separated CSS files in `styles/` for better maintainability
- **Validation**: Use validation utilities from `utils/validation.ts` for type safety
- WXT auto-generates manifest.json - configure in `wxt.config.js`

### Testing Guidelines

Comprehensive manual testing process for all systems:

#### **1. Horse Analysis System Testing**
- Navigate to [Planet Horse game](https://planethorse.io/game) with horses visible
- Verify automatic horse data extraction from DOM elements
- Check that horse statistics, levels, energy, equipment are detected correctly
- Confirm horse analysis data persists after page refresh (WXT Storage)
- Test dynamic detection: add/remove horses and verify analysis updates
- Verify horse list changes trigger reanalysis automatically

#### **2. Energy Recovery System Testing**  
- Hover over horses to display energy recovery tooltips
- Verify energy recovery calculations show correct time estimates
- Test status detection: horses racing/working vs recovering
- Confirm tooltips display properly without UI conflicts
- Check that energy states update in real-time
- Verify tooltip positioning adapts to screen boundaries

#### **3. Marketplace Integration Testing**
- Verify marketplace buttons appear on horse displays
- Test direct links to Ronin and OpenSea marketplaces
- Confirm buttons integrate visually with existing UI
- Check that marketplace URLs are correctly generated
- Test marketplace button configuration in settings

#### **4. Currency Conversion Testing**
- Verify multi-currency selector and converted price appear next to token balance
- Test custom dropdown functionality: USD (💲), EUR (💲), ARS (💲), RON (🌐)
- Confirm dropdown opens/closes with click-outside detection
- Verify prices update immediately without API delay (cached)
- Test balance change detection with automatic updates

#### **5. Settings Modal & Configuration Testing**
- Verify settings button (⚙️) appears in game interface
- Test settings modal opens with Shadow Root isolation
- Confirm all feature toggles work correctly
- Test currency selection persistence
- Verify marketplace configuration options
- Check modal close functionality and z-index management

#### **6. Advanced System Testing**
- **Storage Persistence**: Refresh page, verify all preferences and horse data persist
- **Performance Testing**: Monitor console for errors with `CONFIG.DEBUG = true`
- **SPA Navigation**: Navigate between game sections, verify components remount correctly
- **Cross-browser Testing**: Verify functionality across different browsers
- **Error Handling**: Test with network issues, API failures, invalid data

## Technical Details

### WXT Framework Benefits
- **Lightning-fast builds** with Vite bundler
- **Hot Module Replacement** for instant development feedback  
- **Auto-manifest generation** based on entrypoints
- **TypeScript support** without configuration
- **Cross-browser compatibility** built-in
- **Professional tooling** for modern web extension development

### Performance
- **Build time**: Ultra-fast builds with Vite bundler
- **Bundle size**: Optimized and compressed output
- **Zero runtime dependencies**: Pure browser APIs only
- **Efficient caching**: Single API call fetches all exchange rates for session
- **Type safety**: Compile-time error checking with TypeScript

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Disclaimer

**This is an UNOFFICIAL extension** developed independently by the community. It is not affiliated with, endorsed by, or connected to Planet Horse or its developers.

- Planet Horse™ and all related assets are property of their respective owners
- Use this extension at your own risk

---

**Enhance your Planet Horse experience with community-built tools!** 🐴💰

*Built with ❤️ using WXT Framework*