# 🏗️ สถาปัตยกรรมและโครงสร้างโปรเจกต์ (Project Architecture & Structure)

เอกสารนี้อธิบายโครงสร้าง, สถาปัตยกรรม, และแนวทางการพัฒนาของโปรเจกต์ **Shopee Brand Offer Extractor** (อัปเดตล่าสุด)

## 📌 สารบัญ (Table of Contents)
1. [หลักการ Clean Architecture](#-หลักการ-clean-architecture)
2. [โครงสร้างไฟล์และโฟลเดอร์](#-โครงสร้างไฟล์และโฟลเดอร์)
3. [คำอธิบายไฟล์และโฟลเดอร์](#-คำอธิบายไฟล์และโฟลเดอร์)
    - [Root Level Files](#root-level-files)
    - [Documentation Files (`docs/`)](#documentation-files-docs)
    - [Build & Release Files](#build--release-files)
    - [Source Code (`src/`)](#source-code-src)
4. [File Permission Matrix](#-file-permission-matrix)
5. [แนวทางการพัฒนา (Development Guidelines)](#-แนวทางการพัฒนา-development-guidelines)

---

## 🎯 หลักการ Clean Architecture

โปรเจกต์นี้ใช้หลัก Clean Architecture เพื่อแบ่งแยกส่วนต่างๆ ของโค้ดออกจากกันอย่างชัดเจน ทำให้ง่ายต่อการแก้ไข, ทดสอบ, และบำรุงรักษา

### 💡 Core Principles
1.  🎨 **UI Layer แก้ไขได้อิสระ**: `src/ui/` ถูกออกแบบมาให้ทีม UI สามารถแก้ไขหน้าตา, Layout, และการตอบสนองของผู้ใช้ได้อย่างเต็มที่โดยไม่กระทบ Logic หลัก
2.  🔌 **API เป็นสะพานเชื่อม**: `src/api/` คือ "สัญญา" (Interface Contract) ที่กำหนดวิธีการสื่อสารระหว่าง UI และ Core Logic การเปลี่ยนแปลงใดๆ ใน API ต้องมีการตกลงกันทั้งสองฝ่าย
3.  🔒 **Logic คือหัวใจ ห้ามแก้ไขโดยไม่จำเป็น**: `src/core/` เป็นส่วนที่ควบคุมการทำงานหลักทั้งหมด เมื่อทำงานได้อย่างถูกต้องและเสถียรแล้ว จะถูกป้องกันการแก้ไข (Protected) เพื่อรักษาความมั่นคงของระบบ
4.  📚 **เอกสารคือแผนที่**: `docs/` คือศูนย์รวมเอกสารประกอบทั้งหมด ช่วยให้ทุกคนในทีมเข้าใจภาพรวมและรายละเอียดของโปรเจกต์

---

## 📁 โครงสร้างไฟล์และโฟลเดอร์

```
shopee-brand-offer-extractor/
├── README.md
├── PROGRESS.md
├── STRUCTURE.md
├── manifest.json
├── build.sh
│
├── docs/
│   ├── USER_MANUAL.md
│   ├── INSTALLATION.md
│   ├── TROUBLESHOOTING.md
│   ├── API_DOCUMENTATION.md
│   ├── RELEASE.md
│   ├── DEPLOYMENT.md
│   └── PACKAGE_MANIFEST.md
│
├── icons/
│   ├── icon16.png, icon48.png, icon128.png
│
└── src/
    ├── ui/
    ├── api/
    ├── core/
    ├── utils/
    └── constants/
```

---

## 📄 คำอธิบายไฟล์และโฟลเดอร์

### Root Level Files
-   `README.md`: 📖 คู่มือภาพรวมโปรเจกต์และวิธีเริ่มต้น
-   `PROGRESS.md`: 📊 ติดตามความคืบหน้า Milestone ต่างๆ
-   `STRUCTURE.md`: 🏗️ (ไฟล์นี้) อธิบายโครงสร้าง สถาปัตยกรรม และแนวทางการพัฒนา
-   `manifest.json`: ⚙️ ไฟล์คอนฟิกหลักของ Chrome Extension

### Documentation Files (`docs/`)
-   `INSTALLATION.md`: 🛠️ คู่มือการติดตั้ง Extension สำหรับนักพัฒนาและผู้ใช้
-   `USER_MANUAL.md`: 📘 คู่มือการใช้งานฟีเจอร์ต่างๆ ของ Extension
-   `TROUBLESHOOTING.md`: 🔍 แนวทางการแก้ไขปัญหาที่พบบ่อย
-   `API_DOCUMENTATION.md`: 🔌 เอกสาร API สำหรับ `automationApi` และ `configApi`
-   `RELEASE.md`: 🔖 หมายเหตุการเปลี่ยนแปลงในแต่ละเวอร์ชัน (Changelog)
-   `DEPLOYMENT.md`: 🚀 คู่มือการนำ Extension ขึ้น Chrome Web Store
-   `PACKAGE_MANIFEST.md`: 📦 รายการไฟล์ทั้งหมดที่ใช้ในการเผยแพร่

### Build & Release Files
-   `build.sh`: 🛠️ สคริปต์สำหรับสร้างไฟล์ `.zip` อัตโนมัติ เพื่อเตรียมพร้อมสำหรับการเผยแพร่

### Source Code (`src/`)
-   `src/ui/`: 🎨 **UI Layer** - โค้ดส่วนหน้าจอผู้ใช้ (HTML, CSS, JS)
-   `src/api/`: 🔌 **API Boundary** - โค้ดที่เป็นสะพานเชื่อมระหว่าง UI และ Core
-   `src/core/`: 🔒 **Core Logic** - โค้ดที่เป็นหัวใจหลักของระบบ (Service Worker, Automation Engine)
-   `src/utils/`: ⚙️ **Utilities** - ฟังก์ชันเสริมที่ใช้ร่วมกัน
-   `src/constants/`: 📐 **Constants** - ค่าคงที่ที่ใช้ทั้งระบบ

---

## 📋 File Permission Matrix

ตารางนี้แสดงแนวทางการแก้ไขไฟล์สำหรับนักพัฒนาในแต่ละส่วน

| Layer | Path | Permission | 👍 สิ่งที่ควรทำ (DO) | 👎 สิ่งที่ไม่ควรทำ (DO NOT) |
| :--- | :--- | :--- | :--- | :--- |
| 🎨 **UI** | `src/ui/` | **Editable** | - แก้ไข HTML, CSS, JS ได้อิสระ <br> - เรียกใช้ฟังก์ชันจาก `src/api/` | - เข้าถึง `src/core/` โดยตรง <br> - เพิ่ม Logic การทำงานหลักใน UI |
| 🔌 **API** | `src/api/` | **Caution** ⚠️ | - เพิ่มเมธอดใหม่เมื่อมีฟีเจอร์เพิ่ม <br> - แก้ไขเมื่อมีการตกลงร่วมกัน | - เปลี่ยนชื่อหรือ Parameter ของเมธอดที่มีอยู่โดยพลการ |
| 🔒 **Core** | `src/core/` | **Protected** | - แก้ไข Bug <br> - ปรับปรุงประสิทธิภาพ (Performance) | - เปลี่ยนแปลง Logic หลักที่ทำงานถูกต้องแล้วโดยไม่จำเป็น |
| ⚙️ **Utils** | `src/utils/` | **Protected** | - เพิ่มฟังก์ชันเสริมที่ใช้ได้ทั่วไป | - เพิ่ม Logic ที่ผูกกับ Business Rule โดยตรง |
| 📐 **Constants**| `src/constants/`| **Protected**| - อ่านค่าไปใช้ | - แก้ไขค่าคงที่โดยไม่แจ้งทีม Core |
| 📚 **Docs** | `docs/` | **Editable** | - อัปเดตเอกสารให้ตรงกับโค้ดปัจจุบัน | - ลบเอกสารสำคัญ |

---

## 💡 แนวทางการพัฒนา (Development Guidelines)

### การสื่อสารระหว่าง Layers
-   **UI -> API**: UI Layer (เช่น `ui-manager.js`) *ต้อง* เรียกใช้ Core Logic ผ่านฟังก์ชันที่ `automationApi` หรือ `configApi` มีให้เท่านั้น
    ```javascript
    // ✅ ถูกต้อง: เรียกผ่าน API
    import automationApi from '../api/automation-api.js';
    automationApi.start(config);
    ```
-   **Core -> UI**: Core Logic (เช่น `background.js`) จะส่งข้อมูลกลับมาให้ UI ผ่านระบบ Event (`chrome.runtime.sendMessage`) ซึ่ง `automationApi` จะเป็นผู้ดักจับและส่งต่อให้ UI ผ่าน Callback
    ```javascript
    // ใน background.js
    // ส่งข้อมูลอัปเดตสถานะ
    chrome.runtime.sendMessage({ type: 'AUTOMATION_PROGRESS_UPDATE', payload: status });

    // ใน automation-api.js
    // ลงทะเบียนรอรับข้อมูล
    automationApi.onProgressUpdate(callback);
    ```

### การทดสอบ (Testing)
-   เนื่องจาก Extension ต้องทำงานกับ `chrome.*` APIs ซึ่งไม่มีในสภาพแวดล้อมการทดสอบปกติ (เช่น Localhost ที่รันด้วย `http.server`), โค้ดใน **API Layer** จึงถูกออกแบบมาให้ยืดหยุ่น
-   มีการใช้ตัวแปร `isExtensionContext` เพื่อตรวจสอบสภาพแวดล้อมก่อนเรียกใช้ Chrome API จริง ซึ่งช่วยให้สามารถทดสอบ UI บนเบราว์เซอร์ปกติได้โดยไม่เกิด Error
-   ควรใช้ Playwright ในการทำ Frontend Verification เพื่อสร้าง Screenshot และยืนยันการเปลี่ยนแปลงของ UI

### การจัดการ Source Code
-   Commit ควรมีขนาดเล็กและสื่อความหมายที่ชัดเจน
-   การเปลี่ยนแปลงใหญ่ๆ ควรเปิด Branch ใหม่เสมอ (เช่น `feat/new-feature`, `fix/bug-fix`, `docs/update-docs`)
