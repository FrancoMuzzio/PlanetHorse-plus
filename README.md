# PlanetHorse+

A Chrome extension that displays real-time USD value for your PH tokens on [Planet Horse](https://planethorse.io).

## What is Planet Horse?

Planet Horse is a Play-to-Earn horse racing game on the Ronin Network where players can race, train, and evolve their horses while earning PHORSE tokens. This extension enhances your gaming experience by automatically showing the USD equivalent of your token balance.

## Features

- **Real-time USD Conversion**: Automatically displays the current USD value of your PHORSE tokens
- **Non-invasive Integration**: Seamlessly adds to the existing UI without disrupting gameplay
- **Automatic Updates**: Refreshes whenever your balance changes
- **Zero Configuration**: Works immediately after installation

## Installation

### Development Mode

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd planet-horse-extension
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
   - Select the `dist/` folder (not the project root)

## Usage

Once installed, simply navigate to [Planet Horse](https://planethorse.io/game) and the extension will automatically display the USD value next to your PHORSE token balance. No configuration needed!

## Development

### Available Scripts

- **`npm run build`**: Build the extension for production
- **`npm run build:prod`**: Build with minification enabled
- **`npm run watch`**: Build and watch for changes during development

### Project Structure

```
src/
├── content/
│   ├── main.js     # Main orchestration and initialization
│   ├── config.js   # Configuration constants and debug logging
│   ├── api.js      # API communication with SkyMavis
│   └── ui.js       # DOM manipulation and UI updates
background.js       # Service worker for HTTP requests
manifest.json       # Chrome extension manifest
dist/              # Built extension files (generated)
```

### Development Workflow

1. Make changes to files in `src/content/`
2. Run `npm run build` or `npm run watch` for auto-rebuild
3. Reload the extension in `chrome://extensions/`
4. Hard refresh the Planet Horse page to see changes

### Architecture

- **Modular ES6**: Uses import/export for clean separation
- **Build System**: esbuild bundles `src/content/*` → `dist/content.js`
- **No External Dependencies**: Pure browser APIs only
- **MutationObserver**: Detects SPA navigation changes
- **Chrome Messaging**: Background script handles CORS-restricted API calls

## Support

### Found this helpful?

If you're new to Planet Horse and found this extension useful, you can use my referral link:
- **Referral URL**: https://planethorse.io/?ref=kevlar
- **Referral Code**: `kevlar`

### Donations

If you'd like to support the development of this extension, donations are welcome but never required:
- **Ronin Address**: `0x27eB87e9a58624f590653b0F164d82eE2Bf2D9f6`

### Bug Reports

Found an issue? Please report it on [GitHub Issues](https://github.com/[username]/planet-horse-extension/issues).

## Contributing

Contributions are welcome! Please follow these guidelines:

### Prerequisites
- Node.js and npm installed
- Basic understanding of Chrome extension development

### Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feat/new-feature`
3. Install dependencies: `npm install`
4. Make your changes in `src/content/`
5. Build and test: `npm run build`
6. Test the extension by loading `dist/` in Chrome
7. Submit a pull request with a clear description

### Conventions

- **Branches**: Use [Conventional Branch](https://conventional-branch.github.io/) format
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)
- **Code**: Function/variable names in English, comments in Spanish
- **Build**: Always test that `npm run build` works before submitting PRs

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Disclaimer

**This is an UNOFFICIAL extension** developed independently by the community. It is not affiliated with, endorsed by, or connected to Planet Horse or its developers.

- Planet Horse™ and all related assets are property of their respective owners
- Use this extension at your own risk

---

**Enhance your Planet Horse experience with community-built tools!** 🐴💰