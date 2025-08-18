// ✅ UI Layer - freely editable by UI developers

// --- DOM Elements ---
// ส่วนของการเข้าถึง DOM Elements ที่เราต้องการใช้งาน
const shopBrandOfferIdEl = document.getElementById('shopBrandOfferId');
const pagesInput = document.getElementById('pagesInput');
const delayInput = document.getElementById('delayInput');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const exportButton = document.getElementById('exportButton');
const progressBar = document.getElementById('progressBar');
const statusText = document.getElementById('statusText');

// --- Event Listeners ---
// ส่วนของการดักจับ Event ต่างๆ
document.addEventListener('DOMContentLoaded', initializePopup);
startButton.addEventListener('click', handleStart);
stopButton.addEventListener('click', handleStop);

/**
 * @name initializePopup
 * @description ฟังก์ชันเริ่มต้นการทำงานของ Popup
 * - ดึง ID จาก URL ของ Tab ปัจจุบัน
 * - โหลดการตั้งค่าล่าสุดจาก Storage
 */
async function initializePopup() {
  // ดึง ID จาก URL
  try {
    // การเรียก chrome.* APIs ต้องทำผ่าน background script ใน MV3
    // เราจะส่ง message ไปขอข้อมูลแทน
    const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TAB_URL' });
    if (response && response.url) {
      const url = new URL(response.url);
      const pathSegments = url.pathname.split('/');
      // คาดว่า ID จะอยู่ที่ส่วนท้ายสุดของ Path: /offer/brand_offer/{shopBrandOfferId}
      const offerId = pathSegments[pathSegments.length - 1];

      if (offerId && !isNaN(parseInt(offerId))) {
        shopBrandOfferIdEl.textContent = offerId;
      } else {
        shopBrandOfferIdEl.textContent = 'Not found';
      }
    } else {
       shopBrandOfferIdEl.textContent = 'Not on offer page';
    }
  } catch (error) {
    console.error('Error getting tab URL:', error);
    shopBrandOfferIdEl.textContent = 'Error';
    // อาจจะเกิดปัญหาถ้า background script ไม่พร้อม
    // หรือ popup เปิดในหน้าที่ไม่มีสิทธิ์เข้าถึง chrome.tabs
  }

  // โหลดการตั้งค่า
  loadSettings();
  // TODO: โหลดสถานะล่าสุด (ถ้ามี) จาก background
}

/**
 * @name handleStart
 * @description จัดการเมื่อผู้ใช้กดปุ่ม Start
 * - บันทึกการตั้งค่า
 * - เปลี่ยนสถานะ UI เป็น "กำลังทำงาน"
 * - ส่งข้อความไปหา background script เพื่อเริ่มทำงาน
 */
function handleStart() {
  console.log('Start button clicked');
  saveSettings();
  setUiState('running');

  // ส่งข้อความไปหา background script (ผ่าน API)
  // automationApi.startExtraction({
  //   pages: pagesInput.value,
  //   delay: delayInput.value,
  //   offerId: shopBrandOfferIdEl.textContent
  // });

  // --- ตัวอย่างการอัปเดต UI ---
  // จำลองการทำงานเพื่อแสดงผล
  let progress = 0;
  updateProgress(progress, 'Starting...');
  const interval = setInterval(() => {
    progress += 10;
    if (progress > 100) progress = 100;
    updateProgress(progress, `Processing page ${Math.ceil(progress/20)}/${pagesInput.value}...`);
    if (progress >= 100) {
      clearInterval(interval);
      setUiState('finished');
    }
  }, 500);
}

/**
 * @name handleStop
 * @description จัดการเมื่อผู้ใช้กดปุ่ม Stop
 */
function handleStop() {
  console.log('Stop button clicked');
  setUiState('idle');
  // TODO: ส่งข้อความไปหา background script เพื่อหยุดทำงาน
  // automationApi.stopExtraction();
  // ต้องเคลียร์ interval ของตัวอย่างด้วย
  // ในโค้ดจริงจะไม่มี interval นี้
}


/**
 * @name setUiState
 * @description อัปเดตสถานะของ UI ตาม State ที่กำหนด
 * @param {'idle' | 'running' | 'finished'} state
 */
function setUiState(state) {
  startButton.disabled = state === 'running';
  stopButton.disabled = state !== 'running';
  exportButton.disabled = state !== 'finished';
  pagesInput.disabled = state === 'running';
  delayInput.disabled = state === 'running';

  if (state === 'idle') {
    updateProgress(0, 'Ready');
  } else if (state === 'finished') {
    updateProgress(100, 'Completed!');
  }
}

/**
 * @name updateProgress
 * @description อัปเดต Progress bar และข้อความสถานะ
 * @param {number} value - ค่า progress (0-100)
 * @param {string} text - ข้อความที่ต้องการแสดง
 */
function updateProgress(value, text) {
  progressBar.value = value;
  statusText.textContent = text;
}

/**
 * @name saveSettings
 * @description บันทึกค่า Pages และ Delay ลงใน Chrome Storage
 */
function saveSettings() {
  const settings = {
    pages: pagesInput.value,
    delay: delayInput.value
  };
  // ใช้ API ที่เราสร้างไว้
  configApi.setConfig(settings);
  console.log('Settings saved:', settings);
}

/**
 * @name loadSettings
 * @description โหลดค่า Pages และ Delay จาก Chrome Storage
 */
async function loadSettings() {
  // ใช้ try-catch เพื่อป้องกันกรณี API ไม่พร้อมใช้งาน
  try {
    const settings = await configApi.getConfig();
    if (settings.pages) {
      pagesInput.value = settings.pages;
    }
    if (settings.delay) {
      delayInput.value = settings.delay;
    }
    console.log('Settings loaded:', settings);
  } catch(e) {
    console.error("Could not load settings:", e);
  }
}

// ใน Manifest V3, popup ไม่สามารถเข้าถึง chrome.tabs ได้โดยตรง
// เราต้องเพิ่ม logic ใน background script เพื่อส่ง URL กลับมา
// นี่คือตัวอย่างการจัดการ message ใน ui-manager.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_PROGRESS') {
    const { progress, status } = message.payload;
    updateProgress(progress, status);
  } else if (message.type === 'UPDATE_STATE') {
    setUiState(message.payload.state);
  }
});
