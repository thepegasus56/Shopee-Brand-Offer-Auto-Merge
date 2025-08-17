# 🏗️ Project Structure - Shopee Brand Offer Extractor

เอกสารนี้อธิบายโครงสร้างและสถาปัตยกรรมของโปรเจกต์ที่ใช้หลัก Clean Architecture

## 🎯 หลักการ Clean Architecture

### 💡 Core Principles
1. 🎨 **UI แก้ได้อิสระ** - UI Layer ถูกออกแบบมาให้แก้ไขและปรับเปลี่ยนได้โดยไม่กระทบต่อส่วนอื่นของระบบ เช่น การปรับ Theme, Layout, หรือ Animation
2. 🔌 **API เป็นสะพาน** - API Layer (Boundary) ทำหน้าที่เป็น "สัญญา" ระหว่าง UI และ Logic การเปลี่ยนแปลงใดๆ ใน Contract นี้จะต้องมีการสื่อสารและตกลงกันระหว่างทีมที่ดูแล UI และทีมที่ดูแล Logic
3. 🔒 **Logic คือหัวใจ** - Core Layer เป็นส่วนที่สำคัญที่สุดและมีความเสถียรสูง เมื่อส่วนนี้ทำงานได้อย่างถูกต้องแล้ว จะไม่มีการแก้ไขหากไม่จำเป็นจริงๆ เพื่อรักษาความเสถียรของระบบ
4. 📐 **Constants กลาง** - ค่าคงที่ทั้งหมดจะถูกเก็บไว้ที่ส่วนกลาง (`constants/`) การเปลี่ยนแปลงที่ไฟล์นี้จะมีผลกับทั้งระบบ ทำให้การจัดการค่าต่างๆ เป็นไปอย่างง่ายดาย

## 📁 Directory Structure
```
shopee-brand-offer-extractor/
├── manifest.json                          # ⚙️ ไฟล์กำหนดค่า Chrome Extension
├── README.md                              # 📖 คู่มือการใช้งาน
├── PROGRESS.md                            # 📊 ติดตามความคืบหน้า
├── STRUCTURE.md                           # 🏗️ เอกสารสถาปัตยกรรม
│
└── src/                                   # 📁 โฟลเดอร์ source code หลัก
    │
    ├── ui/                                # 🎨 UI LAYER (แก้ได้อิสระ)
    │   ├── popup.html                     # 🖼️ หน้า UI หลัก
    │   ├── ui-manager.js                  # 🎛️ ตัวจัดการ UI
    │   └── styles.css                     # 🎨 CSS Styling
    │
    ├── api/                               # 🔌 API BOUNDARY (Interface Contract)
    │   ├── automation-api.js              # 🤖 API ระบบอัตโนมัติ
    │   └── config-api.js                  # ⚙️ API จัดการการตั้งค่า
    │
    ├── core/                              # 🔒 LOGIC LAYER (ห้ามแก้)
    │   ├── background.js                  # 🏃‍♂️ Background Service Worker
    │   ├── content.js                     # 📄 Content Script
    │   └── automation-engine.js           # 🎯 เครื่องมืออัตโนมัติ
    │
    ├── utils/                             # 🔧 UTILITIES (ห้ามแก้)
    │   └── version.js                     # 📋 Single Source Version
    │
    └── constants/                         # 📐 CONSTANTS (ค่าคงที่กลาง)
        └── config.json                    # ⚙️ ค่าตั้งต้น
```

## 📋 File Permission Matrix

ตารางนี้แสดงระดับการอนุญาตในการแก้ไขไฟล์สำหรับนักพัฒนาแต่ละส่วน เพื่อรักษาความเสถียรของสถาปัตยกรรม

| Layer         | Path (`src/`)        | Editable by UI Dev | Protected (Core Logic) | Description                                                              |
|---------------|----------------------|:------------------:|:----------------------:|--------------------------------------------------------------------------|
| 🎨 **UI**     | `ui/`                |         ✅         |           ❌           | **แก้ไขได้เต็มที่** นักพัฒนา UI สามารถปรับเปลี่ยนไฟล์ทั้งหมดในนี้ได้อิสระ |
| 🔌 **API**    | `api/`               |         ⚠️         |           ⚠️          | **แก้ไขเมื่อจำเป็น** ต้องมีการพูดคุยและตกลงกันก่อน เพราะกระทบทั้ง UI และ Logic |
| 🔒 **Logic**  | `core/`              |         ❌         |           ✅           | **ห้ามแก้ไข** เป็นส่วน Logic หลักของระบบที่มีความเสถียรสูง                  |
| 🔧 **Utils**  | `utils/`             |         ❌         |           ✅           | **ห้ามแก้ไข** เป็นฟังก์ชันเสริมที่ใช้ร่วมกันในส่วน Core Logic              |
| 📐 **Constants**| `constants/`       |         ❌         |           ✅           | **ห้ามแก้ไข** ค่าคงที่กลางของระบบ หากต้องการเปลี่ยนต้องแจ้งทีม Core        |

**สัญลักษณ์:**
- ✅ **Editable**: สามารถแก้ไขได้
- ❌ **Protected**: ห้ามแก้ไขโดยเด็ดขาด
- ⚠️ **Caution**: แก้ไขได้เมื่อจำเป็นและต้องได้รับการอนุมัติจากทุกฝ่ายที่เกี่ยวข้อง

## 💡 Development Guidelines

แนวทางการพัฒนาสำหรับ UI Developer เพื่อให้ทำงานร่วมกันได้อย่างราบรื่น

### สิ่งที่ UI Developer ทำได้ (Do's) 👍

- **ปรับแก้ UI ได้อย่างอิสระ**: สามารถแก้ไขไฟล์ `popup.html` และ `styles.css` เพื่อเปลี่ยนหน้าตา, Layout, สี, Font หรือเพิ่ม Animation ได้เต็มที่
- **จัดการ Event และ State ของ UI**: แก้ไข `ui-manager.js` เพื่อจัดการกับการตอบสนองของผู้ใช้บนหน้า UI เช่น การกดปุ่ม, การแสดงผลข้อมูล, หรือการซ่อน/แสดงองค์ประกอบต่างๆ
- **เรียกใช้ API จาก `automation-api.js` และ `config-api.js`**: ใช้ฟังก์ชันที่ API Layer มีให้เพื่อสั่งงานหรือดึงข้อมูลจาก Core Logic

**ตัวอย่างโค้ดที่ทำได้:**

```javascript
// ใน src/ui/ui-manager.js

// ✅ ถูกต้อง: เรียกใช้ API ที่มีอยู่เพื่อเริ่มการทำงาน
document.getElementById('startButton').addEventListener('click', () => {
  // สมมติ automationApi ถูก import เข้ามาแล้ว
  automationApi.startExtraction();
});

// ✅ ถูกต้อง: อัปเดต UI ตามข้อมูลที่ได้รับ
function updateStatus(message) {
  document.getElementById('statusLabel').textContent = message;
}
```

### สิ่งที่ UI Developer ห้ามทำ (Don'ts) 👎

- **ห้ามแก้ไขไฟล์ใน `core/`, `utils/`, `constants/`**: ไฟล์เหล่านี้เป็นส่วนสำคัญของระบบ การแก้ไขอาจทำให้การทำงานหลักผิดพลาด
- **ห้ามแก้ไข Signature ของฟังก์ชันใน `api/`**: การเปลี่ยนชื่อฟังก์ชัน, Parameter, หรือค่าที่ Return จาก API จะทำให้ส่วนอื่นที่เรียกใช้พังได้ หากจำเป็นต้องเปลี่ยน ต้องพูดคุยกับทีม Core ก่อน
- **ห้ามเพิ่ม Logic การทำงานหลักเข้าไปใน `ui-manager.js`**: Logic ที่ซับซ้อน เช่น การประมวลผลข้อมูลที่ได้จากหน้าเว็บ ควรอยู่ใน `core/` ไม่ใช่ใน UI Layer

**ตัวอย่างโค้ดที่ห้ามทำ:**

```javascript
// ใน src/ui/ui-manager.js

// ❌ ผิด: เพิ่ม Logic การดึงข้อมูลจากหน้าเว็บโดยตรงใน UI Layer
// หน้าที่นี้ควรเป็นของ content.js หรือ automation-engine.js ใน core/
document.getElementById('extractButton').addEventListener('click', () => {
  const data = document.querySelector('.shopee-product-item').innerText; // ไม่ควรทำ
  // process(data)...
});

// ❌ ผิด: แก้ไขไฟล์ API โดยพลการ
// ใน src/api/automation-api.js
function startExtraction(newName) { // เปลี่ยนชื่อ Parameter โดยไม่แจ้ง
  // ...
}
```
