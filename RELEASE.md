# Release Notes: Shopee Brand Offer Extractor v1.0.0

**วันที่เผยแพร่ (Release Date):** 18/08/2025

ขอต้อนรับสู่การเปิดตัวครั้งแรกของ **Shopee Brand Offer Extractor**! นี่คือเวอร์ชัน 1.0.0 ที่มาพร้อมกับฟังก์ชันการทำงานหลักที่ครบถ้วนตามที่ออกแบบไว้

## ✨ คุณสมบัติหลัก (Key Features)

-   **Clean Architecture**: พัฒนาบนสถาปัตยกรรมที่แบ่งแยกหน้าที่ชัดเจนระหว่าง UI, API, และ Core Logic เพื่อความเสถียรและง่ายต่อการบำรุงรักษา
-   **UI ทันสมัย**: หน้าจอผู้ใช้ (Popup) ที่สวยงามใช้งานง่ายด้วยดีไซน์แบบ Glass-morphism
-   **ระบบอัตโนมัติ**:
    -   วนลูปการทำงานข้ามหน้า (1-N pages) ตามที่ผู้ใช้กำหนด
    -   จำลองการทำงานของ DOM interaction เช่น การเลือกสินค้าทั้งหมด, การกดรับลิงก์, และการไปหน้าถัดไป
-   **การจัดการการตั้งค่า**:
    -   บันทึกการตั้งค่า (Pages, Delay) ของผู้ใช้ระหว่าง Sessions
    -   ฟังก์ชัน Import/Export การตั้งค่าเป็นไฟล์ JSON
-   **การส่งออกข้อมูล**:
    -   รวบรวมข้อมูลจากทุกหน้าที่ประมวลผล
    -   ส่งออกข้อมูลทั้งหมดเป็นไฟล์ `.csv` ที่รองรับภาษาไทยในโปรแกรม Excel
-   **การตรวจสอบข้อมูล**: ระบบ Real-time validation บน UI เพื่อป้องกันการใส่ข้อมูลที่ผิดพลาด

## 🚀 คู่มือเริ่มใช้งานฉบับย่อ (Quick Start Guide)

1.  ติดตั้ง Extension ตามคู่มือใน `INSTALLATION.md`
2.  ไปที่หน้า Shopee Affiliate Brand Offer ที่ต้องการ
3.  เปิด Extension, ตรวจสอบ Offer ID, ตั้งค่าจำนวนหน้าและ Delay
4.  กด **Start** และรอจนกระบวนการเสร็จสิ้น
5.  กด **Export CSV** เพื่อดาวน์โหลดข้อมูล

## ⚠️ ปัญหาที่ทราบและข้อจำกัด (Known Issues & Limitations)

-   **Selector-dependent**: Extension อาศัย DOM selectors ของหน้าเว็บ Shopee Affiliate ในการทำงาน หาก Shopee มีการอัปเดตโครงสร้างหน้าเว็บ อาจทำให้ Extension หยุดทำงานได้ และต้องมีการอัปเดต selectors ใน `src/core/content.js`
-   **No Real-time Data Scraping**: ในเวอร์ชันนี้ `AutomationEngine` ยังใช้ข้อมูลจำลอง (mock data) ในการส่งกลับมาเพื่อทดสอบระบบ data pipeline และ CSV export ฟังก์ชันการดึงข้อมูลลิงก์จริงๆ จากหน้าเว็บยังไม่ได้ถูกนำมาใช้
-   **Single Tab Operation**: การทำงานถูกออกแบบมาให้ทำงานทีละ Tab เท่านั้น ไม่รองรับการทำงานพร้อมกันหลาย Tab

## 📋 บันทึกการเปลี่ยนแปลง (Changelog)

-   **v1.0.0 (18/08/2025)**:
    -   **feat**: Initial release of all core features.
    -   **feat**: Implemented UI, API, and Core Logic layers based on Clean Architecture.
    -   **feat**: Added automation workflow, settings management, and CSV export.
    -   **docs**: Created comprehensive documentation for installation, usage, and development.

## 💻 ความต้องการของระบบ (System Requirements)

-   **Browser**: Google Chrome version 100 or newer.
-   **Operating System**: Windows, macOS, Linux (any OS that can run Google Chrome).
