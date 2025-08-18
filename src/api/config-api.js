// ⚠️ API Boundary Layer - requires coordination between UI and Logic teams
// ไฟล์นี้ทำหน้าที่เป็น "สะพาน" สำหรับการจัดการการตั้งค่า (Configuration)
// UI Layer จะเรียกใช้ฟังก์ชันในไฟล์นี้เพื่อ โหลด, บันทึก, และจัดการการตั้งค่าของผู้ใช้

const isExtensionContext = window.chrome && chrome.runtime && chrome.runtime.id;

// --- Default Settings ---
// การตั้งค่าเริ่มต้นของ Extension
const DEFAULT_CONFIG = {
  pages: 5,
  delay: 700,
};

// --- Validation Rules ---
// กฎการตรวจสอบความถูกต้องของการตั้งค่า
const VALIDATION_RULES = {
  pages: { min: 1, max: 20, message: 'จำนวนหน้าต้องอยู่ระหว่าง 1-20' },
  delay: { min: 300, max: 2000, message: 'ค่า Delay ต้องอยู่ระหว่าง 300-2000 ms' },
};

/**
 * @name validate
 * @description ตรวจสอบความถูกต้องของอ็อบเจกต์ config
 * @param {object} config - อ็อบเจกต์การตั้งค่าที่จะตรวจสอบ
 * @returns {{isValid: boolean, errors: object}} - ผลการตรวจสอบ
 */
function validate(config) {
  const errors = {};

  // ตรวจสอบ 'pages'
  const pages = Number(config.pages);
  if (isNaN(pages) || pages < VALIDATION_RULES.pages.min || pages > VALIDATION_RULES.pages.max) {
    errors.pages = VALIDATION_RULES.pages.message;
  }

  // ตรวจสอบ 'delay'
  const delay = Number(config.delay);
  if (isNaN(delay) || delay < VALIDATION_RULES.delay.min || delay > VALIDATION_RULES.delay.max) {
    errors.delay = VALIDATION_RULES.delay.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * @name get
 * @description ดึงการตั้งค่าจาก Chrome Storage
 * หากไม่มีค่าที่บันทึกไว้ จะคืนค่า Default กลับไป
 * @returns {Promise<object>} - Promise ที่จะ resolve พร้อมกับอ็อบเจกต์การตั้งค่า
 */
async function get() {
  if (!isExtensionContext) {
    console.warn("TEST MODE: Mocking configApi.get().");
    return Promise.resolve(DEFAULT_CONFIG);
  }
  try {
    const storedConfig = await chrome.storage.sync.get(DEFAULT_CONFIG);
    return storedConfig;
  } catch (error) {
    console.error('Config API Error (get):', error);
    throw new Error('ไม่สามารถโหลดการตั้งค่าได้');
  }
}

/**
 * @name set
 * @description บันทึกการตั้งค่าลงใน Chrome Storage
 * @param {object} newConfig - อ็อบเจกต์การตั้งค่าใหม่ที่จะบันทึก
 * @returns {Promise<void>}
 */
async function set(newConfig) {
  // ตรวจสอบข้อมูลก่อนบันทึก
  const validationResult = validate(newConfig);
  if (!validationResult.isValid) {
    const errorMessages = Object.values(validationResult.errors).join(', ');
    console.error('Config API Error (set): Invalid data', validationResult.errors);
    throw new Error(`ข้อมูลไม่ถูกต้อง: ${errorMessages}`);
  }

  if (!isExtensionContext) {
    console.warn("TEST MODE: Mocking configApi.set().", newConfig);
    return Promise.resolve();
  }

  try {
    // Ensure values are numbers before saving
    const configToSave = {
        pages: Number(newConfig.pages),
        delay: Number(newConfig.delay)
    };
    await chrome.storage.sync.set(configToSave);
    console.log('Configuration saved:', configToSave);
  } catch (error) {
    console.error('Config API Error (set):', error);
    throw new Error('ไม่สามารถบันทึกการตั้งค่าได้');
  }
}

/**
 * @name exportToFile
 * @description ส่งออกการตั้งค่าปัจจุบันเป็นไฟล์ JSON
 */
async function exportToFile() {
  if (!isExtensionContext) {
    alert("Export only works when running as a Chrome Extension.");
    return;
  }
  try {
    const currentConfig = await get();
    const configString = JSON.stringify(currentConfig, null, 2);
    const blob = new Blob([configString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
      url: url,
      filename: `shopee-extractor-config-${Date.now()}.json`,
      saveAs: true
    }, () => {
      URL.revokeObjectURL(url);
      if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError.message);
      }
    });
  } catch (error) {
    console.error('Config API Error (exportToFile):', error);
    alert('เกิดข้อผิดพลาดในการส่งออกไฟล์');
  }
}

/**
 * @name importFromString
 * @description นำเข้าการตั้งค่าจาก JSON string
 * @param {string} jsonString - ข้อความ JSON ที่มีการตั้งค่า
 * @returns {Promise<object>} - คืนค่า config ที่นำเข้าสำเร็จ
 */
async function importFromString(jsonString) {
    try {
        if (!jsonString.trim()) {
            throw new Error('ข้อมูลว่างเปล่า');
        }
        const importedConfig = JSON.parse(jsonString);
        // ตรวจสอบข้อมูลที่นำเข้าก่อนบันทึก
        await set(importedConfig);
        alert('นำเข้าการตั้งค่าสำเร็จแล้ว!');
        return importedConfig;
    } catch (error) {
        console.error('Config API Error (importFromString):', error);
        throw new Error(`ไฟล์ที่นำเข้าไม่ถูกต้อง: ${error.message}`);
    }
}


// ทำการ export ฟังก์ชันต่างๆ เพื่อให้ UI Layer เรียกใช้ได้
// ใช้ชื่อ configApi เพื่อให้สอดคล้องกับ automationApi
export const configApi = {
  get,
  set,
  validate,
  exportToFile,
  importFromString,
  DEFAULT_CONFIG
};

// Export ตรงๆ เพื่อให้ import แบบ destructuring ได้
// import { get, set } from '...'
export {
    get,
    set,
    validate as validateConfig,
    exportToFile as exportConfig,
    importFromString as importConfig
};
