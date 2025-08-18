// This file defines the API contract for configuration management.
// The UI layer will use these functions to get and set user settings.

async function getConfig() {
  console.log("API: getConfig called.");
  return chrome.storage.sync.get();
}

async function setConfig(config) {
  console.log("API: setConfig called with", config);
  return chrome.storage.sync.set(config);
}
