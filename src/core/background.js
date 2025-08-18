// This is the background service worker.
// It orchestrates the AutomationEngine and communicates with the UI layer.
import { AutomationEngine } from './automation-engine.js';

// --- State Management ---
// สร้าง instance เดียวของ AutomationEngine เพื่อจัดการสถานะ
// A function to send progress updates to the UI layer (via the popup)
const statusUpdater = (progress) => {
  console.log('Background: Sending progress update to UI:', progress);
  chrome.runtime.sendMessage({
    type: 'AUTOMATION_PROGRESS_UPDATE',
    payload: progress,
  }).catch(error => {
      if (error.message.includes("Could not establish connection")) {
          console.log("UI popup is not open. Suppressing error.");
      } else {
          console.error("Send message error:", error);
      }
  });
};

const engine = new AutomationEngine(statusUpdater);

/**
 * @name onMessage
 * @description Listener สำหรับรับข้อความจาก API Layer (popup)
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // --- Get Active Tab Handler ---
  if (message.type === 'GET_ACTIVE_TAB_URL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("Error querying tabs:", chrome.runtime.lastError.message);
        sendResponse({ error: "Could not query tabs." });
        return;
      }
      if (tabs.length > 0 && tabs[0].url) {
        sendResponse({ url: tabs[0].url });
      } else {
        sendResponse({ url: null });
      }
    });
    return true; // Keep message channel open for async response
  }

  // --- Automation Handlers ---
  else if (message.type === 'START_AUTOMATION') {
    console.log('Background: Received START_AUTOMATION with config:', message.payload);
    // หา Tab ที่ Active อยู่เพื่อส่ง ID ไปให้ Engine
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            // เรียก engine.start แต่ไม่ต้องรอ (non-blocking)
            engine.start(message.payload, tabs[0].id);
            sendResponse({ status: 'ok', message: 'Automation process started.' });
        } else {
            console.error("No active tab found to start automation.");
            sendResponse({ status: 'error', message: 'ไม่พบ Tab ที่จะเริ่มทำงาน' });
        }
    });
    return true; // จำเป็นสำหรับการตอบกลับแบบ asynchronous
  }

  else if (message.type === 'STOP_AUTOMATION') {
    console.log('Background: Received STOP_AUTOMATION');
    engine.stop(); // เรียกใช้เมธอด stop ของ engine
    sendResponse({ status: 'ok', message: 'Stop signal sent.' });
  }

  else if (message.type === 'GET_AUTOMATION_STATUS') {
    // ดึงสถานะจาก engine โดยตรง
    const status = {
        status: engine.isRunning ? 'running' : 'idle',
        progress: engine.isRunning ? Math.round(((engine.currentPage - 1) / (engine.config.pages || 1)) * 100) : (engine.isStopping ? 0 : 100),
        message: engine.isRunning ? `Page ${engine.currentPage} of ${engine.config.pages || 'N/A'}` : 'Ready'
    };
    sendResponse(status);
  }
});
