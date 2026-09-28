async function toggleSticky() {
  try {
    const { isOpen = false } = await chrome.storage.local.get("isOpen");
    const nextState = !isOpen;

    await chrome.storage.local.set({ isOpen: nextState });

    // Only inspect tabs if we are opening Sticky and need to verify injection
    if (nextState) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !tab.url) return;

      const isRestricted = /^(chrome|chrome-extension|edge|about|devtools):/i.test(tab.url);
      if (isRestricted) return;

      // Ping tab; if content script is missing, dynamically inject it
      chrome.tabs.sendMessage(tab.id, { action: "PING" }, async () => {
        if (chrome.runtime.lastError) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ["content.js"]
            });
            await chrome.scripting.insertCSS({
              target: { tabId: tab.id },
              files: ["style.css"]
            });
          } catch (err) {
            // Tab closed or navigation occurred during injection
          }
        }
      });
    }
  } catch (error) {
    console.error("Sticky background toggle error:", error);
  }
}

// Action icon click
chrome.action.onClicked.addListener(toggleSticky);

// Shortcut command (Alt + S)
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-sticky") {
    toggleSticky();
  }
});