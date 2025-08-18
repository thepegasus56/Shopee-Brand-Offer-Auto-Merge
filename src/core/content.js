// 🔒 PROTECTED Logic Layer - ห้ามแก้ไขไฟล์นี้โดยไม่ได้รับอนุญาตจากทีม Core Logic
// Content script ที่จะถูกฉีดเข้าไปในหน้า Shopee Affiliate เพื่อทำงานกับ DOM

console.log("Shopee Extractor: Content Script Loaded and ready.");

/**
 * @name findAndClick
 * @description ฟังก์ชันสำหรับค้นหาและคลิก Element ในหน้าเว็บ
 * @param {Array<string>} selectors - รายการ selectors ที่จะลองใช้
 * @param {number} timeout - เวลารอ (ms)
 * @returns {Promise<object>}
 */
function findAndClick(selectors, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error(`Action timed out. Could not find element with selectors: ${selectors.join(', ')}`));
        return;
      }
      for (const selector of selectors) {
        // querySelectorAll is used to support non-standard :has-text pseudo-class if needed,
        // though direct support is limited. A better implementation might use XPath.
        const elements = document.querySelectorAll(selector);
        // Find the first visible element
        const visibleElement = Array.from(elements).find(el => el.offsetParent !== null);

        if (visibleElement && !visibleElement.disabled) {
          clearInterval(interval);
          visibleElement.click();
          resolve({ success: true, foundSelector: selector });
          return;
        }
      }
    }, 300); // Retry every 300ms
  });
}

/**
 * @name messageListener
 * @description Listener หลักสำหรับรับคำสั่งจาก background script (AutomationEngine)
 * และส่งผลลัพธ์กลับไป
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // ตรวจสอบว่าคำสั่งมาจาก extension ของเราเองเท่านั้น
  if (sender.id !== chrome.runtime.id) {
    console.warn("Ignoring message from unknown sender:", sender.id);
    return;
  }

  console.log("Content Script Received Action:", request.action);

  // Mapping of actions to selector arrays
  const selectorMap = {
    SELECT_ALL: [
      'th input[type="checkbox"]',
      'button:contains("Select All")', // Using :contains for broader text matching
      'button:contains("เลือกทั้งหมด")',
    ],
    GET_LINKS: [
      'button:contains("Get Link")',
      'button:contains("รับลิงก์")',
    ],
    NEXT_PAGE: [
      'button[aria-label="Go to next page"]',
      'button[aria-label="ไปยังหน้าถัดไป"]',
      'button.shopee-icon-button--right',
    ]
  };

  const selectors = selectorMap[request.action];

  if (selectors) {
    findAndClick(selectors)
      .then(result => sendResponse({ status: 'ok', data: result }))
      .catch(error => sendResponse({ status: 'error', message: error.message }));
    return true; // Keep message channel open for async response
  } else {
    sendResponse({ status: 'error', message: `Unknown action: ${request.action}` });
  }

  return true;
});
