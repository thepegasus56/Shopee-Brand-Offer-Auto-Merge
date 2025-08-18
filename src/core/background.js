// 🔒 PROTECTED Logic Layer - ห้ามแก้ไขไฟล์นี้โดยไม่ได้รับอนุญาตจากทีม Core Logic
// Service Worker หลักของ Extension ทำหน้าที่เป็นศูนย์กลางการสื่อสารและจัดการ Logic เบื้องหลัง

import { AutomationEngine } from './automation-engine.js';

// --- State Management ---
let collectedData = []; // ตัวแปรสำหรับเก็บข้อมูลที่ดึงมาได้จากทุกหน้า

// --- CSV Helper Functions ---

/**
 * @name arrayToCsv
 * @description แปลง Array ของ Object เป็น CSV String ที่รองรับ comma และ quote
 * @param {Array<object>} data - ข้อมูลที่ต้องการแปลง
 * @returns {string} - CSV String
 */
function arrayToCsv(data) {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(fieldName => {
        const value = row[fieldName] === null ? '' : row[fieldName];
        const stringValue = String(value);
        // ถ้ามี comma, double quote, หรือ newline ให้ครอบด้วย double quote
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          // และถ้ามี double quote อยู่ข้างใน ให้เปลี่ยนเป็น double-double-quote
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ];
  return csvRows.join('\r\n');
}

/**
 * @name downloadCsv
 * @description สร้างและดาวน์โหลดไฟล์ CSV
 * @param {string} csvContent - เนื้อหา CSV ที่จะดาวน์โหลด
 */
function downloadCsv(csvContent) {
  // เพิ่ม BOM สำหรับ UTF-8 เพื่อให้ Excel เปิดไฟล์ภาษาไทยได้ถูกต้อง
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: `shopee-brand-offer-data-${Date.now()}.csv`,
    saveAs: true,
  }, (downloadId) => {
    URL.revokeObjectURL(url);
    if (chrome.runtime.lastError) {
      console.error("Download failed:", chrome.runtime.lastError.message);
    }
  });
}

// --- Engine Integration ---

const statusUpdater = (progress) => {
  chrome.runtime.sendMessage({ type: 'AUTOMATION_PROGRESS_UPDATE', payload: progress })
    .catch(err => { if (err.message && !err.message.includes("Could not establish connection")) console.error(err); });
};

const dataHandler = (pageData) => {
    console.log(`Background: Received ${pageData.length} items.`);
    collectedData.push(...pageData);
};

const engine = new AutomationEngine(statusUpdater, dataHandler);

// --- Lifecycle Hooks ---
chrome.runtime.onInstalled.addListener(() => {
  console.log("Shopee Brand Offer Extractor installed/updated.");
});

// --- Message Listener ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_ACTIVE_TAB_URL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) sendResponse({ url: tabs[0].url });
        else sendResponse({ url: null, error: chrome.runtime.lastError?.message });
    });
    return true;
  }

  else if (message.type === 'START_AUTOMATION') {
    collectedData = []; // เคลียร์ข้อมูลเก่า
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
            engine.start(message.payload, tabs[0].id);
            sendResponse({ status: 'ok', message: 'Automation process started.' });
        } else {
            sendResponse({ status: 'error', message: 'ไม่พบ Tab ที่จะเริ่มทำงาน' });
        }
    });
    return true;
  }

  else if (message.type === 'STOP_AUTOMATION') {
    engine.stop();
    sendResponse({ status: 'ok', message: 'Stop signal sent.' });
  }

  else if (message.type === 'GET_AUTOMATION_STATUS') {
    const status = {
        status: engine.isRunning ? 'running' : 'idle',
        progress: engine.isRunning ? Math.round(((engine.currentPage - 1) / (engine.config.pages || 1)) * 100) : (engine.isStopping ? 0 : 100),
        message: engine.isRunning ? `Page ${engine.currentPage} of ${engine.config.pages || 'N/A'}` : 'Ready'
    };
    sendResponse(status);
  }

  else if (message.type === 'DOWNLOAD_CSV') {
    if (collectedData.length === 0) {
        sendResponse({ status: 'error', message: 'ไม่มีข้อมูลสำหรับดาวน์โหลด' });
        return true; // Keep channel open
    }
    try {
        const csv = arrayToCsv(collectedData);
        downloadCsv(csv);
        sendResponse({ status: 'ok' });
    } catch (error) {
        sendResponse({ status: 'error', message: error.message });
    }
    return true; // Keep channel open
  }
});
