# 📸 Firebase Image Upload & Drag Play (Node.js)

เว็บแอปพลิเคชัน Node.js สำหรับอัพโหลดและจัดการภาพด้วย Firebase Storage พร้อมฟีเจอร์ลากเล่น

## ✨ ฟีเจอร์

- 📤 **อัพโหลดภาพ**: ลากและวาง หรือคลิกเพื่อเลือกไฟล์
- 📸 **แกลลเรี่ย**: ดูภาพทั้งหมดที่อัพโหลดไว้
- 🎨 **พื้นที่ลาก**: ลากภาพจากแกลลเรี่ยมาดูแบบเต็มจอ
- 📥 **ดาวน์โหลด**: ดาวน์โหลดภาพจาก Firebase
- 🗑️ **ลบภาพ**: ลบภาพที่ไม่ต้องการ
- 📊 **แสดงความคืบหน้า**: แสดงเปอร์เซ็นต์การอัพโหลด

## 🚀 วิธีการติดตั้ง

### 1. สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com)
2. คลิก "Create Project" และตั้งชื่อโปรเจค
3. เปิด Storage และสร้าง bucket ใหม่

### 2. สร้าง Service Account Key

1. ไปที่ Project Settings → Service Accounts
2. คลิก "Generate New Private Key"
3. บันทึกไฟล์ `serviceAccountKey.json` ลงในโฟลเดอร์ root ของโปรเจค

### 3. ติดตั้ง Dependencies

```bash
npm install
```

### 4. ตั้งค่า Environment Variables

แก้ไข `.env`:

```
PORT=3000
NODE_ENV=development
```

### 5. เรียก Server

```bash
npm start
```

หรือใช้ nodemon สำหรับ development:

```bash
npm run dev
```

## 📁 โครงสร้างไฟล์

```
FB_Test/
├── server.js                    # Express server หลัก
├── package.json                 # Dependencies
├── .env                         # Environment variables
├── serviceAccountKey.json       # Firebase credentials
├── public/
│   ├── index.html              # HTML หลัก
│   ├── styles.css              # CSS สไตล์
│   └── app.js                  # Client-side JavaScript
└── README.md                    # เอกสารนี้
```

## 🎮 API Endpoints

### Upload Image
```
POST /api/upload
Content-Type: multipart/form-data

Body: { file: <image file> }
Response: { success: true, fileName, url, path }
```

### Get All Images
```
GET /api/images

Response: { success: true, count, images: [...] }
```

### Delete Image
```
DELETE /api/images/:fileName

Response: { success: true, message, fileName }
```

### Download Image
```
GET /api/download/:fileName

Response: <image file>
```

### Health Check
```
GET /api/health

Response: { status: "OK", message: "Server is running" }
```

## 🔧 เทคโนโลยี

- **Backend**: Node.js + Express
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Cloud Storage**: Firebase Storage
- **Authentication**: Firebase Admin SDK
- **File Upload**: Multer
- **CORS**: Express CORS middleware

## 📝 ตัวอย่างการใช้งาน

1. **เปิด Web App**
   - เข้าไปที่ `http://localhost:3000`

2. **อัพโหลดภาพ**
   - ลากไฟล์หรือคลิกเพื่อเลือก
   - ระบบจะส่งไปยัง `/api/upload`

3. **ดูแกลลเรี่ย**
   - ภาพจะโหลดจาก `/api/images`

4. **ลากเล่น**
   - ลากภาพจากแกลลเรี่ย
   - วางลงในพื้นที่ Canvas

5. **ดาวน์โหลด/ลบ**
   - คลิกภาพเพื่อเปิด modal
   - เลือก Download หรือ Delete

## ⚠️ ข้อสำคัญ

- ตรวจสอบว่า `serviceAccountKey.json` อยู่ในโฟลเดอร์ root
- ไม่ต้องการ Firebase Client SDK
- Server จะจัดการการเข้าถึง Firebase ทั้งหมด
- รองรับอัพโหลด files สูงสุด 10MB
- ใช้ Signed URLs ที่มีอายุ 15 วัน

## 🐛 Troubleshooting

**Port already in use**
```bash
# เปลี่ยน PORT ใน .env
PORT=3001
```

**Firebase credentials error**
- ตรวจสอบว่า `serviceAccountKey.json` ถูกต้อง
- ตรวจสอบ permissions ของ Firebase Storage

**CORS error**
- CORS ถูก enable โดยค่าเริ่มต้น
- ถ้ามีปัญหา ให้ปรับ CORS options ใน `server.js`

## 📚 ข้อมูลเพิ่มเติม

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/database/admin/start)
- [Express.js Documentation](https://expressjs.com/)
- [Multer Documentation](https://github.com/expressjs/multer)

---

สร้างโดย: AI Assistant
ปี: 2025
