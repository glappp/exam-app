# คู่มือ Import ข้อสอบ — SchoolPL

## ขั้นตอนภาพรวม

```
① สร้าง ExamSetMetadata  →  ② Import Question[]  →  ③ ตรวจสอบ
```

---

## ① ExamSetMetadata — ชุดข้อสอบ

ทุกชุดข้อสอบต้องมี record นี้ก่อน เพื่อให้หน้า exam.html แสดง dropdown สนาม/ปี ได้ถูกต้อง

### ไฟล์: `server/import_examset.json`

```json
{
  "grade":          "p6",
  "subject":        "math",
  "year":           "2566",
  "label":          "สสวท ป.6 ปี 2566 (สอบคัดเลือกรอบที่ 1)",
  "venueName":      "สสวท",
  "questionSource": "ipst-p6-2566",
  "timeLimitSec":   5400,
  "isOfficial":     true,
  "isActive":       true,
  "blueprint":      [],
  "createdBy":      "admin"
}
```

### อธิบาย field

| Field | ค่าที่ใส่ | หมายเหตุ |
|-------|----------|---------|
| `grade` | `"p4"` `"p5"` `"p6"` `"m1"` `"m2"` `"m3"` | ระดับชั้น |
| `subject` | `"math"` `"science"` `"thai"` `"english"` | วิชา |
| `year` | `"2566"` | ปี พ.ศ. |
| `label` | ชื่อเต็ม เช่น `"สสวท ป.6 ปี 2566 (รอบ 1)"` | เก็บไว้อ้างอิง ไม่ได้แสดงผล |
| `venueName` | `"สสวท"` | ชื่อสนามสั้น **แสดงใน dropdown** |
| `questionSource` | `"ipst-p6-2566"` | รูปแบบ `{venue}-{grade}-{year}` **ต้องตรงกับ `source` ของ Question** |
| `timeLimitSec` | `5400` | เวลาทำข้อสอบเป็นวินาที (5400 = 90 นาที) |
| `isOfficial` | `true` | `true` = ข้อสอบจริง / `false` = ฝึกสอบ |
| `blueprint` | `[]` | ใส่ `[]` ได้ก่อน |

### venue key ที่ใช้อยู่

| venueName | questionSource prefix | ตัวอย่าง source |
|-----------|----------------------|----------------|
| สสวท | `ipst` | `ipst-p6-2566` |
| จุฬาภรณ์ | `chulabhorn` | `chulabhorn-p6-2565` |

> **สำคัญ**: `questionSource` ต้องตรงกับ `source` ในข้อสอบ — ระบบกรองด้วย `startsWith`
> เช่น source `"ipst-p6-2566"` จะดึงข้อที่ `source = "ipst-p6-2566"` มาแสดง

### รัน import

```bash
cd server
node import-ExamSetMetadata.js
```

---

## ② Question — ข้อสอบ

### ไฟล์: `server/sample_questions.json` (array)

```json
[
  {
    "code":        "p6-ipst-2566-o-q001",
    "source":      "ipst-p6-2566",
    "type":        "mc",
    "textTh":      "โจทย์ภาษาไทย...",
    "textEn":      "โจทย์ภาษาอังกฤษ...",
    "choices": [
      { "textTh": "ก. ...", "textEn": "A. ..." },
      { "textTh": "ข. ...", "textEn": "B. ..." },
      { "textTh": "ค. ...", "textEn": "C. ..." },
      { "textTh": "ง. ...", "textEn": "D. ..." }
    ],
    "answer": "b",
    "attributes": {
      "examGrade":        "p6",
      "topic":            ["topic:fractions"],
      "subtopic":         ["subtopic:fractions-multiply"],
      "skill":            ["skill:multi-step"],
      "trap":             ["trap:wrong-unit"],
      "difficulty":       2,
      "estimatedTimeSec": 90,
      "questionNo":       "001",
      "year":             "2566"
    },
    "ownerOrg":  "ipst",
    "createdBy": "admin"
  }
]
```

### อธิบาย field สำคัญ

#### `code` — รหัสข้อ (unique)
รูปแบบ: `{grade}-{venue}-{year}-{type}-q{NNN}`

```
p6-ipst-2566-o-q001
│   │    │    │  └── เลขข้อ 3 หลัก
│   │    │    └───── o=official, p=practice, v=variant
│   │    └────────── ปี
│   └─────────────── venue key
└─────────────────── ระดับชั้น
```

#### `source` — ต้องตรงกับ `questionSource` ใน ExamSetMetadata
```
"source": "ipst-p6-2566"   ← ตรงกับ questionSource ใน ExamSetMetadata
```

#### `type` และ `answer`

| type | ความหมาย | answer | shortAnswer |
|------|----------|--------|-------------|
| `"mc"` | ปรนัย 4 ตัวเลือก | `"a"` / `"b"` / `"c"` / `"d"` | `null` |
| `"short_answer"` | อัตนัย/กรอกตัวเลข | `null` | `["42", "42.0"]` |

> **mc**: choices index 0 = a, 1 = b, 2 = c, 3 = d

#### `choices` — ตัวเลือก (mc เท่านั้น)
```json
[
  { "textTh": "ก. 24", "textEn": "A. 24" },
  { "textTh": "ข. 36", "textEn": "B. 36" },
  { "textTh": "ค. 48", "textEn": "C. 48" },
  { "textTh": "ง. 60", "textEn": "D. 60" }
]
```
- ต้องมีครบ 4 ตัวเลือก
- short_answer ใส่ `[]` ได้เลย

#### `attributes` — ข้อมูลจัดหมวดหมู่

```json
{
  "examGrade":        "p6",
  "topic":            ["topic:fractions"],
  "subtopic":         ["subtopic:fractions-multiply"],
  "skill":            ["skill:multi-step"],
  "trap":             [],
  "difficulty":       2,
  "estimatedTimeSec": 90,
  "questionNo":       "001",
  "year":             "2566"
}
```

| Field | ค่า | หมายเหตุ |
|-------|-----|---------|
| `examGrade` | `"p6"` | **จำเป็น** — ใช้กรองข้อสอบตามชั้น |
| `topic` | `["topic:fractions"]` | หัวข้อหลัก (array) |
| `subtopic` | `["subtopic:fractions-multiply"]` | หัวข้อย่อย (array) |
| `skill` | `["skill:multi-step"]` | ทักษะที่ใช้ (array) |
| `trap` | `["trap:wrong-unit"]` | กับดักที่มี (array) ใส่ `[]` ได้ |
| `difficulty` | `1` `2` `3` | 1=ง่าย 2=กลาง 3=ยาก |
| `estimatedTimeSec` | `90` | เวลาประมาณเป็นวินาที |
| `questionNo` | `"001"` | เลขข้อในชุดข้อสอบ (string 3 หลัก) |
| `year` | `"2566"` | ปีที่ออกข้อสอบ |

### รัน import

```bash
cd server
node import-questions.js
```

---

## ③ ตรวจสอบ

```bash
# นับข้อสอบตาม source
node -e "
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
p.question.groupBy({by:['source'],_count:true})
  .then(r=>console.table(r))
  .finally(()=>p.\$disconnect())
"
```

---

## ข้อผิดพลาดที่พบบ่อย

| ปัญหา | สาเหตุ | แก้ |
|-------|--------|-----|
| ข้อสอบไม่ขึ้นใน dropdown | `questionSource` ใน ExamSetMetadata ไม่ตรงกับ `source` ของ Question | ให้ตรงกันทุกตัวอักษร |
| สนามสอบไม่ขึ้น | ไม่มี ExamSetMetadata หรือ `isActive: false` | สร้าง ExamSetMetadata ก่อน |
| สุ่มข้อไม่ตรงชั้น | `attributes.examGrade` ผิด | เช็กว่าตรงกับ `grade` ใน ExamSetMetadata |
| import ซ้ำ | `code` ซ้ำ — Prisma จะ throw unique constraint | เปลี่ยน code หรือใช้ upsert |
| choices ไม่ครบ 4 | ข้อ mc ต้องมี 4 ตัวเลือกเสมอ | เพิ่มตัวเลือกให้ครบ |
