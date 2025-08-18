# บัญชีไฟล์ในแพ็คเกจ (Package Manifest) v1.0.0

เอกสารนี้ระบุรายการไฟล์ทั้งหมดในโปรเจกต์ **Shopee Brand Offer Extractor** สำหรับการเผยแพร่เวอร์ชัน 1.0.0

## โครงสร้างโฟลเดอร์ (Distribution Folder Structure)

เมื่อทำการแพ็คเกจเป็นไฟล์ ZIP สำหรับ Chrome Web Store หรือการติดตั้งแบบ manual โครงสร้างภายในควรประกอบด้วยไฟล์ที่จำเป็นเท่านั้น:

```
shopee-brand-offer-extractor-v1.0.0/
├── manifest.json
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── src/
    ├── api/
    │   ├── automation-api.js
    │   └── config-api.js
    ├── constants/
    │   └── config.json
    ├── core/
    │   ├── automation-engine.js
    │   ├── background.js
    │   └── content.js
    ├── ui/
    │   ├── popup.html
    │   ├── styles.css
    │   └── ui-manager.js
    └── utils/
        └── version.js
```

## รายการไฟล์ที่ต้องเผยแพร่ (Required for Distribution)

ไฟล์เหล่านี้เป็นส่วนสำคัญที่ทำให้ Extension ทำงานได้และต้องรวมอยู่ในไฟล์ ZIP

| ขนาด (Bytes) | SHA256 Checksum | ที่อยู่ไฟล์ |
| :--- | :--- | :--- |
| 1014 | `114f14...` | `./manifest.json` |
| 0 | `e3b0c4...` | `./icons/icon16.png` |
| 0 | `e3b0c4...` | `./icons/icon48.png` |
| 0 | `e3b0c4...` | `./icons/icon128.png` |
| 4433 | `cf5dc2...` | `./src/api/automation-api.js` |
| 6883 | `68946f...` | `./src/api/config-api.js` |
| 162 | `9a8f44...` | `./src/constants/config.json` |
| 6561 | `08b8de...` | `./src/core/automation-engine.js` |
| 5323 | `39b7ff...` | `./src/core/background.js` |
| 3445 | `67c50c...` | `./src/core/content.js` |
| 4111 | `8aa3e3...` | `./src/ui/popup.html` |
| 4577 | `7ab022...` | `./src/ui/styles.css` |
| 9997 | `f90010...` | `./src/ui/ui-manager.js` |
| 137 | `bb52da...` | `./src/utils/version.js` |

*(หมายเหตุ: Checksum ถูกตัดให้สั้นลงเพื่อความกระชับ)*

## รายการไฟล์ที่ไม่ต้องเผยแพร่ (Optional / Development Files)

ไฟล์เหล่านี้ใช้สำหรับการพัฒนา, การทำเอกสาร, และการทดสอบ ไม่จำเป็นต้องรวมอยู่ในแพ็คเกจสำหรับผู้ใช้งานทั่วไป

| ขนาด (Bytes) | SHA256 Checksum | ที่อยู่ไฟล์ |
| :--- | :--- | :--- |
| 1071 | `a14900...` | `./README.md` |
| 10324 | `c956cb...` | `./STRUCTURE.md` |
| 4547 | `5cfbab...` | `./PROGRESS.md` |
| 4824 | `8696f3...` | `./RELEASE.md` |
| 3097 | `3d819e...` | `./INSTALLATION.md` |
| 6205 | `d42605...` | `./USER_MANUAL.md` |
| 5664 | `dab5de...` | `./TROUBLESHOOTING.md` |
| 6076 | `e70b44...` | `./API_DOCUMENTATION.md` |

---
**ความสมบูรณ์ของข้อมูล (Data Integrity):** ควรใช้ Checksum เพื่อตรวจสอบว่าไฟล์ไม่ได้รับความเสียหายหรือถูกเปลี่ยนแปลงก่อนการเผยแพร่
