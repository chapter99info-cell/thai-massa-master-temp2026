# Chapter99 — SOP: เปิดร้านใหม่จาก Template (New Shop Onboarding)

**ผู้รับผิดชอบ:** Staff 2 (Tech Admin)
**เวลาที่ใช้โดยประมาณ:** 30–45 นาที ต่อร้าน
**หลักการ:** Template โค้ดชุดเดียวกันทุกร้าน ห้ามแก้ logic/โครงสร้างโค้ด — งานทั้งหมดคือ "เปลี่ยนค่า config" 2 ไฟล์ + ตั้งค่า Firebase project ใหม่เท่านั้น

---

## ภาพรวม: ทำไมต้องทำแบบนี้

- ทุกร้านใช้โค้ด template เดียวกัน (repo เดียวกัน) เพื่อไม่ให้ทีมหลังบ้านคอขวด (ตามกฎ "Strictly No Customization")
- แต่ **ข้อมูลของแต่ละร้านต้องแยกฐานข้อมูลกันเด็ดขาด** (ลูกค้า, บิล, แต้มสะสม) — ทำได้โดยให้แต่ละร้านมี **Firebase Project เป็นของตัวเอง**
- ทุกโปรเจกต์ Firebase ใหม่สร้างได้ฟรี ภายใต้อีเมลเดียวกัน (chapter99info@gmail.com) ไม่ต้องสมัครอีเมลใหม่

---

## ขั้นตอนที่ 1: สร้าง Firebase Project ใหม่

1. เข้า [console.firebase.google.com](https://console.firebase.google.com) (ล็อกอินด้วย chapter99info@gmail.com)
2. กด **Add project** → ตั้งชื่อโปรเจกต์ตามร้าน เช่น `chapter99-lotus-thai-spa`
3. ปิด Google Analytics ได้ (ไม่จำเป็นสำหรับ MVP) → กด Create project

## ขั้นตอนที่ 2: เปิด Authentication

1. เมนูซ้าย → **Build → Authentication** → กด Get started
2. แท็บ **Sign-in method** → เลือก **Google** → เปิดสวิตช์ Enable → เลือกอีเมลสนับสนุน → Save
3. (ทางเลือก) เปิด **Email link (passwordless)** ด้วยถ้าต้องการรองรับลูกค้าที่ไม่มี Google account

## ขั้นตอนที่ 3: สร้าง Firestore Database

1. เมนูซ้าย → **Build → Firestore Database** → Create database
2. เลือก location: `australia-southeast1` (Sydney) เพื่อความเร็วสำหรับลูกค้าออสเตรเลีย
3. เริ่มที่ **Production mode** (rules จะ deploy ทับในขั้นตอนที่ 5)

## ขั้นตอนที่ 4: ลงทะเบียนเว็บแอป (Web App) เพื่อเอาค่า Config

1. หน้า Project Overview → กดไอคอน **</>** (Add app → Web)
2. ตั้ง nickname เช่น `web-pwa`
3. Firebase จะโชว์ config object ให้ — **เก็บค่าพวกนี้ไว้** (ใช้ในขั้นตอนที่ 6):
   - `projectId`
   - `appId`
   - `apiKey`
   - `authDomain`
   - `storageBucket`
   - `messagingSenderId`
4. หา **Firestore Database ID** ได้จากหน้า Firestore Database (มุมบนของหน้า จะมีชื่อ database เช่น `(default)` หรือ id ที่ตั้งเอง)

## ขั้นตอนที่ 5: Deploy Firestore Rules + Cloud Functions

ไฟล์ `firestore.rules` และโฟลเดอร์ `functions/` (ระบบให้แต้มสะสมตอนปิดบิล) เหมือนกันทุกร้าน **ไม่ต้องแก้** — แค่ deploy ไปที่โปรเจกต์ใหม่:

```bash
firebase use <ชื่อ-project-id-ใหม่>
firebase deploy --only firestore:rules,functions
```

(ถ้ายังไม่เคยติดตั้ง Firebase CLI: `npm install -g firebase-tools` แล้ว `firebase login` ก่อนครั้งแรก)

⚠️ Cloud Functions ต้องการแผน **Blaze (Pay as you go)** ของโปรเจกต์นั้น (ร้านนี้เปิดอยู่แล้ว) — ถ้าโปรเจกต์ใหม่ยังเป็น Spark (free) ต้องอัปเกรดเป็น Blaze ก่อน ถึงจะ deploy functions ได้ (ค่าใช้จ่ายจริงจะเกิดขึ้นก็ต่อเมื่อใช้เกิน free tier ต่อเดือนซึ่งร้านขนาดนี้แทบไม่มีทางถึง)

## ขั้นตอนที่ 6: สลับไฟล์ Config 2 ไฟล์

นี่คือ**ขั้นตอนหลัก**ที่ทำให้ template กลายเป็นร้านใหม่ — แก้แค่ 2 ไฟล์ ไม่แตะโค้ดอื่นเลย:

### ไฟล์ 1: `firebase-applet-config.json` (ค่าที่ได้จากขั้นตอนที่ 4)

```json
{
  "projectId": "<PROJECT_ID_ใหม่>",
  "appId": "<APP_ID_ใหม่>",
  "apiKey": "<API_KEY_ใหม่>",
  "authDomain": "<AUTH_DOMAIN_ใหม่>",
  "firestoreDatabaseId": "<FIRESTORE_DATABASE_ID_ใหม่>",
  "storageBucket": "<STORAGE_BUCKET_ใหม่>",
  "messagingSenderId": "<MESSAGING_SENDER_ID_ใหม่>",
  "measurementId": ""
}
```

### ไฟล์ 2: `src/config/clientConfig.ts` (ข้อมูลแบรนด์ของร้านใหม่)

```ts
import firebaseConfig from '../../firebase-applet-config.json';

export const CLIENT_CONFIG = {
  shopName: "<ชื่อร้านใหม่>",
  googleSheetId: "<Google Sheet ID สำหรับร้านนี้ ถ้ามี>",
  reviewLink: "<ลิงก์รีวิว Google ของร้านนี้>",
  themeColor: "<สีธีมหลัก เช่น #B8962E>",
  backgroundColor: "<สีพื้นหลัง เช่น #0F172A>",
  aiPersona: "<โทนเสียง AI เช่น Aussie Friendly, Professional, Warm>",
  abn: '<ABN ร้านใหม่>',
  address: '<ที่อยู่ร้านใหม่>',
  phone: '<เบอร์โทรร้านใหม่>',
  firebase: firebaseConfig
};
```

### ไฟล์เสริม (ถ้ามี): `.env`

```
GEMINI_API_KEY="<ใช้ key เดิมของ Chapter99 ได้ ไม่ต้องสร้างใหม่ต่อร้าน>"
APP_URL="<โดเมนของร้านใหม่ เช่น https://www.lotusthaispaAU.com.au>"
```

## ขั้นตอนที่ 7: ตั้งค่า PIN เริ่มต้นของร้าน

เข้าไฟล์ `src/config.ts` → แก้ค่าเริ่มต้นใน `DEFAULT_SETTINGS`:

```ts
ownerPin: '<PIN เจ้าของร้านใหม่>',
staffPin: '<PIN พนักงาน>',
managerPin: '<PIN ผู้จัดการ>',
masterPin: '3501', // เก็บไว้เหมือนเดิมทุกร้าน (สำหรับทีม Chapter99 เข้า super-admin)
```

## ขั้นตอนที่ 8: Deploy ขึ้น Vercel

1. สร้าง Vercel Project ใหม่ (import จาก repo template หรือ duplicate โปรเจกต์เดิม)
2. ผูกโดเมนใหม่ของร้าน (Domains → Add)
3. Deploy → เปิดเว็บทดสอบ

## ขั้นตอนที่ 9: ทดสอบก่อนส่งมอบร้าน (Checklist)

- [ ] เข้าหน้าเว็บหลัก โหลดได้ปกติ ไม่มี error หน้าขาว
- [ ] ทดสอบ PIN staff / manager / owner แต่ละระดับเข้าหน้า dashboard ที่ถูกต้อง
- [ ] ทดสอบลูกค้า Sign in ด้วย Google ที่หน้า `/profile` ได้จริง
- [ ] เช็กใน Firebase Console → Authentication → Users มีรายชื่อขึ้นหลังทดสอบ sign-in
- [ ] เช็กชื่อร้าน/สี/เบอร์โทร/ที่อยู่ ตรงกับร้านจริง

---

## Prompt สำหรับสั่ง Cursor / Claude Code (Copy ไปใช้ได้เลย)

เมื่อได้ค่า config จาก Firebase Console ครบแล้ว ใช้ prompt นี้สั่งให้ Cursor ทำสลับไฟล์ให้อัตโนมัติ (แก้ค่าใน `< >` ให้ตรงร้านจริงก่อนส่ง):

```
Context: This is the Chapter99 Thai massage PWA template repo. I'm onboarding a new client shop and need to swap the per-shop config to point at their own Firebase project, without touching any other logic.

Task:
1. Overwrite firebase-applet-config.json with this exact content:
{
  "projectId": "<PROJECT_ID>",
  "appId": "<APP_ID>",
  "apiKey": "<API_KEY>",
  "authDomain": "<AUTH_DOMAIN>",
  "firestoreDatabaseId": "<FIRESTORE_DATABASE_ID>",
  "storageBucket": "<STORAGE_BUCKET>",
  "messagingSenderId": "<MESSAGING_SENDER_ID>",
  "measurementId": ""
}

2. In src/config/clientConfig.ts, update only the CLIENT_CONFIG values (shopName, reviewLink, themeColor, backgroundColor, aiPersona, abn, address, phone) to:
- shopName: "<NEW_SHOP_NAME>"
- reviewLink: "<GOOGLE_REVIEW_LINK>"
- themeColor: "<HEX_COLOR>"
- backgroundColor: "<HEX_COLOR>"
- aiPersona: "<TONE_OF_VOICE>"
- abn: "<ABN>"
- address: "<ADDRESS>"
- phone: "<PHONE>"
Keep the `firebase: firebaseConfig` import line unchanged.

3. In src/config.ts, update DEFAULT_SETTINGS.ownerPin, staffPin, managerPin to the new shop's PINs (leave masterPin as '3501').

4. Run `npm run build` afterward and report any errors.

Do not modify any other file, component, or business logic.
```

---

## หมายเหตุสำคัญ (อัปเดตล่าสุด)

- ระบบจอง/POS (`BookingContext`), ระบบล็อกอินลูกค้า (`AuthContext`), และแต้มสะสม (`loyalty.ts` + Cloud Function `awardPointsForPayment`) เชื่อมเสร็จครบวงจรแล้ว — ลูกค้าจองผ่านเว็บ พนักงานเห็นเตียง/คิวแบบ realtime ปิดบิลแล้วลูกค้าได้แต้มอัตโนมัติ
- **ข้อจำกัดด้านความปลอดภัยที่ยังไม่ได้แก้:** พนักงานล็อกอินด้วย PIN ในเครื่อง ไม่ได้ผูกกับ Firebase Auth จริง ทำให้ Firestore rules ของ `bookings`/`beds` ตรวจได้แค่ "รูปแบบข้อมูล" ไม่ใช่ "ใครเป็นคนเขียน" — เทียบเท่าเปิดสาธารณะในทางเทคนิค แนวทางแก้ในอนาคต: เปิด Firebase App Check และ/หรือให้พนักงานมีบัญชี Firebase จริง
- โค้ดแลกแต้มที่ลูกค้ากดในหน้า Profile ตอนนี้พนักงานยัง "ยืนยันว่าใช้แล้ว" ในระบบไม่ได้ (ต้อง isAdmin เท่านั้น) เพราะเหตุผลเดียวกัน
