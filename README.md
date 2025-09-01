# PlanetHorse+ v2.0.0

A Chrome extension that displays real-time multi-currency conversion for your PH tokens on [Planet Horse](https://planethorse.io). Support for USD, EUR, ARS (fiat currencies) plus RON (token) with an interactive currency selector.

Built with **WXT Framework** and **TypeScript** for modern, fast development experience with Hot Module Replacement (HMR).

## What is Planet Horse?

Planet Horse is a Play-to-Earn horse racing game on the Ronin Network where players can race, train, and evolve their horses while earning PHORSE tokens. This extension enhances your gaming experience by automatically showing the real-time converted value of your token balance.

## Features

- **Multi-Currency Support**: Convert PHORSE tokens to USD, EUR, ARS (fiat) or RON (token) with real-time rates
- **Custom Dropdown Selector**: Fully customized dropdown resolving cursor conflicts with game interface
  - Click-outside detection for seamless UX
  - Perfect visual integration with Planet Horse design
  - Arrow rotation animations and hover effects
- **Settings Button & Modal**: Integrated settings interface with Shadow Root isolation
  - Gear icon (⚙️) auto-mounted in game interface
  - Modal with proper z-index management (game cursor stays on top)
  - Professional styling matching Planet Horse theme
- **Automatic Balance Detection**: Real-time polling system detects balance changes automatically
  - 500ms polling interval for instant conversion updates
  - Efficient cleanup when navigating away
- **User Preference Persistence**: Currency selection persists across browser sessions
  - Type-safe WXT Storage API with automatic validation
  - Graceful fallback to default currency if preference becomes invalid
- **Smart Caching**: Optimized performance with single SkyMavis API call for all exchange rates
- **Non-invasive Integration**: Seamlessly adds to the existing UI without disrupting gameplay
- **Modular Architecture**: Clean separation of utilities and styles for maintainability
- **Zero Configuration**: Works immediately after installation
- **TypeScript Support**: Full TypeScript with strict typing and compile-time error checking
- **Cross-browser Ready**: Built with WXT for future Firefox, Edge, and Safari support

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

Once installed, simply navigate to [Planet Horse](https://planethorse.io/game) and the extension will automatically display:

1. **Currency Selector & Converted Value**: Interactive dropdown next to your PHORSE token balance
2. **Settings Button**: Gear icon (⚙️) for accessing extension settings and configuration

Click the dropdown to switch between USD (💲), EUR (💲), ARS (💲) fiat currencies, and RON (🌐) token conversions. Click the settings button to access advanced configuration options. No initial setup required!

## Development

### Available Scripts

- **`npm run dev`**: Start development mode with Hot Module Replacement (HMR)
- **`npm run build`**: Build the extension for production  
- **`npm run build:prod`**: Build for production with optimizations
- **`npm run zip`**: Build and create ZIP file for Chrome Web Store

### Project Structure

```
entrypoints/            # WXT entry points
├── content.ts          # Content script entry point
└── background.ts       # Background service worker
src/content/            # Business logic (TypeScript with ES modules)
├── main.ts            # Main orchestration, DOM observation, modal management
├── config.ts          # Configuration constants, debug logging, design tokens
├── api.ts             # API communication with SkyMavis
├── ui.ts              # WXT UI components for currency conversion
├── state.ts           # State management and conversion logic
├── storage.ts         # WXT Storage API for user preferences persistence
├── utils/             # Modular utility functions
│   ├── dropdown.ts    # Custom dropdown component logic
│   ├── formatting.ts  # Price formatting and calculation utilities
│   └── validation.ts  # Conversion type validation utilities
└── styles/            # Separated CSS for maintainability
    ├── dropdown.css   # Custom dropdown component styles
    ├── grid.css       # Grid layout system styles
    └── modal.css      # Settings modal and button styles
assets/icons/          # Extension assets
├── setting-gear.svg   # Settings button icon
public/icons/          # WXT public icons
wxt.config.js          # WXT Framework configuration
.output/chrome-mv3/    # Built extension files (generated)
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

- **WXT Framework**: Modern web extension build system with Vite and HMR
- **Modular TypeScript**: Clean separation with utils/ and styles/ modules for maintainability
- **Custom UI Components**: Native dropdown implementation resolving game cursor conflicts
- **WXT Storage Integration**: Type-safe user preferences persistence with automatic validation
- **Design Token System**: Centralized theming via CONFIG.CSS_TOKENS for consistent styling
- **Features Flags**: Toggle-able functionality via CONFIG.FEATURES for flexible deployment
- **Balance Change Detection**: Automatic polling system for real-time conversion updates
- **No External Dependencies**: Pure browser APIs and WXT framework only
- **MutationObserver**: Detects SPA navigation changes efficiently with debounced initialization
- **Chrome Messaging**: Background script handles CORS-restricted SkyMavis API calls
- **Smart Caching**: Single API call fetches all token prices for session duration
- **Shadow Root Isolation**: Settings modal with proper z-index management for game compatibility

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
- **Testing**: Verify multi-currency conversion, settings modal, and UI functionality

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