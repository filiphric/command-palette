 # Command Palette for Browsers

<div align="center">

[![Chrome](https://img.shields.io/badge/Chrome-✓-green.svg)](https://chrome.google.com/webstore) [![Edge](https://img.shields.io/badge/Edge-✓-green.svg)](https://microsoftedge.microsoft.com/addons) [![Brave](https://img.shields.io/badge/Brave-✓-green.svg)](https://chrome.google.com/webstore)

<img src="./preview.png" alt="Command Palette Preview" width="600"/>
</div>

A keyboard-driven command palette for browsers that provides quick access to tabs, bookmarks, and browser actions. Inspired by VS Code's command palette and Spotlight search.

## ✨ Features

- 🚀 **Quick Tab Switching**: Instantly switch between open tabs
- ⌨️ **Keyboard-First**: Designed for keyboard-centric navigation
- 🔍 **Smart Search**: Fuzzy search across tabs, commands, and history
- 📖 **History Integration**: Quick access to recently visited pages
- 🎯 **Smart Suggestions**: Shows most visited sites first
- ⚡ **Lightweight**: Fast and responsive with minimal overhead
- 🎨 **Beautiful UI**: Clean, modern interface with blur effects
- 🌙 **Dark Mode**: Matches your browser's theme

## 🚀 Installation

### From Source
1. Clone this repository:
```bash
git clone https://github.com/yourusername/browser-command-palette.git
```

2. Install dependencies and build:
```bash
npm install
npm run build
```

3. Load in your browser:
   - Open `chrome://extensions` (Chrome), `brave://extensions` (Brave), or `edge://extensions` (Edge)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### From Web Store
*(Coming soon)*

## 🎮 Usage

1. Open Command Palette:
   - Mac: `⌘ + K`
   - Windows/Linux: `Ctrl + K`

2. Available Commands:
   - `New Tab`: Create a new tab
   - `Close Tab`: Close current tab
   - Type any URL or search term
   - Type tab name to switch tabs

3. Navigation:
   - `↑↓`: Navigate suggestions
   - `Enter`: Select item
   - `Tab`: Autocomplete suggestion
   - `Esc`: Close palette

## 🔧 Development
```bash
# Install dependencies
npm install
# Build extension
npm run build
# The extension will be built to ./dist
```

## 🌐 Browser Support

- ✓ Google Chrome 88+
- ✓ Microsoft Edge 88+
- ✓ Brave Browser 1.20+

## 📝 License

MIT License - See [LICENSE](./LICENSE) for details

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.