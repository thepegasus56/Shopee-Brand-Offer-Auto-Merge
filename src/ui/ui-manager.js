// ✅ UI Layer - freely editable by UI developers
import automationApi from '../api/automation-api.js';
import { configApi } from '../api/config-api.js';

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
const exportSettingsButton = document.getElementById('exportSettingsButton');
const toggleImportButton = document.getElementById('toggleImportButton');
const importContainer = document.getElementById('importContainer');
const importTextarea = document.getElementById('importTextarea');
const importSettingsButton = document.getElementById('importSettingsButton');
const exportCsvButton = document.getElementById('exportCsvButton');

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
exportSettingsButton.addEventListener('click', handleExportSettings);
toggleImportButton.addEventListener('click', handleToggleImport);
importSettingsButton.addEventListener('click', handleImportSettings);
exportCsvButton.addEventListener('click', handleExportCsv);


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
  exportCsvButton.disabled = state !== 'finished';
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
 * @description บันทึกค่าลงใน Chrome Storage ผ่าน API
 */
function saveSettings() {
  const settings = {
    pages: pagesInput.value,
    delay: delayInput.value
  };
  configApi.set(settings).catch(error => {
    console.error("Failed to save settings:", error.message);
    // TODO: อาจจะแสดงข้อผิดพลาดบน UI
  });
}

/**
 * @name loadSettings
 * @description โหลดค่าจาก Chrome Storage ผ่าน API
 */
async function loadSettings() {
  try {
    const settings = await configApi.get();
    if (settings.pages) {
      pagesInput.value = settings.pages;
    }
    if (settings.delay) {
      delayInput.value = settings.delay;
    }
    console.log('Settings loaded via API:', settings);
  } catch(e) {
    console.error("Could not load settings via API:", e.message);
  }
}

/**
 * @name handleExportSettings
 * @description จัดการการส่งออกการตั้งค่าเป็นไฟล์
 */
function handleExportSettings() {
  console.log('Export settings button clicked');
  configApi.exportToFile();
}

/**
 * @name handleToggleImport
 * @description สลับการแสดงผลของส่วนนำเข้าการตั้งค่า
 */
function handleToggleImport() {
  importContainer.classList.toggle('hidden');
}

/**
 * @name handleImportSettings
 * @description จัดการการนำเข้าการตั้งค่าจาก textarea
 */
async function handleImportSettings() {
  const jsonString = importTextarea.value;
  if (!jsonString.trim()) {
    alert('กรุณาใส่ข้อมูล JSON ที่จะนำเข้า');
    return;
  }
  try {
    const importedConfig = await configApi.importFromString(jsonString);
    // อัปเดตค่าบน UI และ validate ใหม่
    pagesInput.value = importedConfig.pages;
    delayInput.value = importedConfig.delay;
    validateForm();
    importTextarea.value = ''; // เคลียร์ textarea
    importContainer.classList.add('hidden'); // ซ่อนส่วน import
  } catch (error) {
    alert(error.message); // แสดงข้อผิดพลาดให้ผู้ใช้
  }
}

/**
 * @name handleExportCsv
 * @description ส่งคำสั่งให้ background script สร้างและดาวน์โหลดไฟล์ CSV
 */
function handleExportCsv() {
    console.log("Export CSV button clicked.");
    chrome.runtime.sendMessage({ type: 'DOWNLOAD_CSV' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            alert("เกิดข้อผิดพลาดในการส่งออก CSV");
        } else if (response && response.status === 'error') {
            alert(`ไม่สามารถส่งออกได้: ${response.message}`);
        }
    });
}
