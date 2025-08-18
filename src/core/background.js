// This is the background service worker.
// It will handle tasks like listening for extension icon clicks,
// managing state, and coordinating other parts of the extension.

/**
 * @name onMessage
 * @description Listener for messages from other parts of the extension, like the popup.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Check the message type to decide what to do.
  if (message.type === 'GET_ACTIVE_TAB_URL') {
    // Query for the active tab in the current window.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        // Handle any errors that occur during the query.
        console.error("Error querying tabs:", chrome.runtime.lastError);
        sendResponse({ error: "Could not query tabs." });
        return;
      }

      if (tabs.length > 0 && tabs[0].url) {
        // If a tab is found, send its URL back to the popup.
        sendResponse({ url: tabs[0].url });
      } else {
        // If no active tab or URL is found.
        sendResponse({ url: null });
      }
    });

    // Return true to indicate that we will send a response asynchronously.
    // This is crucial for the message channel to stay open.
    return true;
  }

  // TODO: Add handlers for other message types like 'START_EXTRACTION', 'STOP_EXTRACTION', etc.
});
