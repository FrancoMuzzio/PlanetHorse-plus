# PlanetHorse+ (Unofficial)

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![Chrome Extension](https://img.shields.io/badge/platform-Chrome%20Extension-green.svg)
![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow.svg)
![Manifest V3](https://img.shields.io/badge/manifest-v3-red.svg)
![Unofficial](https://img.shields.io/badge/status-UNOFFICIAL-red.svg)

A comprehensive Chrome extension that enhances your PlanetHorse gaming experience with powerful utilities and features.

## ⚠️ IMPORTANT DISCLAIMER

**This is an UNOFFICIAL, third-party extension** not affiliated with, endorsed by, or connected to Sky Mavis or PlanetHorse in any way. 

This extension is developed and maintained independently by the community for the community.

---

## 📋 Description

**PlanetHorse+** is a browser extension that integrates seamlessly with the PlanetHorse website (planethorse.io) to provide enhanced gaming utilities. PlanetHorse+ approaches PlanetHorse enhancement through non-invasive integration, preserving the original game experience while adding valuable functionality.

## ✨ Current Features

### 💰 Real-Time USD Value Display
- **Live USD conversion**: Automatically displays US dollar values for your PH tokens
- **Non-invasive badges**: Discretely integrates with the existing game UI
- **Automatic updates**: Recognizes token balance changes and updates values instantly
- **SPA navigation support**: Works seamlessly across all game sections
- **Smart positioning**: Badges position intelligently to avoid UI conflicts
- **Zero configuration**: Works immediately after installation

## 🔮 Upcoming Features

*PlanetHorse+ is designed for extensibility. Future releases may include:*

- 📊 **Advanced Analytics**: Token performance tracking and historical data
- 🚀 **Enhanced Game Stats**: Detailed race performance and earnings analysis
- ⚡ **Quick Actions**: Fast-access tools for common game operations
- 🔔 **Smart Notifications**: Market alerts and game event notifications
- 📱 **Cross-Platform Sync**: Data synchronization across devices
- 🎯 **Custom Dashboards**: Personalized game data visualization

*Note: Future features depend on game updates and community feedback*

## 🚀 Installation

### For Users

1. **Install from Chrome Web Store** *(coming soon)*
2. **Navigate to PlanetHorse**: Go to `https://planethorse.io/game`
3. **Enjoy enhanced features**: The toolkit activates automatically

### For Development

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd planet-horse-extension
   ```

2. **Load in Chrome**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project folder

### System Requirements

- **Google Chrome** (version 88 or higher)
- **Internet access** (for real-time data features)
- **Permissions**: Access to `planethorse.io` and external APIs

## 🎮 Usage

### Current Features Usage

**USD Value Display:**
1. Install PlanetHorse+ and navigate to PlanetHorse
2. USD value badges appear automatically next to PH token displays
3. Values update in real-time as you navigate and play
4. Works across all game sections where tokens are displayed

## 🏗️ Technical Architecture

```
planet-horse-extension/
├── manifest.json           # Extension configuration (Manifest V3)
├── background.js           # Service worker - API communication & data processing
├── contentScript.js        # UI integration & DOM manipulation
├── icons/                  # Extension icons (16px, 48px, 128px)
└── README.md              # Documentation
```

### Modern Extension Architecture

PlanetHorse+ uses **Chrome Extension Manifest V3** with a clean separation of concerns:

1. **Service Worker** (`background.js`):
   - Handles external API communication
   - Processes and validates data
   - Manages cross-origin requests securely

2. **Content Script** (`contentScript.js`):
   - Integrates with PlanetHorse UI
   - Manages dynamic content updates
   - Handles SPA navigation and DOM changes

3. **Minimal Permissions**:
   - Only requests necessary permissions
   - Transparent about data usage
   - Secure by design

## 🛠️ Technologies

### Core Stack
- **JavaScript ES6+**: Modern language features
- **Chrome Extension API v3**: Latest extension platform
- **Vanilla DOM APIs**: No external frameworks
- **MutationObserver**: Real-time DOM change detection
- **Fetch API**: Secure HTTP communication

### External Integration
- **Skymavis Exchange Rate API**: Real-time token pricing
- **Token Address**: `0x7f8e304eb2894e57f8b930000f396319729bd1f1`

### Design Principles
- **Zero dependencies**: No build process required
- **Performance focused**: Minimal resource usage
- **Privacy conscious**: No data collection
- **Compatibility first**: Works with game updates

## 💻 Development

### Local Development

No build process required:

1. **Clone and edit** files directly
2. **Reload extension** in Chrome to see changes
3. **Test on PlanetHorse** game interface

### Testing Protocol

1. **Load extension** in developer mode
2. **Navigate to game**: `https://planethorse.io/game*`
3. **Verify features**:
   - USD badges display correctly
   - Updates work across navigation
   - Performance remains optimal
   - UI integration is non-invasive

### Configuration

Main settings in `contentScript.js`:

```javascript
const CONFIG = {
  TOKEN_ADDRESS: '0x7f8e304eb2894e57f8b930000f396319729bd1f1',
  API_BASE_URL: 'https://exchange-rate.skymavis.com/v2/prices?addresses=',
  BADGE_CLASS: 'ph-usd-badge'
};
```

## 🤝 Contributing

### Development Guidelines

- **Follow existing patterns**: Maintain code consistency
- **Test thoroughly**: Verify across different game scenarios
- **Performance matters**: Consider impact on game experience
- **Document changes**: Update README for new features

### Contributing Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-tool`
3. Develop and test your enhancement
4. Submit pull request with detailed description

## 🐛 Issues & Support

### Reporting Issues

When reporting problems:

1. **Check existing issues** first
2. **Provide environment details**: Chrome version, OS
3. **Include reproduction steps**
4. **Add screenshots** if relevant

### Community Support

- **GitHub Issues**: Technical problems and feature requests
- **Discussions**: General questions and ideas
- **Pull Requests**: Code contributions welcome

## 📝 Legal

### License
This project is licensed under the MIT License - see LICENSE file for details.

### Trademarks
- PlanetHorse™ is a trademark of Sky Mavis
- This extension is not affiliated with or endorsed by Sky Mavis
- All game-related trademarks belong to their respective owners

### Disclaimer
This extension is provided "as-is" without any warranties. Users install and use at their own risk.

## 🙏 Acknowledgments

- **Sky Mavis**: For creating PlanetHorse
- **Community**: For feedback and feature requests
- **Contributors**: For improving PlanetHorse+

---

**Enhance your PlanetHorse experience with community-driven tools!** 🐴⚡

*Remember: This is an unofficial, community-created extension designed to enhance your gaming experience while respecting the original game.*