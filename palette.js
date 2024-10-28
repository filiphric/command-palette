// Copy the CommandPalette class from content.js
class CommandPalette {
  constructor() {
    console.log('Command palette initialized');
    this.isVisible = false;
    this.selectedIndex = 0;
    this.commands = [
      { name: 'New Tab', action: () => chrome.runtime.sendMessage({ command: 'newTab' }) },
      { name: 'Close Tab', action: () => chrome.runtime.sendMessage({ command: 'closeTab' }) },
    ];
    
    this.loadTabs();
    this.createOverlay();
    this.setupEventListeners();
  }

  async loadTabs() {
    const response = await chrome.runtime.sendMessage({ action: 'getTabs' });
    if (response.tabs) {
      const tabCommands = response.tabs
        .filter(tab => tab.id !== response.paletteTabId) // Filter out palette tab
        .map(tab => ({
          name: `Switch to: ${tab.title}`,
          action: async () => {
            chrome.runtime.sendMessage({ 
              action: 'switchTab', 
              tabId: tab.id,
              windowId: tab.windowId
            });
          }
        }));
      this.commands = [...this.commands, ...tabCommands];
    }
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
    this.input.addEventListener('input', () => this.renderCommands());
    this.input.addEventListener('keydown', async (e) => await this.handleKeydown(e));
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

  renderCommands() {
    const filterText = this.input.value.toLowerCase();
    const filteredCommands = this.commands.filter(cmd => 
      cmd.name.toLowerCase().includes(filterText)
    );

    this.list.innerHTML = '';
    filteredCommands.forEach((cmd, index) => {
      const li = document.createElement('li');
      li.className = `cmd-palette-item ${index === this.selectedIndex ? 'selected' : ''}`;
      li.textContent = cmd.name;
      li.addEventListener('click', () => this.executeCommand(cmd));
      this.list.appendChild(li);
    });
    
    // Store filtered commands for use in handleKeydown
    this.filteredCommands = filteredCommands;
  }

  async handleKeydown(e) {
    const items = this.list.querySelectorAll('.cmd-palette-item');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % items.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
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
    await command.action();
    await this.fadeOutAndClose();
  }

  async fadeOutAndClose() {
    document.body.classList.add('closing');
    this.overlay.classList.remove('visible');
    this.overlay.style.pointerEvents = 'none';
    await new Promise(resolve => setTimeout(resolve, 200));
    chrome.runtime.sendMessage({ command: 'closeTab' });
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
  // Get the screenshot
  const response = await chrome.runtime.sendMessage({ action: 'getScreenshot' });
  if (response.screenshot) {
    document.body.style.backgroundImage = `url(${response.screenshot})`;
    // Add small delay to ensure background is loaded
    requestAnimationFrame(() => {
      document.body.classList.add('loaded');
    });
  }

  const cmdPalette = new CommandPalette();
  cmdPalette.show();
}

document.addEventListener('DOMContentLoaded', initialize);
