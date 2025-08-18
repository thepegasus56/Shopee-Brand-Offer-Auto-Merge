# คู่มือการแก้ไขปัญหา (Troubleshooting Guide)

เอกสารนี้รวบรวมปัญหาที่อาจเกิดขึ้นระหว่างการใช้งานหรือการพัฒนา Extension **Shopee Brand Offer Extractor** พร้อมแนวทางการแก้ไข

## สำหรับผู้ใช้งาน (For Users)

| ปัญหา (Problem) | สาเหตุที่เป็นไปได้ (Possible Cause) | แนวทางการแก้ไข (Solution) |
| :--- | :--- | :--- |
| **ปุ่ม Start กดไม่ได้ (เป็นสีเทา)** | 1. อยู่ในหน้าที่ไม่ใช่ Brand Offer <br> 2. ใส่ค่าในช่อง Pages หรือ Delay ไม่ถูกต้อง | 1. ตรวจสอบให้แน่ใจว่าคุณอยู่ในหน้า `affiliate.shopee.co.th/offer/brand_offer/...` <br> 2. ตรวจสอบว่าค่า Pages (1-20) และ Delay (300-2000) ถูกต้องตามที่กำหนด |
| **Offer ID ไม่แสดง หรือขึ้นว่า "Not found"** | คุณอาจจะไม่ได้อยู่ในหน้า Brand Offer ที่ถูกต้อง | ไปที่หน้า Brand Offer ที่ต้องการ แล้วเปิด Extension ใหม่อีกครั้ง |
| **Extension หยุดทำงานกลางคัน** | อาจเกิดจากหน้าเว็บ Shopee มีการเปลี่ยนแปลงโครงสร้าง หรืออินเทอร์เน็ตไม่เสถียร | ลองรีเฟรชหน้าแล้วเริ่มการทำงานใหม่อีกครั้ง หากยังพบปัญหาอยู่ อาจจะต้องมีการอัปเดตโค้ดของ Extension |
| **ไฟล์ CSV ที่ดาวน์โหลดเปิดแล้วอ่านภาษาไทยไม่ออก** | โปรแกรม Spreadsheet (เช่น Excel) อาจจะไม่ได้ตั้งค่าการเข้ารหัสเป็น UTF-8 | ลองเปิดไฟล์ด้วยโปรแกรมอื่น เช่น Google Sheets, LibreOffice Calc หรือ Text Editor ที่รองรับ UTF-8 (เช่น VS Code) หรือตั้งค่า "File Origin" ตอน import ใน Excel เป็น `65001: Unicode (UTF-8)` |

## สำหรับนักพัฒนา (For Developers)

| ปัญหา (Problem) | สาเหตุที่เป็นไปได้ (Possible Cause) | แนวทางการแก้ไข (Solution) |
| :--- | :--- | :--- |
| **(Testing) Script ที่ใช้ `import`/`export` ไม่ทำงาน** | `<script>` tag ในไฟล์ HTML ไม่ได้ระบุ `type="module"` | แก้ไขในไฟล์ `popup.html` โดยเพิ่ม `type="module"` เข้าไปใน script tag ทั้งหมด: `<script type="module" src="..."></script>` |
| **(Testing) Playwright test ล้มเหลวเพราะ CORS** | การโหลด ES6 module จาก `file:///` ถูกจำกัดด้วยนโยบายความปลอดภัยของเบราว์เซอร์ | รัน Local Web Server (`python -m http.server`) แล้วให้ Playwright เข้าไปที่ `http://localhost:8000/...` แทนการใช้ `file:///` |
| **(Testing) Playwright test ล้มเหลวเพราะ `chrome.*` APIs** | `chrome.*` APIs จะไม่สามารถใช้งานได้เมื่อรันไฟล์ HTML บน Localhost ทั่วไป ทำให้ script หยุดทำงาน | Refactor โค้ดในส่วน API Layer (`automation-api.js`, `config-api.js`) ให้มีการตรวจสอบ `isExtensionContext` ก่อนเรียกใช้ Chrome API ใดๆ หากไม่ได้รันใน Extension ให้ return ค่า mock หรือทำงานแบบ bypass แทน |
| **Selector หา Element ไม่เจอ** | Shopee อาจมีการอัปเดตโครงสร้างหน้าเว็บ ทำให้ selector เดิมใช้ไม่ได้ | 1. ตรวจสอบ Selector strategy ใน `content.js` <br> 2. ใช้เครื่องมือ Developer Tools (Inspect) ของเบราว์เซอร์เพื่อหา selector ใหม่ที่เสถียรกว่า (แนะนำให้ใช้ `data-testid` หรือ `aria-label` ก่อน) |
| **`sendMessage` จาก Background ไป UI ล้มเหลว** | Popup ของ UI อาจจะถูกปิดไปแล้วระหว่างที่ Background Script กำลังทำงาน | ใน `background.js` ควรมีการดักจับ Error ของ `chrome.runtime.sendMessage` ด้วย `.catch()` เพื่อป้องกัน unhandled promise rejection และแสดง log แทนการทำให้ service worker แครช |

---
หากพบปัญหานอกเหนือจากนี้ กรุณาเปิด Issue ใน GitHub repository ของโปรเจกต์
