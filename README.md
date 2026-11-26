# ช่างพูด (Chang Phut) — ระบบตรวจการอ่านออกเสียงภาษาไทยด้วย AI ---![Status](https://img.shields.io/badge/Status-Functional_Prototype-F59E0B?style=for-the-badge)

> ระบบที่ฟังเด็ก ป.1–3 อ่านออกเสียงแทนครู แล้วบอกว่าเด็กคนไหนอ่านคำไหนผิด อ่านช้าหรือเร็วเกินไป
> ทีม **Teach Me IF You Can** · Jump Thailand Hackathon 2026

## ทำไมต้องมีระบบนี้

- **ครูไม่มีเวลาฟังทีละคน** ครู 1 คนดูแลนักเรียนประมาณ 30 คน ใช้เวลาฟังเด็กอ่านเฉลี่ย ~10 นาทีต่อคน จนแทบไม่เหลือเวลาเตรียมการสอน
- **ไม่รู้ว่าเด็กผิดตรงไหน** ครูรู้ว่าเด็กคนไหนอ่านไม่คล่อง แต่ไม่มีข้อมูลรายคำว่าเด็กอ่านผิดคำไหนหรือข้ามคำไหน
- **ยิ่งรู้ช้ายิ่งแก้ยาก** เด็กที่พื้นฐานการอ่านไม่แน่นจะมีปัญหาการเรียนในชั้นที่สูงขึ้น

ช่างพูดจึงให้เด็กอัดเสียงอ่านบทความที่ครูเตรียมไว้ ระบบส่งเสียงไปแปลงเป็นข้อความด้วย **Typhoon ASR** เทียบกับบทความต้นฉบับทีละคำ แล้วบันทึกผลเป็นข้อมูลรายคน รายครั้ง และรายคำ ให้ครูนำไปใช้ต่อได้



https://github.com/user-attachments/assets/8e98cced-ff6f-4950-bcbf-d36fd657c501

## Backend
<img width="1568" height="528" alt="image" src="https://github.com/user-attachments/assets/2cfd99db-c1b6-44d9-a4be-b36f81801f2d" />

| ตาราง | หน้าที่ |
|---|---|
| `user`, `session`, `account`, `verification` | ตารางของ Better Auth โดยเพิ่ม `role` ไว้แยกครูกับนักเรียน |
| `classrooms` | ห้องเรียนของครู แต่ละห้องมี `join_code` (6 ตัวอักษร ตัด 0/O, 1/I ที่สับสนง่ายออก) |
| `classroom_students` | ตารางเชื่อม M:N ระหว่างนักเรียนกับห้อง ใช้ composite PK `(classroom_id, student_id)` |
| `assignments` | บทความที่ครูให้อ่าน พร้อมเกณฑ์ (`min_wpm`, `max_wpm`, `max_allowed_errors`) และเสียงเฉลยของครู |
| `attempts` | การอ่าน 1 ครั้งของนักเรียน 1 คน ซึ่งอ่านซ้ำได้ (`attempt_no`) เก็บ transcript, WPM และผลประเมิน |
| `word_errors` | คำที่อ่านผิดใน attempt นั้น ระบุตำแหน่งคำ (`word_index`) คำที่ควรอ่าน และคำที่ AI ได้ยิน |
## โครงสร้าง Repository

```
.
├── Backend/my-app/      # REST API (Bun + Elysia)
│   ├── src/
│   │   ├── index.ts             # entry point, CORS, listen
│   │   ├── db/
│   │   │   ├── index.ts         # Drizzle + postgres-js client
│   │   │   └── schema/          # auth / classroom / assignment / attempt
│   │   ├── lib/
│   │   │   ├── auth.ts          # Better Auth (email+password, role)
│   │   │   ├── typhoon-asr.ts   # เรียก Typhoon ASR + แปลงเสียงด้วย ffmpeg
│   │   │   ├── thai-tokenizer.ts# ตัดคำไทยด้วย Intl.Segmenter
│   │   │   ├── word-alignment.ts# เทียบบทความ vs transcript (edit distance)
│   │   │   ├── scoring.ts       # WPM, speed flag, ผ่าน/ไม่ผ่าน
│   │   │   └── supabase-storage.ts # อัปโหลดไฟล์เสียง
│   │   ├── middleware/auth.middleware.ts
│   │   └── routes/{public,teacher,student}/
│   ├── drizzle/              # migration SQL
│   └── bruno/                # API collection สำหรับทดสอบ
└── Frontend/my-app/      # Next.js (โหมดครู / โหมดนักเรียน)
```

### ทำไมออกแบบแบบนี้ 
ระบบนี้ยังอยู่ในระดับ Prototype จึงออกแบบให้เรียบง่ายและเห็นผลลัพธ์ได้เร็วที่สุด เก็บเฉพาะข้อมูลที่จำเป็นต่อการประเมินการอ่าน แต่ยังวางโครงสร้างไว้ให้ต่อยอดได้ในอนาคต 

## Frontend

เว็บแอป Next.js ที่แยกเป็น 2 โหมดตาม role
- **นักเรียน**: ออกแบบให้ใช้บนมือถือ ปัดดูบทความแบบ feed แล้วกดอัดเสียงอ่านได้ทันที
- **ครู**: ออกแบบเป็น dashboard บนจอคอม

### Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4, `clsx` + `tailwind-merge` |
| Auth | Better Auth client (cookie session ร่วมกับ backend) |
| UI | `lucide-react` (icon), `swiper` (feed แบบปัดขึ้น-ลง) |
| อัดเสียง | Web `MediaRecorder` API |
| ตัดคำไทย | `Intl.Segmenter("th")` ตัวเดียวกับ backend |

### โครงสร้างหน้า

```
app/
├── (login)/page.tsx              # หน้า login เลือกเข้าเป็นครู / นักเรียน
├── student/
│   ├── page.tsx                  # คลังอ่าน (feed โจทย์ที่ยังไม่ได้อ่าน)
│   ├── myWrok/page.tsx           # งานของฉัน (ประวัติการอ่านทุกครั้ง)
│   └── (layout)/
│       ├── Studenthomefeed.tsx   # feed แบบ Swiper ดึงห้อง → โจทย์ pending
│       ├── Readingview.tsx       # หน้าอ่าน + อัดเสียง + ส่งตรวจ
│       ├── transcript-highlight.tsx # ไฮไลต์คำถูก/ผิด/ข้ามบนบทความ
│       ├── topBar.tsx
│       └── footer.tsx            # bottom nav
└── teacher/
    ├── page.tsx                  # หน้าหลัก (สรุปจำนวนห้อง/นักเรียน/การบ้าน)
    ├── classes/page.tsx          # จัดการห้องเรียน + คัดลอก join code
    ├── work/page.tsx             # การบ้าน/โจทย์แต่ละห้อง
    ├── students/page.tsx         # รายชื่อนักเรียน + Feedback การอ่าน (AI)
    └── (components)/Sidebar.tsx
```
 ส่วน | สถานะ |
|---|---|
| Login (บัญชี demo ครู/นักเรียน) | ✅ เชื่อม Better Auth จริง |
| โหมดนักเรียน: feed, อ่าน, ส่งตรวจ, ไฮไลต์คำผิด, งานของฉัน | ✅ เชื่อม API จริง |
| โหมดครู: หน้าหลัก, ห้องเรียน, การบ้าน, นักเรียน | 🎨 UI เสร็จแล้ว ตอนนี้ใช้ mock data ยังไม่ได้ต่อ API |
| หน้าโปรไฟล์นักเรียน | ⏳ มีเมนูแล้ว แต่ยังไม่ได้ทำหน้า | 

<img width="858" height="608" alt="image" src="https://github.com/user-attachments/assets/f190f981-8301-42c9-aeda-fdb37f3d316b" />



