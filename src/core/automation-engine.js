// 🔒 PROTECTED Logic Layer - ห้ามแก้ไขไฟล์นี้โดยไม่ได้รับอนุญาตจากทีม Core Logic
// ไฟล์นี้บรรจุ Logic หลักของระบบอัตโนมัติ มีความซับซ้อนและสำคัญต่อการทำงานของ Extension

/**
 * @class AutomationEngine
 * @description จัดการ Workflow การดึงข้อมูลจาก Shopee Affiliate ทั้งหมด
 * โดยการส่งคำสั่งไปยัง Content Script และจัดการสถานะการทำงาน
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

    this.config = config;
    this.tabId = tabId;
    this.isRunning = true;
    this.isStopping = false;
    this.currentPage = 1;

    console.log("Automation Engine: Starting with config:", config);
    this._sendStatus({ percent: 0, message: `กำลังเริ่มต้น...`, state: 'running' });

    await this._runLoop();

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
    await new Promise(resolve => setTimeout(resolve, 500));
    await this._getLinks();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * @private
   * @name _performActionInContentScript
   * @description ส่งข้อความคำสั่งไปยัง Content Script และรอการตอบกลับ
   * @param {string} action - ชื่อ Action ที่จะให้ Content Script ทำ
   * @returns {Promise<object>}
   */
  async _performActionInContentScript(action) {
    if (!this.tabId) throw new Error("Tab ID is not set.");

    console.log(`Engine: Sending action '${action}' to content script.`);
    const response = await chrome.tabs.sendMessage(this.tabId, { action });

    if (chrome.runtime.lastError) {
      throw new Error(`Cannot communicate with content script: ${chrome.runtime.lastError.message}`);
    }
    if (response.status === 'error') {
      throw new Error(`Action '${action}' failed in content script: ${response.message}`);
    }

    console.log(`Engine: Action '${action}' successful.`);
    return response.data;
  }

  /**
   * @private
   * @description ส่งคำสั่ง 'SELECT_ALL' ไปยัง content script
   */
  async _selectAllProducts() {
    await this._performActionInContentScript('SELECT_ALL');
  }

  /**
   * @private
   * @description ส่งคำสั่ง 'GET_LINKS' ไปยัง content script
   */
  async _getLinks() {
    await this._performActionInContentScript('GET_LINKS');
  }

  /**
   * @private
   * @description ส่งคำสั่ง 'NEXT_PAGE' ไปยัง content script
   */
  async _goToNextPage() {
    await this._performActionInContentScript('NEXT_PAGE');
  }

  /**
   * @private
   * @name _sendStatus
   * @description ส่งสถานะกลับไปให้ background script เพื่อส่งต่อให้ UI
   */
  _sendStatus(status) {
    if (this.statusUpdater) {
      this.statusUpdater(status);
    }
  }
}
