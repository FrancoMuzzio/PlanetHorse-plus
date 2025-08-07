# PlanetHorse USD Viewer

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![Chrome Extension](https://img.shields.io/badge/platform-Chrome%20Extension-green.svg)
![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow.svg)
![Manifest V3](https://img.shields.io/badge/manifest-v3-red.svg)

A Chrome extension that automatically displays the USD value of your PlanetHorse tokens directly in the game interface.

## 📋 Description

**PlanetHorse USD Viewer** is a browser extension that integrates non-invasively with the PlanetHorse website (planethorse.io) to provide real-time financial information. Players can instantly see the US dollar value of their PH tokens without needing to leave the game or perform manual calculations.

### ✨ Key Features

- **Real-time visualization**: Shows badges with automatically updated USD values
- **Non-invasive integration**: Discretely integrates with the existing game UI
- **Automatic detection**: Recognizes token balance changes and updates values
- **SPA navigation**: Correctly handles single-page application navigation
- **Smart visibility management**: Hides badges when they overlap with UI elements
- **Zero configuration**: Works immediately after installation

## 🚀 Installation

### For Development

1. **Clone or download the repository**:
   ```bash
   git clone [repository-url]
   cd planet-horse-extension
   ```

2. **Open Chrome and go to extensions**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"

3. **Load the extension**:
   - Click "Load unpacked"
   - Select the project folder `planet-horse-extension`

4. **Done!** The extension will appear in your active extensions list.

### System Requirements

- **Google Chrome** (version 88 or higher)
- **Internet access** (to fetch token prices)
- **Permissions**: The extension requires access to `planethorse.io` and `exchange-rate.skymavis.com`

## 🎮 Usage

1. **Install the extension** following the steps above
2. **Navigate to PlanetHorse**: Go to `https://planethorse.io/game`
3. **Automatic!**: USD value badges will automatically appear next to your PH tokens

### Functionality

- USD badges appear as floating elements next to PlanetHorse token icons
- Values update automatically when you change pages or when your tokens change
- The extension works in all game sections where PH tokens appear
- If there are API connection issues, badges will show an error indicator

## 🏗️ Project Structure

```
planet-horse-extension/
├── manifest.json           # Chrome extension configuration
├── background.js           # Service worker - API communication
├── contentScript.js        # Main script - DOM manipulation
└── README.md              # This file
```

### Architecture

The extension uses a **3-component architecture**:

1. **`manifest.json`**: 
   - Permissions configuration and Chrome Extension v3 specifications
   - Defines content scripts and service worker

2. **`background.js`** (Service Worker):
   - Handles communication with the Skymavis API
   - Processes token price requests
   - Manages CORS permissions and data validation

3. **`contentScript.js`** (Content Script):
   - Injected into planethorse.io pages
   - Detects PH token elements
   - Creates and positions USD badges
   - Observes dynamic DOM changes

## 🛠️ Technologies

### Main Stack
- **JavaScript ES6+**: Base language with modern features
- **Chrome Extension API v3**: Modern extension architecture
- **Native DOM APIs**: Direct DOM manipulation without frameworks
- **Fetch API**: HTTP communication with external APIs
- **MutationObserver API**: Dynamic change detection

### External APIs
- **Skymavis Exchange Rate API**: Token price provider
  - Endpoint: `https://exchange-rate.skymavis.com/v2/prices`
  - Token Address: `0x7f8e304eb2894e57f8b930000f396319729bd1f1`

### Technical Features
- **No external dependencies**: Requires no npm, webpack, or additional frameworks
- **Vanilla JavaScript**: Pure code with no build process
- **Manifest V3**: Uses the latest and most secure version of Chrome Extensions

## 💻 Development

### Local Setup

Requires no build process or dependency installation:

1. **Clone the repository**
2. **Edit files** directly with any text editor
3. **Reload the extension** in `chrome://extensions/` to see changes

### Testing

1. **Load the extension** in developer mode
2. **Navigate to PlanetHorse**: `https://planethorse.io/game*`
3. **Verify**:
   - USD badges appear next to PH tokens
   - Automatic updates when changing pages
   - Correct behavior in SPA navigation
   - Appropriate visibility during scroll

### Debugging

- **Browser console**: Debug messages with 🚀 prefix
- **Chrome DevTools**: Inspect elements and network requests  
- **Background Script**: Debug in `chrome://extensions/` > "service worker"
- **Content Script**: Debug in the game page

### Configuration

Main parameters in `contentScript.js`:

```javascript
const CONFIG = {
  TOKEN_ADDRESS: '0x7f8e304eb2894e57f8b930000f396319729bd1f1',
  API_BASE_URL: 'https://exchange-rate.skymavis.com/v2/prices?addresses=',
  BADGE_CLASS: 'ph-usd-badge'
};
```

## 🤝 Contributing

### How to Contribute

1. **Fork the repository**
2. **Create a branch** for your feature: `git checkout -b feature/new-functionality`
3. **Make your changes** following existing code conventions
4. **Test thoroughly** in different game scenarios
5. **Commit your changes**: `git commit -m 'Add new functionality'`
6. **Push to your branch**: `git push origin feature/new-functionality`
7. **Create a Pull Request**

### Development Guidelines

- **Maintain style**: Follow existing code conventions
- **Testing**: Test in multiple PlanetHorse scenarios
- **Performance**: Consider impact on game performance
- **Compatibility**: Ensure it works with SPA navigation

### Reporting Issues

If you find bugs or have suggestions:

1. **Check** that a similar issue doesn't exist
2. **Include environment information**: Chrome version, OS, etc.
3. **Steps to reproduce** the problem
4. **Screenshots** if relevant

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## 🙏 Credits

- **PlanetHorse**: Original game developed by Sky Mavis
- **Skymavis Exchange Rate API**: Token price data provider
- **Chrome Extensions Documentation**: Guides and best practices

---

### 📧 Support

For technical support or development questions, please open an issue in this repository.

**Enjoy playing PlanetHorse with real-time financial information!** 🐴💰# PlanetHorse USD Viewer

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![Chrome Extension](https://img.shields.io/badge/platform-Chrome%20Extension-green.svg)
![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow.svg)
![Manifest V3](https://img.shields.io/badge/manifest-v3-red.svg)

A Chrome extension that automatically displays the USD value of your PlanetHorse tokens directly in the game interface.

## 📋 Description

**PlanetHorse USD Viewer** is a browser extension that integrates non-invasively with the PlanetHorse website (planethorse.io) to provide real-time financial information. Players can instantly see the US dollar value of their PH tokens without needing to leave the game or perform manual calculations.

### ✨ Key Features

- **Real-time visualization**: Shows badges with automatically updated USD values
- **Non-invasive integration**: Discretely integrates with the existing game UI
- **Automatic detection**: Recognizes token balance changes and updates values
- **SPA navigation**: Correctly handles single-page application navigation
- **Smart visibility management**: Hides badges when they overlap with UI elements
- **Zero configuration**: Works immediately after installation

## 🚀 Installation

### For Development

1. **Clone or download the repository**:
   ```bash
   git clone [repository-url]
   cd planet-horse-extension
   ```

2. **Open Chrome and go to extensions**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"

3. **Load the extension**:
   - Click "Load unpacked"
   - Select the project folder `planet-horse-extension`

4. **Done!** The extension will appear in your active extensions list.

### System Requirements

- **Google Chrome** (version 88 or higher)
- **Internet access** (to fetch token prices)
- **Permissions**: The extension requires access to `planethorse.io` and `exchange-rate.skymavis.com`

## 🎮 Usage

1. **Install the extension** following the steps above
2. **Navigate to PlanetHorse**: Go to `https://planethorse.io/game`
3. **Automatic!**: USD value badges will automatically appear next to your PH tokens

### Functionality

- USD badges appear as floating elements next to PlanetHorse token icons
- Values update automatically when you change pages or when your tokens change
- The extension works in all game sections where PH tokens appear
- If there are API connection issues, badges will show an error indicator

## 🏗️ Project Structure

```
planet-horse-extension/
├── manifest.json           # Chrome extension configuration
├── background.js           # Service worker - API communication
├── contentScript.js        # Main script - DOM manipulation
└── README.md              # This file
```

### Architecture

The extension uses a **3-component architecture**:

1. **`manifest.json`**: 
   - Permissions configuration and Chrome Extension v3 specifications
   - Defines content scripts and service worker

2. **`background.js`** (Service Worker):
   - Handles communication with the Skymavis API
   - Processes token price requests
   - Manages CORS permissions and data validation

3. **`contentScript.js`** (Content Script):
   - Injected into planethorse.io pages
   - Detects PH token elements
   - Creates and positions USD badges
   - Observes dynamic DOM changes

## 🛠️ Technologies

### Main Stack
- **JavaScript ES6+**: Base language with modern features
- **Chrome Extension API v3**: Modern extension architecture
- **Native DOM APIs**: Direct DOM manipulation without frameworks
- **Fetch API**: HTTP communication with external APIs
- **MutationObserver API**: Dynamic change detection

### External APIs
- **Skymavis Exchange Rate API**: Token price provider
  - Endpoint: `https://exchange-rate.skymavis.com/v2/prices`
  - Token Address: `0x7f8e304eb2894e57f8b930000f396319729bd1f1`

### Technical Features
- **No external dependencies**: Requires no npm, webpack, or additional frameworks
- **Vanilla JavaScript**: Pure code with no build process
- **Manifest V3**: Uses the latest and most secure version of Chrome Extensions

## 💻 Development

### Local Setup

Requires no build process or dependency installation:

1. **Clone the repository**
2. **Edit files** directly with any text editor
3. **Reload the extension** in `chrome://extensions/` to see changes

### Testing

1. **Load the extension** in developer mode
2. **Navigate to PlanetHorse**: `https://planethorse.io/game*`
3. **Verify**:
   - USD badges appear next to PH tokens
   - Automatic updates when changing pages
   - Correct behavior in SPA navigation
   - Appropriate visibility during scroll

### Debugging

- **Browser console**: Debug messages with 🚀 prefix
- **Chrome DevTools**: Inspect elements and network requests  
- **Background Script**: Debug in `chrome://extensions/` > "service worker"
- **Content Script**: Debug in the game page

### Configuration

Main parameters in `contentScript.js`:

```javascript
const CONFIG = {
  TOKEN_ADDRESS: '0x7f8e304eb2894e57f8b930000f396319729bd1f1',
  API_BASE_URL: 'https://exchange-rate.skymavis.com/v2/prices?addresses=',
  BADGE_CLASS: 'ph-usd-badge'
};
```

## 🤝 Contributing

### How to Contribute

1. **Fork the repository**
2. **Create a branch** for your feature: `git checkout -b feature/new-functionality`
3. **Make your changes** following existing code conventions
4. **Test thoroughly** in different game scenarios
5. **Commit your changes**: `git commit -m 'Add new functionality'`
6. **Push to your branch**: `git push origin feature/new-functionality`
7. **Create a Pull Request**

### Development Guidelines

- **Maintain style**: Follow existing code conventions
- **Testing**: Test in multiple PlanetHorse scenarios
- **Performance**: Consider impact on game performance
- **Compatibility**: Ensure it works with SPA navigation

### Reporting Issues

If you find bugs or have suggestions:

1. **Check** that a similar issue doesn't exist
2. **Include environment information**: Chrome version, OS, etc.
3. **Steps to reproduce** the problem
4. **Screenshots** if relevant

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## 🙏 Credits

- **PlanetHorse**: Original game developed by Sky Mavis
- **Skymavis Exchange Rate API**: Token price data provider
- **Chrome Extensions Documentation**: Guides and best practices

---

### 📧 Support

For technical support or development questions, please open an issue in this repository.

**Enjoy playing PlanetHorse with real-time financial information!** 🐴💰