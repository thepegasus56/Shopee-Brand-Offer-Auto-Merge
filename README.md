# Shopee Brand Offer Auto & Merge Extension

**Chrome Extension (Manifest V3)** สำหรับการดึงลิงก์โปรโมชันแบรนด์บนหน้า Shopee Affiliate อัตโนมัติ พร้อมรวมไฟล์ข้ามหลายหน้าแบบมืออาชีพ  
> รองรับ UI ไทย/อังกฤษ ใช้ Multi-Sub-Agent สถาปัตยกรรมอัตโนมัติ

---

## 🎯 วัตถุประสงค์

- ดึงลิงก์โปรโมชัน Shopee แบบอัตโนมัติ บนเส้นทาง `/offer/brand_offer/{shopBrandOfferId}`
- เลือกสินค้าในแต่ละหน้า → รับลิงก์ → ดาวน์โหลดไฟล์ → หน้าถัดไป → รวมไฟล์จนครบ N หน้า
- สร้างไฟล์รวมเดียว (CSV) ที่มีข้อมูล shopBrandOfferId, pageIndex และ timestamp  
- ปลอดภัย ไม่ bypass ระบบหรือข้าม authentication ของแพลตฟอร์ม

---

## 🏗️ สถาปัตยกรรมย่อย (Multi-Sub-Agent)

- **Orchestrator Agent**: ตั้งค่า, แบ่งงาน, รวมผล, QA/Packaging, ตัดสินใจโหมดทำงาน
- **Selector & DOM Agent**: หา selector เสถียรปุ่มหลัก/มี fallback ไทย-อังกฤษ
- **Automation Agent**: ลูปต่อหน้า เลือกทั้งหมด → รับลิงก์ → รอไฟล์ → หน้าถัดไป (delay, retry, readiness)
- **Downloads & Merge Agent**: ตรวจจับไฟล์ดาวน์โหลด, รวมไฟล์/union headers, รองรับ XLSX (optional)
- **Payload Intercept Agent**: (โหมด B, optional) ดัก payload ลดดีเลย์ เพิ่มความเร็ว
- **Config & Persistence Agent**: เก็บ/โหลดค่า N, delays, resume, filters, selectors
- **Packaging & QA Agent**: ลด permission, README, ทดสอบหลากหลายสถานการณ์

---

## 📦 โครงสร้างโปรเจกต์

manifest.json
src/
popup.html # UI ส่วนควบคุม
popup.js # UI logic
background.js # ลูปหลัก/จับดาวน์โหลด/รวมไฟล์/export
content.js # คลิก/หา selector/handle modal
csv.js # union headers/parse/serialize CSV
xlsx.min.js # (ใช้เมื่อจำเป็น) อ่านไฟล์ Excel
README.md # เอกสารนี้


---

## ⚙️ วิธีติดตั้ง

1. **Clone หรือ Download ZIP โครงการนี้**
2. เปิด Chrome ไปที่ `chrome://extensions/`
3. เปิด **Developer Mode**
4. คลิก **"Load unpacked"** แล้วเลือกโฟลเดอร์โปรเจกต์นี้

---

## 📝 วิธีใช้งาน

1. เข้าสู่ระบบ Shopee Affiliate ผ่านเบราว์เซอร์
2. ไปที่หน้า `/offer/brand_offer/{shopBrandOfferId}`
3. คลิกไอคอน Extension  
4. ตั้งค่า "จำนวนหน้าที่ต้องทำ", "Delay", หรือ Filter ตามต้องการ
5. กด **Start**  
   - Extension จะเลือกสินค้าในหน้า → รับลิงก์ → รอดาวน์โหลด → ไปหน้าถัดไปอัตโนมัติ
   - ครบ N หน้า จะรวมไฟล์ทั้งหมดเป็น `.csv` ไฟล์เดียว
6. กด **Export** เพื่อดาวน์โหลดไฟล์ผลลัพธ์
7. หากต้องการหยุดให้กด **Stop** (จะหยุดหลัง step ปัจจุบันจบ)

**ชื่อไฟล์ผลลัพธ์:**  
`shopee_offer_{shopBrandOfferId}_{YYYYMMDD}.csv`  
(UTF-8 with BOM รองรับภาษาไทยสำหรับ Excel)

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
- ลำดับ selector: `data-testid`/`aria-*` > role/name > DOM relative > innerText
- Fallback ไทย/อังกฤษ:
  - "เลือกผลิตภัณฑ์ทั้งหมด" / "Select all"
  - "รับลิงก์", "เอา ลิงก์" / "Get link"
  - "ถัดไป" / "Next"

---

## 🛡️ เงื่อนไขและข้อจำกัด

- ต้องล็อกอิน Shopee Affiliate ก่อนใช้งาน
- ไม่ bypass ความปลอดภัย/ยืนยันตัวตน
- ใช้ selector แบบ attribute-first เพื่อความเสถียร
- ผลลัพธ์รวม header เดียว, ต่าง header จะ union และเติมช่องว่าง
- รองรับ UI ไทยเป็นหลัก (มี fallback อังกฤษ)
- รองรับโหมด A (รวมไฟล์) เป็นหลัก โหมด B (ดัก payload) อยู่ในแผนพัฒนา
- เปิดให้ปรับ N, delay, filter, selectors override, resume state

---

## 🏁 Acceptance Criteria

- เริ่มจาก `/offer/brand_offer/{id}` กำหนด N=3 สำเร็จลูปทั้งหมด
- ได้ไฟล์รวมเดียว ตามชื่อที่กำหนด แถว = ผลรวมแถวไฟล์ย่อย
- ปุ่ม Stop หยุดหลังจบขั้นตอนที่กำลังรัน
- ทำงานได้ทั้งภาษาไทย/อังกฤษ โดย selector attribute-first

---

## 📌 หมายเหตุ

- หากไฟล์ที่ดาวน์โหลดไม่ใช่ .csv แต่เป็น .xlsx จะมีระบบแปลงและ merge อัตโนมัติ
- Debug/Log สามารถเปิดจาก popup UI เพื่อตรวจสอบกรณีผิดพลาด

---

## 🛠️ Contributors & License

- เขียนโค้ด ออกแบบและดูแลโดย <your_name>
- Pull Request และ Issue ยินดีต้อนรับ
- License: MIT

---

## 📞 ติดต่อสอบถามและรายงานปัญหา

- เปิด Issue ที่ GitHub Repo
- หรือ email: <your_email@example.com>
