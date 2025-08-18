# คู่มือการติดตั้ง (Installation Guide)

เอกสารนี้อธิบายขั้นตอนการติดตั้ง Extension **Shopee Brand Offer Extractor** บน Google Chrome เพื่อใช้งานในโหมดนักพัฒนา (Developer Mode)

## ข้อกำหนดเบื้องต้น (Prerequisites)

-   **Google Chrome**: ต้องติดตั้งเบราว์เซอร์ Google Chrome เวอร์ชันล่าสุด
-   **Git**: ต้องติดตั้ง Git command line tool สำหรับการ clone repository

## ขั้นตอนการติดตั้ง

### 1. Clone Repository

เปิด Terminal หรือ Command Prompt แล้วใช้คำสั่ง `git` เพื่อ clone repository ของโปรเจกต์ลงในเครื่องคอมพิวเตอร์ของคุณ:

```bash
git clone https://github.com/thepegasus56/Shopee-Brand-Offer-Extractor.git
```

หลังจากคำสั่งทำงานเสร็จสิ้น คุณจะได้โฟลเดอร์ชื่อ `Shopee-Brand-Offer-Extractor` ที่มี source code ทั้งหมดของโปรเจกต์

### 2. โหลด Extension ใน Chrome

2.1. เปิด Google Chrome แล้วไปที่หน้าจัดการ Extension โดยพิมพ์ URL นี้ลงใน address bar:
`chrome://extensions`

2.2. เปิดใช้งาน **"โหมดนักพัฒนา" (Developer mode)** โดยการคลิกที่สวิตช์ทางด้านขวาบนของหน้า

![Developer Mode](https://developer.chrome.com/static/docs/extensions/mv3/getstarted/images/gs-dev-mode-on.png)

2.3. คลิกที่ปุ่ม **"โหลดส่วนขยายที่คลายซิป" (Load unpacked)** ที่ปรากฏขึ้นมาใหม่

![Load Unpacked](https://developer.chrome.com/static/docs/extensions/mv3/getstarted/images/gs-load-unpacked.png)

2.4. หน้าต่างเลือกโฟลเดอร์จะเปิดขึ้นมา ให้คุณเลือกไปยังโฟลเดอร์ `Shopee-Brand-Offer-Extractor` ที่คุณได้ clone ไว้ในขั้นตอนที่ 1 แล้วกด **"Select Folder"**

2.5. หากทุกอย่างถูกต้อง Extension จะปรากฏขึ้นบนหน้าจัดการส่วนขยาย และไอคอนของ Extension จะแสดงบน toolbar ของ Chrome

![Extension Loaded](https://developer.chrome.com/static/docs/extensions/mv3/getstarted/images/gs-hello-installed.png)


---
**การติดตั้งเสร็จสมบูรณ์!** ตอนนี้คุณพร้อมที่จะใช้งาน Shopee Brand Offer Extractor แล้ว
