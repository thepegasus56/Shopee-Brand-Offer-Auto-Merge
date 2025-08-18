# คู่มือการนำไปใช้งาน (Deployment Guide)

เอกสารนี้อธิบายขั้นตอนการนำ Extension **Shopee Brand Offer Extractor** ไปใช้งานในรูปแบบต่างๆ

## 1. การสร้างแพ็คเกจสำหรับเผยแพร่ (Creating a Distribution Package)

ก่อนที่จะนำไปใช้งาน คุณต้องสร้างไฟล์ `.zip` ที่รวมไฟล์ที่จำเป็นทั้งหมดก่อน

1.  **ให้สิทธิ์สคริปต์**: หากยังไม่ได้ทำ, เปิด Terminal แล้วสั่ง:
    ```bash
    chmod +x build.sh
    ```
2.  **รันสคริปต์**:
    ```bash
    ./build.sh
    ```
3.  หลังจากสคริปต์ทำงานเสร็จ คุณจะได้ไฟล์ `shopee-brand-offer-extractor-vX.X.X.zip` (X.X.X คือเวอร์ชันปัจจุบัน)

## 2. การติดตั้งสำหรับใช้งานส่วนตัว (Local Installation)

วิธีนี้เหมือนกับการติดตั้งเพื่อการพัฒนา แต่จะใช้กับไฟล์ `.zip` ที่สร้างขึ้น ทำให้จัดการได้ง่ายกว่า

1.  **Unzip ไฟล์**: แตกไฟล์ `shopee-brand-offer-extractor-vX.X.X.zip` ที่สร้างจาก `build.sh` จะได้เป็นโฟลเดอร์ใหม่
2.  **เปิด Chrome Extensions**: ไปที่ `chrome://extensions`
3.  **เปิด Developer Mode**: เปิดใช้งาน "โหมดนักพัฒนา"
4.  **Load Unpacked**: คลิกที่ **"โหลดส่วนขยายที่คลายซิป" (Load unpacked)** แล้วเลือกโฟลเดอร์ที่ได้จากการแตก zip

## 3. การเผยแพร่บน Chrome Web Store (Publishing to Chrome Web Store)

การนำ Extension ขึ้น Chrome Web Store เป็นกระบวนการที่ซับซ้อนและต้องใช้บัญชีนักพัฒนาของ Google นี่คือภาพรวมของขั้นตอน:

### สิ่งที่ต้องเตรียม
1.  **ไฟล์ ZIP**: ไฟล์ `.zip` ที่สร้างจาก `build.sh`
2.  **ไอคอน**: ไอคอนขนาด 128x128 (มีอยู่แล้วใน `icons/`)
3.  **ภาพหน้าจอ (Screenshots)**: ภาพหน้าจอการใช้งาน Extension อย่างน้อย 1 ภาพ (ขนาด 1280x800 หรือ 640x400)
4.  **บัญชีนักพัฒนา**: ต้องสมัคร [Chrome Web Store developer account](https://chrome.google.com/webstore/developer/dashboard) และชำระค่าธรรมเนียมแรกเข้า (one-time fee)

### ขั้นตอนภาพรวม
1.  **ไปที่ Developer Dashboard**: ล็อกอินเข้าสู่บัญชีนักพัฒนาของคุณ
2.  **เพิ่มรายการใหม่**: คลิกปุ่ม "Add new item"
3.  **อัปโหลดไฟล์ ZIP**: อัปโหลดไฟล์ `.zip` ของ Extension
4.  **กรอกข้อมูลใน Store Listing**:
    -   **ชื่อและคำอธิบาย**: ใส่ชื่อ Extension และคำอธิบายที่ดึงดูดผู้ใช้ (มีภาษาไทยและอังกฤษ)
    -   **ไอคอนและภาพหน้าจอ**: อัปโหลดไฟล์ภาพที่เตรียมไว้
    -   **หมวดหมู่**: เลือกหมวดหมู่ที่เหมาะสม (เช่น Productivity)
    -   **นโยบายความเป็นส่วนตัว (Privacy Policy)**: ต้องระบุ URL ที่ชี้ไปยังนโยบายความเป็นส่วนตัวของคุณ (สามารถใช้ GitHub Pages เพื่อโฮสต์ไฟล์ Markdown ง่ายๆ ได้)
5.  **ตั้งค่าการเผยแพร่**:
    -   **Visibility**: เลือกว่าจะให้เป็นสาธารณะ (Public), ไม่แสดงในรายการ (Unlisted), หรือส่วนตัว (Private)
    -   **Pricing**: ตั้งค่าราคา (ในที่นี้คือ Free)
6.  **ส่งเพื่อตรวจสอบ (Submit for Review)**: Google จะใช้เวลาในการตรวจสอบ Extension ของคุณ (อาจใช้เวลาหลายวัน) ก่อนที่จะเผยแพร่บน Store

## 4. การอัปเดตเวอร์ชัน (Updating the Extension)

เมื่อต้องการปล่อยเวอร์ชันใหม่:
1.  อัปเดตหมายเลข `"version"` ใน `manifest.json`
2.  รัน `build.sh` เพื่อสร้างไฟล์ `.zip` ใหม่
3.  ใน Developer Dashboard, ไปที่รายการ Extension ของคุณแล้วอัปโหลดไฟล์ `.zip` เวอร์ชันใหม่

---
สำหรับข้อมูลเพิ่มเติมเกี่ยวกับการเผยแพร่ โปรดอ่าน [เอกสารทางการของ Chrome](https://developer.chrome.com/docs/webstore/publish/)
