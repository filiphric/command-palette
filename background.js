console.log('Background script loaded');

let paletteTabId = null;
let currentScreenshot = null;

async function captureTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg' });
  currentScreenshot = dataUrl;
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-command-palette") {
    if (paletteTabId) {
      try {
        const tab = await chrome.tabs.get(paletteTabId);
        if (tab) {
          // Send message to start animation
          await chrome.tabs.sendMessage(tab.id, { action: 'startClosing' });
          // Wait for animation
          await new Promise(resolve => setTimeout(resolve, 200));
          await chrome.tabs.remove(paletteTabId);
        }
      } catch (e) {
        // Tab doesn't exist anymore
      }
      paletteTabId = null;
    } else {
      await captureTab();
      const tab = await chrome.tabs.create({
        url: 'palette.html',
        active: true
      });
      paletteTabId = tab.id;
    }
  }
});

// Handle messages from palette page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getScreenshot') {
    sendResponse({ screenshot: currentScreenshot });
    return true;
  }
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
