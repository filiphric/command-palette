// Copy the CommandPalette class from content.js
// startLine: 3
// endLine: 105

// Initialize differently
document.addEventListener('DOMContentLoaded', () => {
  const cmdPalette = new CommandPalette();
  cmdPalette.show();
});

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
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });
  }

  show() {
    this.isVisible = true;
    this.overlay.style.display = 'flex';
    this.input.value = '';
    this.selectedIndex = 0;
    this.input.focus();
    this.renderCommands();
  }

  hide() {
    this.isVisible = false;
    this.overlay.style.display = 'none';
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

  handleKeydown(e) {
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
        this.hide();
        break;
    }
    this.renderCommands();
  }

  executeCommand(command) {
    command.action();
    this.hide();
  }
}