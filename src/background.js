console.log('Background script loaded');

let paletteTabId = null;
let currentScreenshot = null;
let lastActiveTabId = null;
let lastActiveWindowId = null;

async function captureTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  lastActiveTabId = tab.id;
  lastActiveWindowId = tab.windowId;
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg' });
  currentScreenshot = dataUrl;
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-command-palette") {
    if (paletteTabId) {
      try {
        const tab = await chrome.tabs.get(paletteTabId);
        if (tab) {
          // First switch back to the last active tab
          await chrome.tabs.update(lastActiveTabId, { active: true });
          await chrome.windows.update(lastActiveWindowId, { focused: true });
          
          // Then start closing animation and remove palette tab
          await chrome.tabs.sendMessage(tab.id, { action: 'startClosing' });
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
        active: false
      });
      paletteTabId = tab.id;

      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.update(tab.id, { active: true });
        }
      });
    }
  }
});

// Handle messages from palette page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getScreenshot') {
    sendResponse({ screenshot: currentScreenshot });
    return true;
  }
  if (request.action === 'getTabs') {
    chrome.tabs.query({}, (tabs) => {
      sendResponse({ 
        tabs: tabs.map(tab => {
          const favicon = tab.favIconUrl || getFallbackFavicon(tab.url);
          return {
            id: tab.id,
            title: tab.title || 'Untitled',
            url: tab.url,
            windowId: tab.windowId,
            favicon: favicon
          };
        }),
        paletteTabId: paletteTabId
      });
    });
    return true;
  }
  if (request.action === 'switchTab') {
    chrome.tabs.update(request.tabId, { active: true });
    chrome.windows.update(request.windowId, { focused: true });
    // Close palette tab after switching
    if (sender.tab.id === paletteTabId) {
      paletteTabId = null;
      chrome.tabs.remove(sender.tab.id);
    }
    return true;
  }
  if (request.action === 'closeLastActiveTab') {
    if (lastActiveTabId) {
      chrome.tabs.remove(lastActiveTabId);
      // Also close the palette tab
      if (sender.tab.id === paletteTabId) {
        paletteTabId = null;
        chrome.tabs.remove(sender.tab.id);
      }
    }
    return true;
  }
  if (request.action === 'createNewTab') {
    // Create new tab and get its ID
    const newTab = chrome.tabs.create({});
    
    // Close palette tab
    if (sender.tab.id === paletteTabId) {
      paletteTabId = null;
      chrome.tabs.remove(sender.tab.id);
    }
    // Ensure focus stays on new tab
    chrome.tabs.update(newTab.id, { active: true });
    return true;
  }
  switch (request.command) {
    case 'newTab':
      chrome.tabs.create({});
      break;
    case 'closeTab':
      if (sender.tab.id === paletteTabId) {
        paletteTabId = null;
        chrome.tabs.remove(sender.tab.id);
        return true;
      }
      return true;
    case 'duplicateTab':
      chrome.tabs.duplicate(sender.tab.id);
      break;
  }
});

function getFallbackFavicon(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (e) {
    return '';
  }
}