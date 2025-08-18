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
const pagesError = document.getElementById('pagesError');
const delayError = document.getElementById('delayError');

// --- Validation Rules ---
// กฎการตรวจสอบความถูกต้องของข้อมูลพร้อมข้อความแสดงข้อผิดพลาด
const validationRules = {
  pagesInput: {
    min: 1,
    max: 20,
    message: 'ใส่ค่า 1-20'
  },
  delayInput: {
    min: 300,
    max: 2000,
    message: 'ใส่ค่า 300-2000'
  }
};

// --- Event Listeners ---
// ส่วนของการดักจับ Event ต่างๆ
document.addEventListener('DOMContentLoaded', initializePopup);
startButton.addEventListener('click', handleStart);
stopButton.addEventListener('click', handleStop);
// เพิ่ม event listener สำหรับการ validate แบบ real-time
pagesInput.addEventListener('input', validateForm);
delayInput.addEventListener('input', validateForm);


/**
 * @name initializePopup
 * @description ฟังก์ชันเริ่มต้นการทำงานของ Popup
 */
async function initializePopup() {
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

  // โหลดการตั้งค่าและตรวจสอบความถูกต้องของฟอร์ม
  await loadSettings();
  validateForm();
}

/**
 * @name validateInput
 * @description ฟังก์ชันตรวจสอบความถูกต้องของ Input field เดียว
 * @param {HTMLInputElement} inputEl - Element ของ Input
 * @param {HTMLElement} errorEl - Element ที่จะแสดงข้อความ Error
 * @param {object} rules - กฎการตรวจสอบ
 * @returns {boolean} - คืนค่า true ถ้าข้อมูลถูกต้อง
 */
function validateInput(inputEl, errorEl, rules) {
  const value = parseInt(inputEl.value, 10);
  // ตรวจสอบว่าเป็นตัวเลขและอยู่ในช่วงที่กำหนดหรือไม่
  if (isNaN(value) || value < rules.min || value > rules.max) {
    inputEl.classList.add('is-invalid');
    errorEl.textContent = rules.message;
    return false;
  }
  // ถ้าถูกต้อง ลบคลาสและข้อความ error
  inputEl.classList.remove('is-invalid');
  errorEl.textContent = '';
  return true;
}

/**
 * @name validateForm
 * @description ฟังก์ชันตรวจสอบความถูกต้องของฟอร์มทั้งหมด และเปิด/ปิดปุ่ม Start
 * @returns {boolean} - คืนค่า true ถ้าฟอร์มทั้งหมดถูกต้อง
 */
function validateForm() {
  const isPagesValid = validateInput(pagesInput, pagesError, validationRules.pagesInput);
  const isDelayValid = validateInput(delayInput, delayError, validationRules.delayInput);

  const isFormValid = isPagesValid && isDelayValid;
  // ปิดปุ่ม Start ถ้าฟอร์มไม่ถูกต้อง หรือถ้ากำลังทำงานอยู่
  const isRunning = !stopButton.disabled;
  startButton.disabled = !isFormValid || isRunning;

  return isFormValid;
}


/**
 * @name handleStart
 * @description จัดการเมื่อผู้ใช้กดปุ่ม Start
 */
function handleStart() {
  // ตรวจสอบฟอร์มอีกครั้งก่อนเริ่มทำงาน
  if (!validateForm()) {
    console.log('Validation failed. Cannot start.');
    return;
  }
  console.log('Start button clicked');
  saveSettings();
  setUiState('running');

  let progress = 0;
  updateProgress(progress, 'Starting...');
  const intervalId = setInterval(() => {
    progress += 10;
    if (progress > 100) progress = 100;
    updateProgress(progress, `Processing page ${Math.ceil(progress/20)}/${pagesInput.value}...`);
    if (progress >= 100) {
      clearInterval(intervalId);
      setUiState('finished');
    }
  }, 500);
  // เก็บ ID ของ interval ไว้สำหรับหยุด
  stopButton.dataset.intervalId = intervalId;
}

/**
 * @name handleStop
 * @description จัดการเมื่อผู้ใช้กดปุ่ม Stop
 */
function handleStop() {
  console.log('Stop button clicked');
  // หยุดการทำงานของ interval ที่จำลองไว้
  const intervalId = stopButton.dataset.intervalId;
  if (intervalId) {
    clearInterval(parseInt(intervalId, 10));
  }
  setUiState('idle');
}


/**
 * @name setUiState
 * @description อัปเดตสถานะของ UI ตาม State ที่กำหนด
 * @param {'idle' | 'running' | 'finished'} state
 */
function setUiState(state) {
  const isRunning = state === 'running';

  stopButton.disabled = !isRunning;
  exportButton.disabled = state !== 'finished';
  pagesInput.disabled = isRunning;
  delayInput.disabled = isRunning;
  // เรียก validateForm เพื่อจัดการปุ่ม Start ตามสถานะล่าสุด
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
  configApi.setConfig(settings);
  console.log('Settings saved:', settings);
}

/**
 * @name loadSettings
 * @description โหลดค่าจาก Chrome Storage
 */
async function loadSettings() {
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

// Listener สำหรับรับ message จาก background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_PROGRESS') {
    const { progress, status } = message.payload;
    updateProgress(progress, status);
  } else if (message.type === 'UPDATE_STATE') {
    setUiState(message.payload.state);
  }
});
