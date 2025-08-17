# Shopee Brand Offer Extractor

Chrome Extension สำหรับดึงและรวมข้อมูลโปรโมชันแบรนด์จาก Shopee Affiliate อัตโนมัติ  
ใช้สถาปัตยกรรม **Clean Architecture** แยก UI และ Logic เพื่อความปลอดภัย

---

## 🎯 คุณสมบัติ

- **ดึงลิงก์อัตโนมัติ** จากหน้า `/offer/brand_offer/{shopBrandOfferId}`
- **วนลูปหลายหน้า** เลือกสินค้า → รับลิงก์ → ดาวน์โหลด → หน้าถัดไป
- **รวมไฟล์เป็นไฟล์เดียว** (CSV) พร้อม shopBrandOfferId, pageIndex, timestamp
- **ปลอดภัย** ไม่ bypass ระบบความปลอดภัย

---

## ⚙️ การติดตั้ง

1. **Clone โปรเจกต์**
git clone https://github.com/thepegasus56/Shopee-Brand-Offer-Extractor.git
