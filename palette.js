// Copy the CommandPalette class from content.js
class CommandPalette {
  constructor() {
    console.log('Command palette initialized');
    this.isVisible = false;
    this.selectedIndex = 0;
    this.commands = [
      { name: 'New Tab', action: () => chrome.runtime.sendMessage({ command: 'newTab' }) },
      { name: 'Close Tab', action: () => chrome.runtime.sendMessage({ command: 'closeTab' }) },
      { name: 'Duplicate Tab', action: () => chrome.runtime.sendMessage({ command: 'duplicateTab' }) }
    ];
    
    this.createOverlay();
    this.setupEventListeners();
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
        const selectedCommand = this.commands[this.selectedIndex];
        if (selectedCommand) this.executeCommand(selectedCommand);
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
    // Start fade-out animations
    document.body.classList.add('closing');
    this.overlay.classList.remove('visible');
    
    // Disable all click events during animation
    this.overlay.style.pointerEvents = 'none';
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Only close after animation completes
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

  class CommandPalette {
    constructor() {
      this.isVisible = false;
      this.selectedIndex = 0;
      this.commands = [
        { name: 'New Tab', action: () => chrome.runtime.sendMessage({ command: 'newTab' }) },
        { name: 'Close Tab', action: () => chrome.runtime.sendMessage({ command: 'closeTab' }) },
        { name: 'Duplicate Tab', action: () => chrome.runtime.sendMessage({ command: 'duplicateTab' }) }
      ];
      
      this.createOverlay();
      this.setupEventListeners();
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
          const selectedCommand = this.commands[this.selectedIndex];
          if (selectedCommand) this.executeCommand(selectedCommand);
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
      // Start fade-out animations
      document.body.classList.add('closing');
      this.overlay.classList.remove('visible');
      
      // Disable all click events during animation
      this.overlay.style.pointerEvents = 'none';
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Only close after animation completes
      chrome.runtime.sendMessage({ command: 'closeTab' });
    }
  }

  const cmdPalette = new CommandPalette();
  cmdPalette.show();
}

document.addEventListener('DOMContentLoaded', initialize);
