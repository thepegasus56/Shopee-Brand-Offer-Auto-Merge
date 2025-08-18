// ✅ UI Layer - freely editable by UI developers
import automationApi from '../api/automation-api.js';

// --- DOM Elements ---
const shopBrandOfferIdEl = document.getElementById('shopBrandOfferId');
const pagesInput = document.getElementById('pagesInput');
const delayInput = document.getElementById('delayInput');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const exportButton = document.getElementById('exportButton');
const progressBar = document.getElementById('progressBar');
const statusText = document.getElementById('statusText');
const pagesError = document.getElementById('pagesError');
const delayError = document.getElementById('delayError');

// --- Validation Rules ---
const validationRules = {
  pagesInput: { min: 1, max: 20, message: 'ใส่ค่า 1-20' },
  delayInput: { min: 300, max: 2000, message: 'ใส่ค่า 300-2000' }
};

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', initializePopup);
startButton.addEventListener('click', handleStart);
stopButton.addEventListener('click', handleStop);
pagesInput.addEventListener('input', validateForm);
delayInput.addEventListener('input', validateForm);


/**
 * @name initializePopup
 * @description ฟังก์ชันเริ่มต้นการทำงานของ Popup
 */
async function initializePopup() {
  // ลงทะเบียนเพื่อรับการอัปเดตความคืบหน้าจาก API
  // เมื่อ core logic ส่งข้อมูลอัปเดตมา, callback นี้จะทำงาน
  automationApi.onProgressUpdate((progress) => {
    console.log('UI received progress update:', progress);
    updateProgress(progress.percent, progress.message);
    if (progress.state) {
      setUiState(progress.state);
    }
  });

  // ดึง ID จาก URL
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TAB_URL' });
    if (response && response.url) {
      const url = new URL(response.url);
      const pathSegments = url.pathname.split('/');
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
  }

  // โหลดการตั้งค่าและตรวจสอบความถูกต้อง
  await loadSettings();

  // ขอสถานะล่าสุดจาก background เพื่อซิงค์ UI
  try {
    const currentState = await automationApi.getStatus();
    setUiState(currentState.status);
    updateProgress(currentState.progress, currentState.message);
  } catch(e) {
    console.error(e.message);
  }

  validateForm();
}

/**
 * @name validateInput
 * @description ฟังก์ชันตรวจสอบความถูกต้องของ Input field เดียว
 */
function validateInput(inputEl, errorEl, rules) {
  const value = parseInt(inputEl.value, 10);
  if (isNaN(value) || value < rules.min || value > rules.max) {
    inputEl.classList.add('is-invalid');
    errorEl.textContent = rules.message;
    return false;
  }
  inputEl.classList.remove('is-invalid');
  errorEl.textContent = '';
  return true;
}

/**
 * @name validateForm
 * @description ฟังก์ชันตรวจสอบความถูกต้องของฟอร์มทั้งหมด
 */
function validateForm() {
  const isPagesValid = validateInput(pagesInput, pagesError, validationRules.pagesInput);
  const isDelayValid = validateInput(delayInput, delayError, validationRules.delayInput);

  const isFormValid = isPagesValid && isDelayValid;
  const isRunning = !stopButton.disabled;
  startButton.disabled = !isFormValid || isRunning;

  return isFormValid;
}


/**
 * @name handleStart
 * @description จัดการเมื่อผู้ใช้กดปุ่ม Start โดยเรียกผ่าน API
 */
async function handleStart() {
  if (!validateForm()) return;

  saveSettings();
  setUiState('running');
  updateProgress(0, 'Starting...');

  const config = {
    pages: pagesInput.value,
    delay: delayInput.value,
    offerId: shopBrandOfferIdEl.textContent
  };

  try {
    const response = await automationApi.start(config);
    console.log('Automation started successfully:', response.message);
  } catch (error) {
    console.error('Failed to start automation:', error.message);
    updateProgress(0, error.message); // แสดงข้อผิดพลาดให้ผู้ใช้
    setUiState('idle');
  }
}

/**
 * @name handleStop
 * @description จัดการเมื่อผู้ใช้กดปุ่ม Stop โดยเรียกผ่าน API
 */
async function handleStop() {
  setUiState('idle'); // อัปเดต UI ทันทีเพื่อการตอบสนองที่ดี
  try {
    const response = await automationApi.stop();
    console.log('Automation stopped successfully:', response.message);
  } catch (error) {
    console.error('Failed to stop automation:', error.message);
  }
}

/**
 * @name setUiState
 * @description อัปเดตสถานะของ UI ตาม State ที่กำหนด
 */
function setUiState(state) {
  const isRunning = state === 'running';

  stopButton.disabled = !isRunning;
  exportButton.disabled = state !== 'finished';
  pagesInput.disabled = isRunning;
  delayInput.disabled = isRunning;
  validateForm();

  if (state === 'idle') {
    updateProgress(0, 'Ready');
  } else if (state === 'finished') {
    updateProgress(100, 'Completed!');
  }
}

/**
 * @name updateProgress
 * @description อัปเดต Progress bar และข้อความสถานะ
 */
function updateProgress(value, text) {
  progressBar.value = value;
  statusText.textContent = text;
}

/**
 * @name saveSettings
 * @description บันทึกค่าลงใน Chrome Storage
 */
function saveSettings() {
  const settings = {
    pages: pagesInput.value,
    delay: delayInput.value
  };
  // Note: This directly uses chrome.storage.sync.
  // A more robust implementation would use the config-api.js
  chrome.storage.sync.set(settings);
  console.log('Settings saved:', settings);
}

/**
 * @name loadSettings
 * @description โหลดค่าจาก Chrome Storage
 */
async function loadSettings() {
  try {
    const settings = await new Promise(resolve => chrome.storage.sync.get(resolve));
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
