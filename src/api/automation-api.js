// ⚠️ API Boundary Layer - requires coordination between UI and Logic teams
// ไฟล์นี้ทำหน้าที่เป็น "สะพาน" หรือ Interface Contract ระหว่าง UI Layer และ Core Logic Layer
// การแก้ไขไฟล์นี้ต้องได้รับการยินยอมจากทั้งสองทีม

/**
 * @class AutomationAPI
 * @description Singleton Class สำหรับจัดการการสื่อสารกับระบบอัตโนมัติ
 * UI Layer จะเรียกใช้เมธอดในคลาสนี้เท่านั้นเพื่อสั่งงาน Core Logic
 *
 * @example
 * // --- In ui-manager.js ---
 * import automationApi from './automation-api.js';
 *
 * // การเริ่มทำงาน
 * const config = { pages: 5, delay: 700 };
 * automationApi.start(config).catch(error => console.error(error.message));
 *
 * // การติดตามความคืบหน้า
 * automationApi.onProgressUpdate((progressData) => {
 *   console.log('Progress:', progressData.percent, progressData.message);
 *   updateProgressBar(progressData.percent, progressData.message);
 * });
 *
 * // การหยุด
 * automationApi.stop();
 */
class AutomationAPI {
  /**
   * @constructor
   */
  constructor() {
    // ป้องกันการสร้าง instance ใหม่ (Singleton Pattern)
    if (AutomationAPI.instance) {
      return AutomationAPI.instance;
    }

    this.progressUpdateCallback = null;
    this._addMessageListener(); // เพิ่ม Listener สำหรับรับข้อมูลจาก background
    AutomationAPI.instance = this;
  }

  /**
   * @private
   * @name _addMessageListener
   * @description เพิ่ม Listener สำหรับรับข้อความจาก background script (Core Logic)
   * เพื่อจัดการกับการอัปเดตความคืบหน้าและสถานะต่างๆ
   */
  _addMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // ตรวจสอบว่าข้อความมาจาก background script ของ extension เราเท่านั้น
      if (sender.id !== chrome.runtime.id) return;

      if (message.type === 'AUTOMATION_PROGRESS_UPDATE' && this.progressUpdateCallback) {
        // เมื่อมีการอัปเดตความคืบหน้า ให้เรียก callback ที่ UI ลงทะเบียนไว้
        this.progressUpdateCallback(message.payload);
      } else if (message.type === 'AUTOMATION_ERROR') {
        // จัดการกับข้อผิดพลาดที่ส่งมาจาก Core Logic
        console.error('Core Logic Error:', message.payload.error);
        // สามารถแสดงข้อผิดพลาดให้ผู้ใช้เห็นได้ที่นี่ (เช่น ผ่าน callback หรือ event)
      }
      // ควร return true ในกรณีที่ต้องการส่ง response แบบ asynchronous
      // ในที่นี้ เราแค่รับข้อมูล จึงไม่จำเป็น
    });
  }

  /**
   * @name start
   * @description ส่งคำสั่งเริ่มกระบวนการอัตโนมัติไปยัง Core Logic
   * @param {object} config - การตั้งค่าต่างๆ เช่น { pages, delay, offerId }
   * @returns {Promise<object>} - Promise ที่จะ resolve พร้อมกับการตอบกลับจาก background
   */
  async start(config) {
    try {
      console.log('API: Sending START_AUTOMATION with config:', config);
      // ส่งข้อความไปยัง background script เพื่อเริ่มทำงาน
      const response = await chrome.runtime.sendMessage({
        type: 'START_AUTOMATION',
        payload: config,
      });

      if (response && response.error) {
        throw new Error(response.error);
      }

      return response;
    } catch (error) {
      console.error('API Error starting automation:', error);
      // ส่งข้อความแสดงข้อผิดพลาดที่เป็นมิตรกับผู้ใช้
      throw new Error('ไม่สามารถเริ่มการทำงานอัตโนมัติได้ กรุณาลองอีกครั้ง');
    }
  }

  /**
   * @name stop
   * @description ส่งคำสั่งหยุดการทำงานไปยัง Core Logic
   * @returns {Promise<object>}
   */
  async stop() {
    try {
      console.log('API: Sending STOP_AUTOMATION');
      const response = await chrome.runtime.sendMessage({ type: 'STOP_AUTOMATION' });

      if (response && response.error) {
        throw new Error(response.error);
      }

      return response;
    } catch (error) {
      console.error('API Error stopping automation:', error);
      throw new Error('เกิดข้อผิดพลาดในการสั่งหยุด');
    }
  }

  /**
   * @name getStatus
   * @description ขอสถานะปัจจุบันของระบบอัตโนมัติจาก Core Logic
   * @returns {Promise<object>} - Promise ที่จะ resolve พร้อมกับสถานะปัจจุบัน
   */
  async getStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_AUTOMATION_STATUS' });

      if (response && response.error) {
        throw new Error(response.error);
      }

      return response;
    } catch (error) {
      console.error('API Error getting status:', error);
      throw new Error('ไม่สามารถดึงสถานะล่าสุดได้');
    }
  }

  /**
   * @name onProgressUpdate
   * @description ลงทะเบียนฟังก์ชัน callback เพื่อรับการอัปเดตความคืบหน้า
   * @param {function(object): void} callback - ฟังก์ชันที่จะถูกเรียกเมื่อมีความคืบหน้า
   */
  onProgressUpdate(callback) {
    if (typeof callback === 'function') {
      this.progressUpdateCallback = callback;
    } else {
      console.error('onProgressUpdate requires a function as an argument.');
    }
  }
}

// สร้างและ export instance เดียวของคลาส (Singleton)
const automationApi = new AutomationAPI();
// ทำให้สามารถ import โดยใช้ import automationApi from '...'
export default automationApi;
