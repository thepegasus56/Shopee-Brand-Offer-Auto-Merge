// This file defines the API contract for automation tasks.
// The UI layer will call these functions to interact with the core logic.

// Example API function
async function startExtraction() {
  // This will send a message to the background service worker
  // to start the automation engine.
  console.log("API: startExtraction called.");
  return chrome.runtime.sendMessage({ type: 'START_EXTRACTION' });
}
