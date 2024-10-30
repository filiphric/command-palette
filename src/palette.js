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
      }
    ];
    
    this.loadTabs();
    this.createOverlay();
    this.setupEventListeners();
    this.autocompleteText = '';
    this.originalInputValue = '';
  }

  async loadTabs() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getTabs' }, (response) => {
        if (response && response.tabs) {
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
              favicon: tab.favicon
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

  show() {
    this.isVisible = true;
    // Add small delay to ensure it happens after the blur animation
    setTimeout(() => {
      this.overlay.classList.add('visible');
      this.input.focus();
      this.renderCommands(); // Add this line to show initial commands
    }, 50);
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
          } else {
            kbd.textContent = key.trim();
          }
          
          shortcutContainer.appendChild(kbd);
          
          if (index < keys.length - 1) {
            const plus = document.createElement('span');
            plus.textContent = '+';
            plus.style.opacity = '0.5';
            shortcutContainer.appendChild(plus);
          }
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
    
    // Only close the palette if it's not a URL/history navigation
    if (command.type !== 'history') {
      await this.fadeOutAndClose();
    } else {
      // For URL navigation, just close the palette tab without animation
      chrome.runtime.sendMessage({ command: 'closeTab' });
    }
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
    // Create an image element to track when the background image is fully loaded
    const img = new Image();
    
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = response.screenshot;
    });

    // Set the background image
    document.body.style.backgroundImage = `url(${response.screenshot})`;
    
    // Wait for next frame to add the loaded class
    await new Promise(resolve => requestAnimationFrame(resolve));
    document.body.classList.add('loaded');
    
    // Wait for blur animation to start
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const cmdPalette = new CommandPalette();
  cmdPalette.show();
}

document.addEventListener('DOMContentLoaded', initialize);

