# Shopee Brand Offer Extractor

Chrome Extension (Manifest V3) สำหรับดึงและรวมข้อมูลโปรโมชันแบรนด์จาก Shopee Affiliate อัตโนมัติ  
เน้นการใช้งานง่าย รองรับ UI ไทย-อังกฤษ พร้อมฟีเจอร์ Multi-Agent เพื่อการรวมไฟล์ข้ามหน้าแบบมืออาชีพ

---

## 🎯 วัตถุประสงค์

- ดึงและรวมลิงก์โปรโมชัน Shopee ผ่านเส้นทาง `/offer/brand_offer/{shopBrandOfferId}` อัตโนมัติ
- เลือกสินค้าในแต่ละหน้า → รับลิงก์ → ดาวน์โหลดไฟล์ → หน้าถัดไป → รวมจนจบ N หน้า
- สร้างไฟล์รวมเดียว (CSV) พร้อมคอลัมน์ shopBrandOfferId, pageIndex, timestamp  
- ไม่ bypass ระบบความปลอดภัยหรือ login ของแพลตฟอร์ม

---

## 🏗️ สร้างโครงสร้างไฟล์พื้นฐาน

├── manifest.json # Chrome Extension config
├── src/
│ ├── popup.html # UI หลัก
│ ├── popup.js # Logic UI
│ ├── background.js # Background service
│ ├── content.js # Script ทำงานบนเว็บ
│ ├── styles.css # CSS styling
│ ├── csv.js # CSV processing utility
│ └── xlsx.min.js # XLSX support (optional)
├── icons/
│ ├── icon16.png # ไอคอน 16x16
│ ├── icon48.png # ไอคอน 48x48
│ └── icon128.png # ไอคอน 128x128


---

## 🤖 สถาปัตยกรรมย่อย (Multi-Agent)

- **Orchestrator Agent**: ตั้งค่า, ควบคุม, รวมผล, QA/Packaging, ตัดสินใจโหมดทำงาน
- **Selector & DOM Agent**: หา selector ปุ่มหลัก รองรับ fallback ไทย-อังกฤษ
- **Automation Agent**: ลูป select all → get link → wait → next (รองรับ delay, retry, readiness)
- **Downloads & Merge Agent**: เฝ้าดูการดาวน์โหลด, union headers, รองรับ XLSX (optional)
- **Payload Intercept Agent**: (โหมด B, optional) ดัก payload ลดดีเลย์ เพิ่มความเร็ว
- **Config & Persistence Agent**: เก็บ/โหลดค่า N, delays, resume, filters, selectors
- **Packaging & QA Agent**: ลด permission, README, ทดสอบหลากหลายสถานการณ์

---

## ⚙️ วิธีติดตั้ง

1. **Clone หรือ Download ZIP โครงการนี้**
git clone https://github.com/thepegasus56/Shopee-Brand-Offer-Extractor.git
cd Shopee-Brand-Offer-Extractor


2. **สร้างโครงสร้างไฟล์ (ถ้ายังไม่มี)**
- สร้างโฟลเดอร์ `src/` และ `icons/`
- สร้างไฟล์ตามโครงสร้างข้างต้น

3. **โหลด Extension ใน Chrome**
- เปิด Chrome ไปที่ `chrome://extensions/`
- เปิด **Developer Mode**
- กด **"Load unpacked"** เลือกโฟลเดอร์โปรเจกต์

---

## 📝 วิธีใช้งาน

1. **ล็อกอิน Shopee Affiliate** ในเบราว์เซอร์
2. **ไปที่หน้า** `/offer/brand_offer/{shopBrandOfferId}`
3. **คลิกไอคอน Extension**  
4. **ตั้งค่าการทำงาน:**
- จำนวนหน้าที่ต้องดึง (N) - ค่าเริ่มต้น: 5
- ความล่าช้าระหว่างขั้นตอน (delay) - ค่าเริ่มต้น: 700ms ±200ms
- เปิด/ปิด Filter "เฉพาะ EXTRA COMM" (ตัวเลือก)
5. **กด Start**  
- Extension จะเลือกทั้งหมด → รับลิงก์ → รอไฟล์ดาวน์โหลด → หน้าถัดไป (วนจบ N หน้า)
- แสดงสถานะ: หน้า X/N, จำนวนไฟล์ที่ดาวน์โหลด, shopBrandOfferId
6. **กด Export** ดาวน์โหลดไฟล์ผลลัพธ์รวม
7. **กด Stop** หากต้องการหยุด (จะจบ task ปัจจุบันก่อนหยุด)

**ชื่อไฟล์ผลลัพธ์:**  
`shopee_offer_{shopBrandOfferId}_{YYYYMMDD}.csv`  
(ใช้ UTF-8 with BOM รองรับภาษาไทยใน Excel)

---

## 📑 ตัวอย่างการใช้งาน

1. ตั้ง N = 3 (จำนวนหน้าที่ต้องดึง)
2. กำหนด delayBase = 700ms, jitter = ±200ms / ขั้นตอน
3. เริ่มงาน: `เลือกทั้งหมด` → `รับลิงก์` → `รอไฟล์ดาวน์โหลด` → `หน้าถัดไป` (วนจนครบ N หน้า)
4. ได้ไฟล์รวมเดียว ผลรวมแถว = จำนวนสินค้า (ไม่รวม header ซ้ำ)

---

## 🔒 Permission & Selector Policy

- **host_permissions:** `https://affiliate.shopee.co.th/*`
- **permissions:** activeTab, scripting, downloads, storage
- **Selector ลำดับความสำคัญ:** `data-testid`/`aria-*` > role/name > DOM relative > innerText  
- **Fallback ไทย/อังกฤษ:**  
- "เลือกผลิตภัณฑ์ทั้งหมด" / "Select all"
- "รับลิงก์", "เอา ลิงก์" / "Get link"
- "ถัดไป" / "Next"

---

## ⏱️ การรอและเว้นช่วง

- **delayBase:** 700ms, **jitter:** ±200ms
- **maxWait per step:** 15s, **retry สูงสุด:** 3 ครั้ง (exponential backoff)
- ใช้ MutationObserver/Polling เฉพาะจุดที่จำเป็น
- รองรับการตรวจจับ Modal และ DOM readiness

---

## 🧾 ผลลัพธ์รวม

- **CSV header เดียว** - ต่าง header จะ union แล้วเติมค่าว่าง
- **Encoding:** UTF-8 with BOM เพื่อรองรับ Excel ภาษาไทย
- **คอลัมน์เพิ่มเติม:** shopBrandOfferId, pageIndex, timestamp
- **รองรับทั้ง CSV และ XLSX** input files

---

## 🛡️ เงื่อนไขและข้อจำกัด

- ต้อง login Shopee Affiliate ก่อนใช้งาน
- ไม่ bypass ยืนยันตัวตน/ระบบความปลอดภัยใดๆ
- ใช้ selector attribute-first เพื่อความเสถียร (รองรับ UI เปลี่ยนแปลง)
- ผลลัพธ์รวม header เดียว ถ้า header ไม่ตรงกันจะ union และเติมช่องว่าง
- รองรับ UI ไทยเป็นหลัก (มี fallback อังกฤษ)
- รองรับโหมด A (รวมไฟล์ดาวน์โหลด) เป็นหลัก โหมด B (ดัก payload) อยู่ในแผนพัฒนา

---

## 🏁 Acceptance Criteria

- ✅ เริ่มจาก `/offer/brand_offer/{id}` กำหนด N=3 สำเร็จลูปทั้งหมด
- ✅ ได้ไฟล์รวมเดียว ตามรูปแบบชื่อที่กำหนด แถว = ผลรวมแถวไฟล์ย่อย
- ✅ ปุ่ม Stop หยุดหลังจบขั้นตอนที่กำลังรัน
- ✅ ทำงานได้ทั้งภาษาไทย/อังกฤษ โดย selector attribute-first

---

## 🚀 ขั้นตอนการพัฒนา

1. **สร้างโครงสร้างไฟล์** ตามแผนภาพข้างต้น
2. **เขียน manifest.json** กำหนด permissions และ config
3. **พัฒนา popup.html + popup.js** สำหรับ UI ควบคุม
4. **เขียน content.js** สำหรับ selector detection และ automation
5. **พัฒนา background.js** สำหรับ download monitoring และ merge files
6. **ทดสอบและ debug** บนหน้า Shopee Affiliate จริง

---

## 🔧 โหมดการทำงาน

### **โหมด A (แนะนำเริ่มต้น):** รวมไฟล์ดาวน์โหลด
- รวม CSV เป็นหลัก
- รองรับ XLSX เมื่อจำเป็น
- ใช้ union headers สำหรับไฟล์ที่ header แตกต่าง

### **โหมด B (ขั้นถัดไป):** ดัก payload
- ดัก response ขณะ "รับลิงก์"
- รวมทันทีโดยไม่พึ่งไฟล์ดิสก์
- เร็วขึ้นและลดการใช้ storage

---

## 📊 ฟีเจอร์หลัก

- 🔁 **Auto Pagination:** N หน้า, delay±jitter, retry/backoff, stop gracefully
- 📚 **Merge Files:** union headers, ลำดับตามไฟล์แรก, คอลัมน์เพิ่ม shopBrandOfferId/pageIndex/timestamp
- ✨ **Filters:** "เฉพาะ EXTRA COMM" (ตัวเลือก)
- 📤 **Export:** shopee_offer_{shopBrandOfferId}_YYYYMMDD.csv (UTF-8 with BOM)
- 🧵 **Resume:** ดำเนินต่อจากหน้าที่ค้างไว้

---

## 📝 หมายเหตุ

- หากไฟล์ที่ดาวน์โหลดไม่ใช่ .csv แต่เป็น .xlsx จะมีระบบแปลงและ merge อัตโนมัติ
- เปิด Debug/Log ได้จาก popup UI กรณีตรวจสอบเหตุผิดปกติ
- เสนอแนะ ติชม โค้ด และ Pull Request ยินดีต้อนรับ

---

## 👨‍💻 Contributors & License

- เขียนโค้ด ดูแลและออกแบบโดย <your_name>
- Pull Request และ Issue ยินดีต้อนรับ
- License: MIT

---

## 📞 ติดต่อสอบถามและรายงานปัญหา

- เปิด Issue ที่ GitHub Repo: https://github.com/thepegasus56/Shopee-Brand-Offer-Extractor
- หรือ email: <your_email@example.com>

---

## 🔗 Links

- **GitHub Repository:** https://github.com/thepegasus56/Shopee-Brand-Offer-Extractor
- **Chrome Web Store:** (จะอัปเดตเมื่อเผยแพร่)
- **Documentation:** README.md (ไฟล์นี้)
