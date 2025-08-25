# PlanetHorse+ v1.0.1

A Chrome extension that displays real-time multi-currency conversion for your PH tokens on [Planet Horse](https://planethorse.io). Support for USD, EUR, ARS (fiat currencies) plus RON (token) with an interactive currency selector.

Built with **WXT Framework** and **TypeScript** for modern, fast development experience with Hot Module Replacement (HMR).

## What is Planet Horse?

Planet Horse is a Play-to-Earn horse racing game on the Ronin Network where players can race, train, and evolve their horses while earning PHORSE tokens. This extension enhances your gaming experience by automatically showing the real-time converted value of your token balance.

## Features

- **Multi-Currency Support**: Convert PHORSE tokens to USD, EUR, ARS (fiat) or RON (token) with real-time rates
- **Interactive Currency Selector**: Easy-to-use dropdown to switch between conversion types  
- **Smart Caching**: Optimized performance with single SkyMavis API call for all exchange rates
- **Non-invasive Integration**: Seamlessly adds to the existing UI without disrupting gameplay
- **Automatic Updates**: Refreshes whenever your balance changes
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

Once installed, simply navigate to [Planet Horse](https://planethorse.io/game) and the extension will automatically display a currency selector and converted value next to your PHORSE token balance. Click the dropdown to switch between USD (💲), EUR (💲), ARS (💲) fiat currencies, and RON (🌐) token conversions. No configuration needed!

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
├── main.ts            # Main orchestration and initialization  
├── config.ts          # Configuration constants and debug logging
├── api.ts             # API communication with SkyMavis
├── ui.ts              # DOM manipulation and UI updates
└── state.ts           # State management
public/icons/          # Extension icons
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

- **WXT Framework**: Modern web extension build system with Vite
- **TypeScript with ES Modules**: Uses modern TypeScript with import/export for type-safe, clean code
- **No External Dependencies**: Pure browser APIs only
- **MutationObserver**: Detects SPA navigation changes efficiently
- **Chrome Messaging**: Background script handles CORS-restricted SkyMavis API calls
- **Smart Caching**: Single API call fetches all token prices for session
- **Event Delegation**: Optimized DOM event handling for performance

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
- **Testing**: Verify multi-currency conversion and UI functionality

### Development Tips

- Use `npm run dev` for fastest development with HMR
- Enable debug logging: Set `CONFIG.DEBUG = true` in `src/content/config.ts`
- Debug logs use `debugLog()` function and are prefixed with '[Planet Horse Extension]'
- Test on planethorse.io/game after every change
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