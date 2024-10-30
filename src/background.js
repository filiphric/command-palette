console.log('Background script loaded');

let paletteTabId = null;
let currentScreenshot = null;
let lastActiveTabId = null;
let lastActiveWindowId = null;
let faviconCache = new Map();

// we create a screenshot of the current tab to be used as a background for the palette
async function captureTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  lastActiveTabId = tab.id;
  lastActiveWindowId = tab.windowId;
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg' });
  currentScreenshot = dataUrl;
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-command-palette") {
    console.log(faviconCache)
    if (paletteTabId) {
      try {
        const tab = await chrome.tabs.get(paletteTabId);
        if (tab) {
          // First switch back to the last active tab and window
          await chrome.tabs.update(lastActiveTabId, { active: true });
          await chrome.windows.update(lastActiveWindowId, { focused: true });
          
          // Small delay to ensure tab switch happens before closing
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Then close the palette tab
          await chrome.tabs.remove(paletteTabId);
        }
      } catch (e) {
        console.error('Error closing palette:', e);
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

// Fetch and cache favicon data
async function cacheFavicon(tabId, favIconUrl) {
  if (!favIconUrl) return;
  
  try {
    const response = await fetch(favIconUrl);
    const blob = await response.blob();
    const base64data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    
    faviconCache.set(tabId, base64data);
    return base64data;
  } catch (e) {
    console.error('Error caching favicon:', e);
    return favIconUrl; // Fallback to URL if fetch fails
  }
}

// Handle messages from palette page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getScreenshot') {
    sendResponse({ screenshot: currentScreenshot });
    return true;
  }
  if (request.action === 'getTabs') {
    chrome.tabs.query({}, async (tabs) => {
      // Process all tabs in parallel
      const processedTabs = await Promise.all(tabs.map(async tab => {
        let favicon = faviconCache.get(tab.id);
        
        // If not cached and has favicon URL, try to cache it
        if (!favicon && tab.favIconUrl) {
          try {
            favicon = await cacheFavicon(tab.id, tab.favIconUrl);
          } catch (e) {
            console.error('Error caching favicon:', e);
            favicon = tab.favIconUrl; // Fallback to URL if caching fails
          }
        }
        
        return {
          id: tab.id,
          title: tab.title || 'Untitled',
          url: tab.url,
          windowId: tab.windowId,
          favicon: favicon || tab.favIconUrl // Fallback to original favIconUrl if no cached version
        };
      }));
      
      sendResponse({ 
        tabs: processedTabs,
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

// Update favicon cache when tab favicon changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.favIconUrl) {
    await cacheFavicon(tabId, changeInfo.favIconUrl);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  faviconCache.delete(tabId);
});
