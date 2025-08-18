#!/bin/bash

# ==============================================================================
# Build Script for Shopee Brand Offer Extractor
# ------------------------------------------------------------------------------
# สคริปต์นี้ใช้สำหรับสร้างแพ็คเกจ .zip ของ Extension สำหรับนำไปเผยแพร่
# โดยจะคัดลอกเฉพาะไฟล์ที่จำเป็นและบีบอัดเป็นไฟล์เดียว
#
# วิธีใช้ (Usage):
# 1. ทำให้สคริปต์ executable: chmod +x build.sh
# 2. รันสคริปต์: ./build.sh
# ==============================================================================

# --- Configuration ---
# การตั้งค่าตัวแปรต่างๆ
BUILD_DIR="build"
# ดึงเวอร์ชันจาก manifest.json มาใช้เป็นชื่อไฟล์ (ใช้ jq เพื่อความแน่นอน)
# Fallback ไปใช้ grep/sed ถ้าไม่มี jq
if command -v jq &> /dev/null
then
    VERSION=$(jq -r '.version' manifest.json)
else
    VERSION=$(grep '"version":' manifest.json | sed 's/.*"version": "\(.*\)",/\1/')
fi

ZIP_FILE="shopee-brand-offer-extractor-v${VERSION}.zip"

# --- Main Logic ---
# ส่วนการทำงานหลักของสคริปต์

# 1. Clean up
# ลบไฟล์เก่าที่เคยสร้างไว้ (ถ้ามี)
echo "🗑️  กำลังล้างข้อมูลเก่า..."
rm -rf "$BUILD_DIR"
rm -f "$ZIP_FILE"
echo "✅  ล้างข้อมูลสำเร็จ"

# 2. Create build directory
# สร้างโฟลเดอร์สำหรับพักไฟล์
echo "🏗️  กำลังสร้างโฟลเดอร์ build..."
mkdir -p "$BUILD_DIR/src"
mkdir -p "$BUILD_DIR/icons"
echo "✅  สร้างโฟลเดอร์สำเร็จ"


# 3. Copy necessary files
# คัดลอกไฟล์ที่จำเป็นสำหรับการเผยแพร่
echo "📦  กำลังคัดลอกไฟล์ที่จำเป็น..."
cp manifest.json "$BUILD_DIR/"
cp -r src/* "$BUILD_DIR/src/"
cp -r icons/* "$BUILD_DIR/icons/"
echo "✅  คัดลอกไฟล์สำเร็จ"

# 4. Create ZIP file
# สร้างไฟล์ ZIP จากโฟลเดอร์ build
echo "🤐  กำลังสร้างไฟล์ ZIP..."
# เข้าไปในโฟลเดอร์ build แล้ว zip เพื่อไม่ให้มี parent directory ในไฟล์ zip
(cd "$BUILD_DIR" && zip -rq "../$ZIP_FILE" .)
echo "✅  สร้างไฟล์ $ZIP_FILE สำเร็จ!"

# 5. Final cleanup
# ลบโฟลเดอร์ build ที่ไม่ต้องการแล้ว
echo "🧹  กำลังลบโฟลเดอร์ชั่วคราว..."
rm -rf "$BUILD_DIR"
echo "🎉  เสร็จสิ้น! แพ็คเกจของคุณพร้อมแล้วที่ $ZIP_FILE"
