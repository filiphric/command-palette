class CommandPalette {
  constructor() {
    console.log('Command palette initialized');
    this.isVisible = false;
    this.selectedIndex = 0;
    this.isKeyboardNavigation = false;
    this.commands = [
      { 
        name: 'New Tab', 
        shortcut: '⌘+T',
        action: () => chrome.runtime.sendMessage({ 
          action: 'createNewTab'
        }) 
      },
      { 
        name: 'Close Tab', 
        shortcut: '⌘+W',
        action: () => chrome.runtime.sendMessage({ 
          action: 'closeLastActiveTab'
        }) 
      },
      {
        name: 'Downloads',
        shortcut: 'shift+⌘+J',
        action: () => {
          chrome.tabs.create({ url: 'chrome://downloads' });
        }
      }
    ];
    
    this.createOverlay();
    this.setupEventListeners();
    this.autocompleteText = '';
    this.originalInputValue = '';
  }

  async init() {
    await this.loadTabs();
    await this.show();
  }

  async show() {
    this.isVisible = true;
    this.overlay.classList.add('visible');
    this.input.focus();
    await this.renderCommands();
  }

  async loadTabs() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getTabs' }, (response) => {
        if (response && response.tabs) {
          const icons = {
            settings: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" style="color: var(--text-color)"><path fill="currentColor" d="M2 12c0-.865.11-1.704.316-2.504A3 3 0 0 0 4.99 4.867a10 10 0 0 1 4.335-2.506a3 3 0 0 0 5.348 0a10 10 0 0 1 4.335 2.506a3 3 0 0 0 2.675 4.63c.206.8.316 1.638.316 2.503c0 .864-.11 1.703-.316 2.503a3 3 0 0 0-2.675 4.63a10 10 0 0 1-4.335 2.505a3 3 0 0 0-5.348 0a10 10 0 0 1-4.335-2.505a3 3 0 0 0-2.675-4.63C2.11 13.703 2 12.864 2 12m4.804 3c.63 1.091.81 2.346.564 3.524q.613.436 1.297.75A5 5 0 0 1 12 18c1.26 0 2.438.471 3.335 1.274q.684-.314 1.297-.75A5 5 0 0 1 17.196 15a5 5 0 0 1 2.77-2.25a8 8 0 0 0 0-1.5A5 5 0 0 1 17.196 9a5 5 0 0 1-.564-3.524a8 8 0 0 0-1.297-.75A5 5 0 0 1 12 6a5 5 0 0 1-3.335-1.274a8 8 0 0 0-1.297.75A5 5 0 0 1 6.804 9a5 5 0 0 1-2.77 2.25a8 8 0 0 0 0 1.5A5 5 0 0 1 6.805 15M12 15a3 3 0 1 1 0-6a3 3 0 0 1 0 6m0-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/></svg>')}`,
            extensions: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" style="color: var(--text-color)"><path fill="currentColor" d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5A2.5 2.5 0 0 0 10.5 1A2.5 2.5 0 0 0 8 3.5V5H4a2 2 0 0 0-2 2v3.8h1.5c1.5 0 2.7 1.2 2.7 2.7S5 16.2 3.5 16.2H2V20a2 2 0 0 0 2 2h3.8v-1.5c0-1.5 1.2-2.7 2.7-2.7s2.7 1.2 2.7 2.7V22H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5"/></svg>')}`,
            flags: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" style="color: var(--text-color)"><path fill="currentColor" d="M6 22a3 3 0 0 1-3-3c0-.6.18-1.16.5-1.63L9 7.81V6a1 1 0 0 1-1-1V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1v1.81l5.5 9.56c.32.47.5 1.03.5 1.63a3 3 0 0 1-3 3z"/></svg>')}`,
            downloads: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" style="color: var(--text-color)"><path fill="currentColor" d="M12 15.248q-.161 0-.298-.053t-.267-.184l-2.62-2.619q-.146-.146-.152-.344t.152-.363q.166-.166.357-.169q.192-.003.357.163L11.5 13.65V5.5q0-.213.143-.357T12 5t.357.143t.143.357v8.15l1.971-1.971q.146-.146.347-.153t.366.159q.16.165.163.354t-.162.353l-2.62 2.62q-.13.13-.267.183q-.136.053-.298.053M6.616 19q-.691 0-1.153-.462T5 17.384v-1.923q0-.213.143-.356t.357-.144t.357.144t.143.356v1.923q0 .231.192.424t.423.192h10.77q.23 0 .423-.192t.192-.424v-1.923q0-.213.143-.356t.357-.144t.357.144t.143.356v1.923q0 .691-.462 1.153T17.384 19z"/></svg>')}`,
          };

          const getFaviconForUrl = (url, defaultFavicon) => {
            if (url.startsWith('chrome://settings')) return icons.settings;
            if (url.startsWith('chrome://extensions')) return icons.extensions;
            if (url.startsWith('chrome://flags')) return icons.flags;
            if (url.startsWith('chrome://downloads')) return icons.downloads;
            return defaultFavicon;
          };
          
          const tabCommands = response.tabs
            .filter(tab => tab.id !== response.paletteTabId)
            .map(tab => ({
              name: `${tab.title}`,
              description: 'Switch to Tab',
              action: async () => {
                chrome.runtime.sendMessage({ 
                  action: 'switchTab', 
                  tabId: tab.id,
                  windowId: tab.windowId
                });
              },
              favicon: getFaviconForUrl(tab.url, tab.favicon)
            }));
          this.commands = [...tabCommands, ...this.commands];
        }
        resolve();
      });
    });
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'cmd-palette-overlay';
    
    const container = document.createElement('div');
    container.className = 'cmd-palette-container';
    
    this.input = document.createElement('input');
    this.input.className = 'cmd-palette-input';
    this.input.placeholder = 'Type a command...';
    
    this.list = document.createElement('ul');
    this.list.className = 'cmd-palette-list';
    
    container.appendChild(this.input);
    container.appendChild(this.list);
    this.overlay.appendChild(container);
    document.body.appendChild(this.overlay);
  }

  setupEventListeners() {
    let inputTimeout;
    
    this.input.addEventListener('input', async () => {
      const currentValue = this.input.value;
      
      // Clear any pending updates
      clearTimeout(inputTimeout);
      
      // Schedule the update with a small delay
      inputTimeout = setTimeout(async () => {
        // Ensure the input value hasn't changed during the delay
        if (currentValue === this.input.value) {
          await this.renderCommands();
          this.handleAutocomplete();
        }
      }, 50);
    });
    
    this.input.addEventListener('keydown', async (e) => {
      // Clear any pending input updates on special keys
      if (['Tab', 'Enter', 'ArrowUp', 'ArrowDown', 'Escape'].includes(e.key)) {
        clearTimeout(inputTimeout);
      }
      
      if (e.key === 'Tab' && this.autocompleteText) {
        e.preventDefault();
        this.input.value = this.autocompleteText;
        this.handleAutocomplete();
        await this.renderCommands();
      } else {
        await this.handleKeydown(e);
      }
    });
    
    this.overlay.addEventListener('click', async (e) => {
      if (e.target === this.overlay) {
        await this.fadeOutAndClose();
      }
    });
  }

  hide() {
    this.isVisible = false;
    this.overlay.classList.remove('visible');
  }

  async renderCommands() {
    const filterText = this.input.value.toLowerCase();
    let filteredCommands = this.commands.filter(cmd => 
      cmd.name.toLowerCase().includes(filterText)
    );
  
    // Add URL suggestions if input looks like a URL or search
    if (filterText.length > 0) {
      const urlSuggestions = await this.getUrlSuggestions(filterText);
      filteredCommands = [...filteredCommands, ...urlSuggestions];
    }
  
    // Add Google search command if no results and there's input
    if (filteredCommands.length === 0 && filterText.length > 0) {
      filteredCommands.push({
        name: `Search Google for "${this.input.value}"`,
        action: () => {
          chrome.tabs.create({ 
            url: `https://www.google.com/search?q=${encodeURIComponent(this.input.value)}`
          });
        }
      });
    }
  
    this.list.innerHTML = '';
    filteredCommands.forEach((cmd, index) => {
      const li = document.createElement('li');
      li.className = `cmd-palette-item ${index === this.selectedIndex ? 'selected' : ''}`;
      
      if (cmd.favicon) {
        const icon = document.createElement('img');
        icon.src = cmd.favicon;
        icon.className = 'cmd-palette-icon';
        icon.onerror = () => {
          icon.style.display = 'none';
        };
        li.appendChild(icon);
      }
      
      const text = document.createElement('span');
      text.textContent = cmd.name;
      li.appendChild(text);

      if (cmd.description) {
        const description = document.createElement('span');
        description.textContent = cmd.description;
        description.className = 'cmd-palette-description';
        li.appendChild(description);
      }

      if (cmd.shortcut) {
        const shortcutContainer = document.createElement('div');
        shortcutContainer.className = 'cmd-palette-shortcut';
        
        // Split shortcut into individual keys
        const keys = cmd.shortcut.split('+');
        keys.forEach((key, index) => {
          const kbd = document.createElement('kbd');
          
          // Check if it's a command key on Mac
          if (key.trim() === '⌘') {
            kbd.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M6.5 21q-1.45 0-2.475-1.025T3 17.5t1.025-2.475T6.5 14H8v-4H6.5q-1.45 0-2.475-1.025T3 6.5t1.025-2.475T6.5 3t2.475 1.025T10 6.5V8h4V6.5q0-1.45 1.025-2.475T17.5 3t2.475 1.025T21 6.5t-1.025 2.475T17.5 10H16v4h1.5q1.45 0 2.475 1.025T21 17.5t-1.025 2.475T17.5 21t-2.475-1.025T14 17.5V16h-4v1.5q0 1.45-1.025 2.475T6.5 21m0-2q.625 0 1.063-.437T8 17.5V16H6.5q-.625 0-1.062.438T5 17.5t.438 1.063T6.5 19m11 0q.625 0 1.063-.437T19 17.5t-.437-1.062T17.5 16H16v1.5q0 .625.438 1.063T17.5 19M10 14h4v-4h-4zM6.5 8H8V6.5q0-.625-.437-1.062T6.5 5t-1.062.438T5 6.5t.438 1.063T6.5 8M16 8h1.5q.625 0 1.063-.437T19 6.5t-.437-1.062T17.5 5t-1.062.438T16 6.5z"/></svg>`;
            kbd.className = 'cmd-palette-shortcut-cmd';
          } else if (key.trim() === 'shift') {
            kbd.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"><path d="M10.677 2.603a1.75 1.75 0 0 1 2.644 0l8.246 9.504c.983 1.133.178 2.897-1.322 2.897H17v5.247A1.75 1.75 0 0 1 15.25 22h-6.5A1.75 1.75 0 0 1 7 20.25v-5.247H3.754c-1.5 0-2.305-1.764-1.322-2.897zm1.511.983a.25.25 0 0 0-.378 0L3.566 13.09a.25.25 0 0 0 .189.414H7.75a.75.75 0 0 1 .75.75v5.997c0 .138.112.25.25.25h6.5a.25.25 0 0 0 .25-.25v-5.997a.75.75 0 0 1 .75-.75h3.995a.25.25 0 0 0 .188-.414z"/></svg>`;
            kbd.className = 'cmd-palette-shortcut-shift';
          } else {
            kbd.textContent = key.trim();
          }
          
          shortcutContainer.appendChild(kbd);
          
        });
        
        li.appendChild(shortcutContainer);
      }
      
      li.addEventListener('click', () => this.executeCommand(cmd));
      li.addEventListener('mousemove', () => {
        if (!this.isKeyboardNavigation) {
          this.selectedIndex = index;
          this.renderCommands();
        }
      });
      this.list.appendChild(li);
    });
    
    this.filteredCommands = filteredCommands;
  }

  async handleKeydown(e) {
    const items = this.list.querySelectorAll('.cmd-palette-item');
    
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault();
        this.isKeyboardNavigation = true;
        this.selectedIndex = e.key === 'ArrowDown' 
          ? (this.selectedIndex + 1) % items.length
          : (this.selectedIndex - 1 + items.length) % items.length;
        break;
      case 'Enter':
        e.preventDefault();
        const selectedCommand = this.filteredCommands[this.selectedIndex];
        if (selectedCommand) await this.executeCommand(selectedCommand);
        break;
      case 'Escape':
        e.preventDefault();
        await this.fadeOutAndClose();
        break;
    }
    this.renderCommands();
  }

  async executeCommand(command) {
    // Execute the command first
    await command.action();
    
    // Close palette for all commands including tab switching
    await this.fadeOutAndClose();
  }

  async fadeOutAndClose() {
    document.body.classList.add('closing');
    this.overlay.classList.remove('visible');
    this.overlay.style.pointerEvents = 'none';
    await new Promise(resolve => setTimeout(resolve, 200));
    chrome.runtime.sendMessage({ command: 'closeTab' });
  }

  handleAutocomplete() {
    const inputValue = this.input.value.toLowerCase();
    
    // Clear autocomplete if input is empty
    if (!inputValue) {
      this.autocompleteText = '';
      const existingGhost = document.querySelector('.cmd-palette-autocomplete');
      if (existingGhost) {
        existingGhost.remove();
      }
      return;
    }

    // First check commands
    const filteredCommands = this.commands.filter(cmd => 
      cmd.name.toLowerCase().startsWith(inputValue)
    );

    if (filteredCommands.length > 0) {
      this.autocompleteText = filteredCommands[0].name;
      this.showAutocomplete();
      return;
    }

    // Check history for URL suggestions
    chrome.history.search({
      text: '',
      maxResults: 100,
      startTime: 0
    }, (historyItems) => {
      const hostScores = new Map();
      historyItems.forEach(item => {
        try {
          const host = new URL(item.url).hostname;
          const currentScore = hostScores.get(host) || 0;
          const newScore = currentScore + (item.visitCount || 0) + (item.typedCount || 0);
          hostScores.set(host, newScore);
        } catch (e) {}
      });

      const matchingHosts = Array.from(hostScores.entries())
        .filter(([host]) => host.includes(inputValue))
        .sort((a, b) => b[1] - a[1]);

      if (matchingHosts.length > 0) {
        const suggestedHost = matchingHosts[0][0];
        this.autocompleteText = suggestedHost;
        this.showAutocomplete();
      } else {
        this.autocompleteText = '';
        const existingGhost = document.querySelector('.cmd-palette-autocomplete');
        if (existingGhost) {
          existingGhost.remove();
        }
      }
    });
  }

  showAutocomplete() {
    const inputValue = this.input.value;
    if (this.autocompleteText && this.autocompleteText.toLowerCase().startsWith(inputValue.toLowerCase())) {
      const ghost = document.createElement('div');
      ghost.className = 'cmd-palette-autocomplete';
      ghost.textContent = this.autocompleteText;
      
      // Remove existing ghost text
      const existingGhost = document.querySelector('.cmd-palette-autocomplete');
      if (existingGhost) {
        existingGhost.remove();
      }
      
      // Add ghost text to container instead of overlay
      this.input.parentElement.appendChild(ghost);
    }
  }

  async getUrlSuggestions(query) {
    if (!query) return [];
    
    try {
      const historyItems = await new Promise((resolve) => {
        chrome.history.search({
          text: query,
          maxResults: 100,
          startTime: 0
        }, (items) => {
          resolve(items || []);
        });
      });

      // Group by host and get highest scored items
      const hostMap = new Map();
      historyItems.forEach(item => {
        try {
          const host = new URL(item.url).hostname;
          const score = (item.visitCount || 0) + (item.typedCount || 0);
          if (!hostMap.has(host) || score > hostMap.get(host).score) {
            hostMap.set(host, { ...item, score });
          }
        } catch (e) {}
      });

      return Array.from(hostMap.values())
        .filter(item => {
          try {
            const host = new URL(item.url).hostname;
            return host.includes(query.toLowerCase());
          } catch (e) {
            return false;
          }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(item => ({
          name: item.title || new URL(item.url).hostname,
          description: new URL(item.url).hostname,
          action: () => {
            chrome.tabs.create({ url: item.url });
          },
          type: 'history'
        }));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }
}

// Add this near the top of the file, before initialize()
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startClosing') {
    document.body.classList.add('closing');
    document.querySelector('.cmd-palette-overlay').classList.remove('visible');
  }
});

// Initialize differently
async function initialize() {
  const response = await chrome.runtime.sendMessage({ action: 'getScreenshot' });
  if (response.screenshot) {
    const img = new Image();
    
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = response.screenshot;
    });

    document.body.style.backgroundImage = `url(${response.screenshot})`;
    await new Promise(resolve => requestAnimationFrame(resolve));
    document.body.classList.add('loaded');
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const cmdPalette = new CommandPalette();
  await cmdPalette.init();
}

document.addEventListener('DOMContentLoaded', initialize);

