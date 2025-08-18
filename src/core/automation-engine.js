// 🔒 PROTECTED Logic Layer - ห้ามแก้ไขไฟล์นี้โดยไม่ได้รับอนุญาตจากทีม Core Logic
// ไฟล์นี้บรรจุ Logic หลักของระบบอัตโนมัติ มีความซับซ้อนและสำคัญต่อการทำงานของ Extension

/**
 * @class AutomationEngine
 * @description จัดการ Workflow การดึงข้อมูลจาก Shopee Affiliate ทั้งหมด
 * ควบคุมการทำงาน, การวนลูปข้ามหน้า, และการส่งข้อมูลกลับไปยัง UI
 */
export class AutomationEngine {
  /**
   * @constructor
   * @param {function(object): void} statusUpdater - Callback function สำหรับส่งสถานะกลับไป
   */
  constructor(statusUpdater) {
    this.statusUpdater = statusUpdater;
    this.isRunning = false;
    this.isStopping = false;
    this.config = {};
    this.currentPage = 1;
    this.tabId = null; // Tab ID ที่กำลังทำงานอยู่
  }

  /**
   * @name start
   * @description เริ่มกระบวนการทำงานอัตโนมัติ
   * @param {object} config - การตั้งค่าที่ได้รับจาก UI
   * @param {number} tabId - ID ของ Tab ที่จะให้ Script ทำงาน
   */
  async start(config, tabId) {
    if (this.isRunning) {
      console.warn("Automation is already running.");
      return;
    }

    // --- ตั้งค่าเริ่มต้น ---
    this.config = config;
    this.tabId = tabId;
    this.isRunning = true;
    this.isStopping = false;
    this.currentPage = 1;

    console.log("Automation Engine: Starting with config:", config);
    this._sendStatus({ percent: 0, message: `กำลังเริ่มต้น...`, state: 'running' });

    // --- เริ่ม Loop การทำงานหลัก ---
    await this._runLoop();

    // --- สิ้นสุดการทำงาน ---
    if (!this.isStopping) {
        this._sendStatus({ percent: 100, message: "เสร็จสิ้น!", state: 'finished' });
    } else {
        this._sendStatus({ percent: 0, message: "หยุดการทำงาน", state: 'idle' });
    }
    this.isRunning = false;
    this.isStopping = false;
  }

  /**
   * @name stop
   * @description สั่งหยุดการทำงานของ Loop
   */
  stop() {
    if (this.isRunning) {
      this.isStopping = true;
      console.log("Automation Engine: Stop signal received.");
    }
  }

  /**
   * @private
   * @name _runLoop
   * @description Loop การทำงานหลัก วนไปทีละหน้าตามจำนวนที่กำหนด
   */
  async _runLoop() {
    while (this.currentPage <= this.config.pages) {
      if (this.isStopping) {
        console.log("Automation Engine: Loop stopped.");
        break;
      }

      const progress = Math.round(((this.currentPage - 1) / this.config.pages) * 100);
      this._sendStatus({ percent: progress, message: `กำลังประมวลผลหน้า ${this.currentPage}/${this.config.pages}...` });

      try {
        await this.processPage();

        if (this.currentPage < this.config.pages) {
          await this._goToNextPage();
          await new Promise(resolve => setTimeout(resolve, this.config.delay || 1000));
        }

        this.currentPage++;
      } catch (error) {
        console.error(`Error on page ${this.currentPage}:`, error);
        this._sendStatus({ percent: 100, message: `เกิดข้อผิดพลาด: ${error.message}`, state: 'idle' });
        this.isStopping = true;
        break;
      }
    }
  }

  /**
   * @name processPage
   * @description จัดการกระบวนการทั้งหมดในหน้าปัจจุบัน
   */
  async processPage() {
    console.log(`Processing page ${this.currentPage}`);
    await this._selectAllProducts();
    await new Promise(resolve => setTimeout(resolve, 500)); // รอเล็กน้อยหลังเลือก
    await this._getLinks();
    // TODO: เพิ่มการดักจับ event หรือรอให้ dialog แสดงผลเพื่อเก็บข้อมูลลิงก์
    await new Promise(resolve => setTimeout(resolve, 1000)); // รอ dialog แสดง
  }

  /**
   * @private
   * @name _injectFunction
   * @description Helper สำหรับฉีดและรันฟังก์ชันใน Content Script ของ Tab ที่กำหนด
   * @param {function} func - ฟังก์ชันที่จะรันใน Tab
   * @param {Array} args - Arguments ที่จะส่งเข้าไปในฟังก์ชัน
   */
  async _injectFunction(func, args = []) {
    if (!this.tabId) throw new Error("Tab ID is not set.");

    const results = await chrome.scripting.executeScript({
      target: { tabId: this.tabId },
      func: func,
      args: args,
    });

    if (chrome.runtime.lastError) {
        throw new Error(`Script injection failed: ${chrome.runtime.lastError.message}`);
    }
    if (results[0].result && results[0].result.error) {
        throw new Error(results[0].result.error);
    }
    return results[0].result;
  }

  /**
   * @private
   * @name _findAndClick
   * @description ฟังก์ชันที่ฉีดเข้าไปเพื่อค้นหาและคลิก Element
   * @param {Array<string>} selectors - รายการ selectors ที่จะลองใช้
   * @param {number} timeout - เวลารอ (ms)
   */
  static _findAndClick(selectors, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject({ error: `ไม่พบ Element จาก: ${selectors.join(', ')} ภายใน ${timeout}ms` });
                return;
            }

            for (const selector of selectors) {
                // ใช้ querySelectorAll เพื่อรองรับ selector แบบ text
                const elements = document.querySelectorAll(selector);
                const element = Array.from(elements).find(el => el.offsetParent !== null); // หาตัวที่มองเห็นได้

                if (element && !element.disabled) {
                    clearInterval(interval);
                    element.click();
                    resolve({ success: true, foundSelector: selector });
                    return;
                }
            }
        }, 300); // ลองหาทุก 300ms
    });
  }

  /**
   * @private
   * @name _selectAllProducts
   * @description เลือกสินค้าทั้งหมดในหน้า
   */
  async _selectAllProducts() {
    const selectors = [
        'th input[type="checkbox"]', // Selector ที่มักจะใช้สำหรับ "select all" ใน table header
        'button:has-text("Select All")',
        'button:has-text("เลือกทั้งหมด")',
    ];
    console.log("Attempting to select all products...");
    await this._injectFunction(AutomationEngine._findAndClick, [selectors]);
    console.log("Successfully selected all products.");
  }

  /**
   * @private
   * @name _getLinks
   * @description กดปุ่ม "Get Links"
   */
  async _getLinks() {
    const selectors = [
        'button:has-text("Get Link")',
        'button:has-text("รับลิงก์")',
    ];
    console.log("Attempting to get links...");
    await this._injectFunction(AutomationEngine._findAndClick, [selectors]);
    console.log("Successfully clicked get links.");
  }

  /**
   * @private
   * @name _goToNextPage
   * @description ไปยังหน้าถัดไป
   */
  async _goToNextPage() {
    const selectors = [
        'button[aria-label="Go to next page"]',
        'button[aria-label="ไปยังหน้าถัดไป"]',
        'button.shopee-icon-button--right' // Fallback for Shopee's typical next button icon
    ];
    console.log("Going to next page...");
    await this._injectFunction(AutomationEngine._findAndClick, [selectors]);
    console.log("Successfully navigated to next page.");
  }

  /**
   * @private
   * @name _sendStatus
   * @description ส่งสถานะกลับไปให้ background script เพื่อส่งต่อให้ UI
   * @param {object} status - อ็อบเจกต์สถานะ { percent, message, state? }
   */
  _sendStatus(status) {
    if (this.statusUpdater) {
      this.statusUpdater(status);
    }
  }
}
