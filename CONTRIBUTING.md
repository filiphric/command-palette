# Contributing to Command Palette for Browsers

First off, thanks for taking the time to contribute! 🎉 

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [project email].

## Getting Started

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/browser-command-palette.git
```

3. Install dependencies:
```bash
npm install
```

4. Create a branch for your changes:
```bash
git checkout -b feature/your-feature-name
```

## Development Process

1. Make your changes in your feature branch
2. Test your changes:
   - Load the extension in Chrome/Edge/Brave
   - Test all keyboard shortcuts
   - Verify UI/UX changes
   - Check console for errors

3. Build the extension:
```bash
npm run build
```

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the version number following [SemVer](https://semver.org/)
3. Ensure all tests pass
4. Create a Pull Request with a clear description:
   - What changes were made
   - Why the changes were made
   - How to test the changes

## Style Guidelines

### JavaScript

- Use ES6+ features
- Follow ESLint configuration
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

Example:
```javascript
// Good
async function getTopSites() {
  try {
    const sites = await chrome.topSites.get();
    return sites.map(site => ({
      name: site.title,
      url: site.url
    }));
  } catch (error) {
    console.error('Failed to fetch top sites:', error);
    return [];
  }
}

// Avoid
function getTops() {
  return chrome.topSites.get().then(s => s.map(x => ({
    n: x.title,
    u: x.url
  })));
}
```

### CSS

- Use CSS variables for theming
- Follow BEM naming convention
- Keep selectors specific but not overly nested

Example:
```css
/* Good */
.cmd-palette-item {
  display: flex;
  align-items: center;
}

.cmd-palette-item--selected {
  background-color: var(--selected-bg);
}

/* Avoid */
.palette div div.item.selected {
  background: #eee;
}
```

## Reporting Bugs

When reporting bugs, please include:

1. Browser version and OS
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Console errors if any

## Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

1. Clear description of the enhancement
2. Use cases
3. Potential implementation approach
4. Mock-ups or examples if applicable

## License

By contributing, you agree that your contributions will be licensed under the MIT License. 