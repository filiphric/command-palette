console.log('Background script loaded');

let paletteTabId = null;

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-command-palette") {
    if (paletteTabId) {
      try {
        const tab = await chrome.tabs.get(paletteTabId);
        if (tab) {
          await chrome.tabs.remove(paletteTabId);
        }
      } catch (e) {
        // Tab doesn't exist anymore
      }
      paletteTabId = null;
    } else {
      const tab = await chrome.tabs.create({
        url: 'palette.html',
        active: true,
        pinned: true
      });
      paletteTabId = tab.id;
    }
  }
});

// Handle messages from palette page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.command) {
    case 'newTab':
      chrome.tabs.create({});
      break;
    case 'closeTab':
      if (sender.tab.id === paletteTabId) {
        paletteTabId = null;
      }
      chrome.tabs.remove(sender.tab.id);
      break;
    case 'duplicateTab':
      chrome.tabs.duplicate(sender.tab.id);
      break;
  }
});
