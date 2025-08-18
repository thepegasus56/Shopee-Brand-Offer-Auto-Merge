// ⚠️ API Boundary Layer - requires coordination between UI and Logic teams
// ไฟล์นี้ทำหน้าที่เป็น "สะพาน" หรือ Interface Contract ระหว่าง UI Layer และ Core Logic Layer
// การแก้ไขไฟล์นี้ต้องได้รับการยินยอมจากทั้งสองทีม

const isExtensionContext = window.chrome && chrome.runtime && chrome.runtime.id;

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
  constructor() {
    if (AutomationAPI.instance) {
      return AutomationAPI.instance;
    }
    this.progressUpdateCallback = null;
    if (isExtensionContext) {
      this._addMessageListener();
    }
    AutomationAPI.instance = this;
  }

  _addMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender) => {
      if (sender.id !== chrome.runtime.id) return;
      if (message.type === 'AUTOMATION_PROGRESS_UPDATE' && this.progressUpdateCallback) {
        this.progressUpdateCallback(message.payload);
      } else if (message.type === 'AUTOMATION_ERROR') {
        console.error('Core Logic Error:', message.payload.error);
      }
    });
  }

  async start(config) {
    if (!isExtensionContext) {
      console.warn("TEST MODE: Mocking start().");
      return Promise.resolve({ status: 'ok', message: 'Mock start successful.' });
    }
    try {
      const response = await chrome.runtime.sendMessage({ type: 'START_AUTOMATION', payload: config });
      if (response && response.error) throw new Error(response.error);
      return response;
    } catch (error) {
      console.error('API Error starting automation:', error);
      throw new Error('ไม่สามารถเริ่มการทำงานอัตโนมัติได้ กรุณาลองอีกครั้ง');
    }
  }

  async stop() {
    if (!isExtensionContext) {
      console.warn("TEST MODE: Mocking stop().");
      return Promise.resolve({ status: 'ok', message: 'Mock stop successful.' });
    }
    try {
      const response = await chrome.runtime.sendMessage({ type: 'STOP_AUTOMATION' });
      if (response && response.error) throw new Error(response.error);
      return response;
    } catch (error) {
      console.error('API Error stopping automation:', error);
      throw new Error('เกิดข้อผิดพลาดในการสั่งหยุด');
    }
  }

  async getStatus() {
    if (!isExtensionContext) {
      console.warn("TEST MODE: Mocking getStatus().");
      return Promise.resolve({ status: 'idle', progress: 0, message: 'Ready' });
    }
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_AUTOMATION_STATUS' });
      if (response && response.error) throw new Error(response.error);
      return response;
    } catch (error) {
      console.error('API Error getting status:', error);
      throw new Error('ไม่สามารถดึงสถานะล่าสุดได้');
    }
  }

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
