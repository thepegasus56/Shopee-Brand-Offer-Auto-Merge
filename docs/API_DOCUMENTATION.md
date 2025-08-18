# เอกสาร API (API Documentation)

เอกสารนี้อธิบายรายละเอียดของ API Boundary Layer ทั้งสองส่วน (`automationApi` และ `configApi`) สำหรับนักพัฒนาที่ต้องการนำไปใช้หรือขยายความสามารถของ Extension

## หลักการออกแบบ (Design Principles)

-   **Clean Architecture**: API Layer ทำหน้าที่เป็น "สะพาน" สื่อสารระหว่าง UI Layer และ Core Logic Layer เท่านั้น
-   **Decoupling**: UI Layer จะไม่มีทางเรียกใช้ Logic จาก `src/core/` ได้โดยตรง ต้องเรียกผ่าน API ที่กำหนดไว้เท่านั้น
-   **Asynchronous**: การสื่อสารส่วนใหญ่เป็นแบบ Asynchronous (ใช้ `async/await` และ `Promise`) เนื่องจากต้องมีการส่งข้อความระหว่างส่วนต่างๆ ของ Extension
-   **Singleton**: `automationApi` ถูกออกแบบเป็น Singleton Pattern เพื่อให้มี instance เดียวในระบบ

---

## Automation API (`automation-api.js`)

จัดการการสื่อสารที่เกี่ยวข้องกับกระบวนการทำงานอัตโนมัติทั้งหมด

**การนำไปใช้ (Usage):**
```javascript
import automationApi from './automation-api.js';
```

### Methods

#### `start(config)`
เริ่มต้นกระบวนการอัตโนมัติ
-   **Parameters:**
    -   `config` (Object): อ็อบเจกต์การตั้งค่า ประกอบด้วย:
        -   `pages` (number): จำนวนหน้าที่จะประมวลผล
        -   `delay` (number): เวลาหน่วง (ms)
        -   `offerId` (string): ID ของ Brand Offer
-   **Returns:** `Promise<object>` - Promise ที่ resolve พร้อม object ตอบกลับจาก background
-   **Example:**
    ```javascript
    const myConfig = { pages: 10, delay: 500, offerId: '12345' };
    automationApi.start(myConfig)
      .then(res => console.log(res.message))
      .catch(err => alert(err.message));
    ```

#### `stop()`
ส่งสัญญาณให้หยุดกระบวนการอัตโนมัติ
-   **Returns:** `Promise<object>`
-   **Example:** `automationApi.stop();`

#### `getStatus()`
ขอสถานะปัจจุบันของ Automation Engine
-   **Returns:** `Promise<object>` - Promise ที่ resolve พร้อม object สถานะ เช่น `{ status: 'running', progress: 50, message: '...' }`
-   **Example:**
    ```javascript
    const status = await automationApi.getStatus();
    console.log(status);
    ```

#### `onProgressUpdate(callback)`
ลงทะเบียนฟังก์ชันเพื่อรอรับการอัปเดตความคืบหน้า
-   **Parameters:**
    -   `callback` (Function): ฟังก์ชันที่จะถูกเรียกทุกครั้งที่มีการอัปเดต โดยจะได้รับ `progress` object เป็น argument
-   **Example:**
    ```javascript
    automationApi.onProgressUpdate((progress) => {
      // progress = { percent: 20, message: 'Page 1/5', state: 'running' }
      updateProgressBar(progress.percent, progress.message);
    });
    ```

---

## Configuration API (`config-api.js`)

จัดการการตั้งค่าของผู้ใช้ทั้งหมด โดยใช้ `chrome.storage.sync`

**การนำไปใช้ (Usage):**
```javascript
import { configApi } from './config-api.js';
// or import specific functions
import { get, set } from './config-api.js';
```

### Methods

#### `get()`
ดึงการตั้งค่าล่าสุดที่บันทึกไว้ หากไม่มี จะคืนค่า default
-   **Returns:** `Promise<object>` - Promise ที่ resolve พร้อม object การตั้งค่า
-   **Example:**
    ```javascript
    const settings = await configApi.get();
    pagesInput.value = settings.pages;
    ```

#### `set(newConfig)`
บันทึกการตั้งค่าใหม่ลงใน storage
-   **Parameters:**
    -   `newConfig` (Object): อ็อบเจกต์การตั้งค่าใหม่ (`{ pages, delay }`)
-   **Returns:** `Promise<void>`
-   **Throws:** `Error` หากข้อมูลไม่ถูกต้อง (validation fails)
-   **Example:**
    ```javascript
    const newSettings = { pages: 5, delay: 800 };
    configApi.set(newSettings)
      .catch(err => alert(err.message));
    ```

#### `validate(config)`
ตรวจสอบความถูกต้องของ object การตั้งค่า
-   **Returns:** `object` - `{ isValid: boolean, errors: object }`

#### `exportToFile()`
ส่งออกการตั้งค่าปัจจุบันเป็นไฟล์ `.json`
-   **Action:** จะแสดงหน้าต่างให้ผู้ใช้ดาวน์โหลดไฟล์

#### `importFromString(jsonString)`
นำเข้าการตั้งค่าจาก JSON string และบันทึกลง storage
-   **Parameters:**
    -   `jsonString` (string): เนื้อหา JSON ที่จะนำเข้า
-   **Returns:** `Promise<object>` - คืนค่า config ที่นำเข้าสำเร็จ
-   **Throws:** `Error` หาก JSON ไม่ถูกต้อง หรือข้อมูลไม่ผ่าน validation
