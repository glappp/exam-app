# prd.md — exam-app Product Requirements

> แผนงานและ requirements ของ feature ที่กำลังพัฒนาหรือรอพัฒนา
> อัปเดตล่าสุด: 2026-04-12

---

## Question Bank Status ✅

| Grade | ข้อ | Subtopics | สถานะ |
|-------|-----|-----------|-------|
| P4 | 677 | 34 subtopics | ✅ พร้อมใช้ |
| P5 | 280 | 14 subtopics | ✅ พร้อมใช้ |
| P6 | 300 | 15 subtopics | ✅ พร้อมใช้ |
| **รวม** | **1,257** | **63 subtopics** | |

- subtopic ละ 20 ข้อ ทุก grade ทุก topic
- `examGrade` เป็น string `'p4'`/`'p5'`/`'p6'` สม่ำเสมอทุกข้อ
- ยังไม่มีข้อสอบระดับ P1/P2/P3/P7+ (ม.1–ม.3)

---

## 4 โหมดหลัก

| mode | ชื่อ | จุดประสงค์ |
|------|------|-----------|
| `practice` | ฝึกฝน | ทำโจทย์ตามบทเรียน ทบทวนหรือล่วงหน้า |
| `timed` | จับเวลาตามบท | จำลองสอบมีเวลา ประเมินคะแนน |
| `mock` | แนวข้อสอบจริง | อิงข้อสอบจริงตามสนามสอบ มีจับเวลา |
| `remedial` | ปรับจุดอ่อน | unlock หลังทำ timed/mock แล้วพบจุดอ่อน |

---

## Question.attributes structure

```json
{
  "examGrade": "p5",
  "topic": ["topic:fractions", "topic:decimals"],
  "subtopic": ["subtopic:fractions-multiply"],
  "skill": ["skill:multi-step"],
  "trap": ["trap:wrong-unit"],
  "difficulty": 2,
  "estimatedTimeSec": 90,
  "score": 3
}
```

---

## AttributeDictionary seed data

### topic (10 ตัว — ข้ามชั้นได้)
```js
{ key: 'topic:whole-numbers',       type: 'topic', th: 'จำนวนนับและการดำเนินการ',  en: 'Whole Numbers and Operations', grade: null },
{ key: 'topic:fractions',           type: 'topic', th: 'เศษส่วน',                  en: 'Fractions',                    grade: null },
{ key: 'topic:decimals',            type: 'topic', th: 'ทศนิยม',                   en: 'Decimals',                     grade: null },
{ key: 'topic:percentage',          type: 'topic', th: 'ร้อยละ',                   en: 'Percentage',                   grade: null },
{ key: 'topic:ratio',               type: 'topic', th: 'อัตราส่วนและสัดส่วน',      en: 'Ratio and Proportion',         grade: null },
{ key: 'topic:geometry',            type: 'topic', th: 'เรขาคณิต',                 en: 'Geometry',                     grade: null },
{ key: 'topic:measurement',         type: 'topic', th: 'การวัด',                   en: 'Measurement',                  grade: null },
{ key: 'topic:area-volume',         type: 'topic', th: 'พื้นที่และปริมาตร',        en: 'Area and Volume',              grade: null },
{ key: 'topic:statistics',          type: 'topic', th: 'สถิติ',                    en: 'Statistics',                   grade: null },
{ key: 'topic:order-of-operations', type: 'topic', th: 'ลำดับการดำเนินการ',        en: 'Order of Operations',          grade: null },
```

### subtopic (มี minGrade)
```js
// whole-numbers
{ key: 'subtopic:whole-numbers-read-write',   type: 'subtopic', th: 'การอ่านและเขียนจำนวน',          en: 'Reading and Writing Numbers',     minGrade: 4 },
{ key: 'subtopic:whole-numbers-compare',      type: 'subtopic', th: 'การเปรียบเทียบและเรียงลำดับ',   en: 'Comparing and Ordering',          minGrade: 4 },
{ key: 'subtopic:whole-numbers-add',          type: 'subtopic', th: 'การบวก',                        en: 'Addition',                        minGrade: 4 },
{ key: 'subtopic:whole-numbers-subtract',     type: 'subtopic', th: 'การลบ',                         en: 'Subtraction',                     minGrade: 4 },
{ key: 'subtopic:whole-numbers-multiply',     type: 'subtopic', th: 'การคูณ',                        en: 'Multiplication',                  minGrade: 4 },
{ key: 'subtopic:whole-numbers-divide',       type: 'subtopic', th: 'การหาร',                        en: 'Division',                        minGrade: 4 },
{ key: 'subtopic:whole-numbers-word-problem', type: 'subtopic', th: 'โจทย์ปัญหา',                   en: 'Word Problems',                   minGrade: 4 },

// fractions
{ key: 'subtopic:fractions-concept',      type: 'subtopic', th: 'ความหมายและการอ่านเศษส่วน',    en: 'Fraction Concepts',               minGrade: 4 },
{ key: 'subtopic:fractions-compare',      type: 'subtopic', th: 'การเปรียบเทียบเศษส่วน',        en: 'Comparing Fractions',             minGrade: 4 },
{ key: 'subtopic:fractions-add-like',     type: 'subtopic', th: 'การบวกเศษส่วนเหมือนส่วน',     en: 'Adding Like Fractions',           minGrade: 4 },
{ key: 'subtopic:fractions-add-unlike',   type: 'subtopic', th: 'การบวกเศษส่วนต่างส่วน',       en: 'Adding Unlike Fractions',         minGrade: 5 },
{ key: 'subtopic:fractions-subtract',     type: 'subtopic', th: 'การลบเศษส่วน',                 en: 'Subtracting Fractions',           minGrade: 4 },
{ key: 'subtopic:fractions-multiply',     type: 'subtopic', th: 'การคูณเศษส่วน',                en: 'Multiplying Fractions',           minGrade: 5 },
{ key: 'subtopic:fractions-divide',       type: 'subtopic', th: 'การหารเศษส่วน',                en: 'Dividing Fractions',              minGrade: 5 },
{ key: 'subtopic:fractions-mixed',        type: 'subtopic', th: 'เศษเกินและจำนวนคละ',           en: 'Mixed Numbers',                   minGrade: 4 },
{ key: 'subtopic:fractions-word-problem', type: 'subtopic', th: 'โจทย์ปัญหาเศษส่วน',           en: 'Fraction Word Problems',          minGrade: 4 },

// decimals
{ key: 'subtopic:decimals-concept',      type: 'subtopic', th: 'ความหมายและการอ่านทศนิยม',  en: 'Decimal Concepts',                minGrade: 4 },
{ key: 'subtopic:decimals-compare',      type: 'subtopic', th: 'การเปรียบเทียบทศนิยม',      en: 'Comparing Decimals',              minGrade: 4 },
{ key: 'subtopic:decimals-add',          type: 'subtopic', th: 'การบวกทศนิยม',               en: 'Adding Decimals',                 minGrade: 4 },
{ key: 'subtopic:decimals-subtract',     type: 'subtopic', th: 'การลบทศนิยม',                en: 'Subtracting Decimals',            minGrade: 4 },
{ key: 'subtopic:decimals-multiply',     type: 'subtopic', th: 'การคูณทศนิยม',               en: 'Multiplying Decimals',            minGrade: 5 },
{ key: 'subtopic:decimals-divide',       type: 'subtopic', th: 'การหารทศนิยม',               en: 'Dividing Decimals',               minGrade: 5 },
{ key: 'subtopic:decimals-convert',      type: 'subtopic', th: 'การแปลงเศษส่วนและทศนิยม',   en: 'Converting Fractions/Decimals',   minGrade: 4 },
{ key: 'subtopic:decimals-word-problem', type: 'subtopic', th: 'โจทย์ปัญหาทศนิยม',          en: 'Decimal Word Problems',           minGrade: 4 },

// percentage
{ key: 'subtopic:percentage-concept',      type: 'subtopic', th: 'ความหมายร้อยละ',                   en: 'Percentage Concepts',         minGrade: 5 },
{ key: 'subtopic:percentage-convert',      type: 'subtopic', th: 'แปลงร้อยละ↔เศษส่วน↔ทศนิยม',       en: 'Converting Percentages',      minGrade: 5 },
{ key: 'subtopic:percentage-of-amount',    type: 'subtopic', th: 'หาร้อยละของจำนวน',                 en: 'Finding Percentage of Amount',minGrade: 5 },
{ key: 'subtopic:percentage-word-problem', type: 'subtopic', th: 'โจทย์ปัญหาร้อยละ',                en: 'Percentage Word Problems',    minGrade: 5 },

// ratio
{ key: 'subtopic:ratio-concept',      type: 'subtopic', th: 'ความหมายอัตราส่วน',      en: 'Ratio Concepts',       minGrade: 6 },
{ key: 'subtopic:ratio-simplify',     type: 'subtopic', th: 'การทำอัตราส่วนให้ง่าย',  en: 'Simplifying Ratios',   minGrade: 6 },
{ key: 'subtopic:ratio-proportion',   type: 'subtopic', th: 'สัดส่วน',                en: 'Proportion',           minGrade: 6 },
{ key: 'subtopic:ratio-word-problem', type: 'subtopic', th: 'โจทย์ปัญหาอัตราส่วน',   en: 'Ratio Word Problems',  minGrade: 6 },

// geometry
{ key: 'subtopic:geometry-shapes',        type: 'subtopic', th: 'รูปเรขาคณิตพื้นฐาน',   en: 'Basic Shapes',        minGrade: 4 },
{ key: 'subtopic:geometry-angle',         type: 'subtopic', th: 'มุมและการวัดมุม',        en: 'Angles',              minGrade: 4 },
{ key: 'subtopic:geometry-triangle',      type: 'subtopic', th: 'สามเหลี่ยม',             en: 'Triangles',           minGrade: 4 },
{ key: 'subtopic:geometry-quadrilateral', type: 'subtopic', th: 'สี่เหลี่ยม',             en: 'Quadrilaterals',      minGrade: 4 },
{ key: 'subtopic:geometry-circle',        type: 'subtopic', th: 'วงกลม',                  en: 'Circles',             minGrade: 5 },
{ key: 'subtopic:geometry-symmetry',      type: 'subtopic', th: 'สมมาตร',                 en: 'Symmetry',            minGrade: 4 },
{ key: 'subtopic:geometry-coordinate',    type: 'subtopic', th: 'กราฟและพิกัด',           en: 'Coordinates',         minGrade: 6 },

// measurement
{ key: 'subtopic:measurement-length',       type: 'subtopic', th: 'ความยาวและระยะทาง', en: 'Length and Distance',  minGrade: 4 },
{ key: 'subtopic:measurement-weight',       type: 'subtopic', th: 'น้ำหนัก',            en: 'Weight',               minGrade: 4 },
{ key: 'subtopic:measurement-liquid',       type: 'subtopic', th: 'ปริมาณของเหลว',      en: 'Liquid Volume',        minGrade: 4 },
{ key: 'subtopic:measurement-time',         type: 'subtopic', th: 'เวลา',               en: 'Time',                 minGrade: 4 },
{ key: 'subtopic:measurement-convert',      type: 'subtopic', th: 'การแปลงหน่วยวัด',   en: 'Unit Conversion',      minGrade: 4 },
{ key: 'subtopic:measurement-word-problem', type: 'subtopic', th: 'โจทย์ปัญหาการวัด',  en: 'Measurement Problems', minGrade: 4 },

// area-volume
{ key: 'subtopic:area-rectangle',     type: 'subtopic', th: 'พื้นที่สี่เหลี่ยมมุมฉาก',      en: 'Rectangle Area',       minGrade: 5 },
{ key: 'subtopic:area-triangle',      type: 'subtopic', th: 'พื้นที่สามเหลี่ยม',             en: 'Triangle Area',        minGrade: 6 },
{ key: 'subtopic:area-parallelogram', type: 'subtopic', th: 'พื้นที่สี่เหลี่ยมด้านขนาน',    en: 'Parallelogram Area',   minGrade: 6 },
{ key: 'subtopic:area-trapezoid',     type: 'subtopic', th: 'พื้นที่สี่เหลี่ยมคางหมู',      en: 'Trapezoid Area',       minGrade: 6 },
{ key: 'subtopic:area-combined',      type: 'subtopic', th: 'พื้นที่รูปซับซ้อน',            en: 'Combined Area',        minGrade: 6 },
{ key: 'subtopic:volume-cuboid',      type: 'subtopic', th: 'ปริมาตรทรงสี่เหลี่ยมมุมฉาก',   en: 'Cuboid Volume',        minGrade: 6 },
{ key: 'subtopic:area-word-problem',  type: 'subtopic', th: 'โจทย์ปัญหาพื้นที่และปริมาตร',  en: 'Area/Volume Problems', minGrade: 5 },

// statistics
{ key: 'subtopic:statistics-read-table',   type: 'subtopic', th: 'การอ่านตาราง',       en: 'Reading Tables',      minGrade: 4 },
{ key: 'subtopic:statistics-read-chart',   type: 'subtopic', th: 'การอ่านแผนภูมิ',     en: 'Reading Charts',      minGrade: 4 },
{ key: 'subtopic:statistics-bar-chart',    type: 'subtopic', th: 'แผนภูมิแท่ง',        en: 'Bar Charts',          minGrade: 4 },
{ key: 'subtopic:statistics-line-chart',   type: 'subtopic', th: 'แผนภูมิเส้น',        en: 'Line Charts',         minGrade: 5 },
{ key: 'subtopic:statistics-pie-chart',    type: 'subtopic', th: 'แผนภูมิวงกลม',       en: 'Pie Charts',          minGrade: 6 },
{ key: 'subtopic:statistics-mean',         type: 'subtopic', th: 'ค่าเฉลี่ย',          en: 'Mean',                minGrade: 5 },
{ key: 'subtopic:statistics-word-problem', type: 'subtopic', th: 'โจทย์ปัญหาสถิติ',    en: 'Statistics Problems', minGrade: 4 },

// order-of-operations
{ key: 'subtopic:bodmas-basic',        type: 'subtopic', th: 'ลำดับการดำเนินการพื้นฐาน', en: 'Basic Order of Operations', minGrade: 6 },
{ key: 'subtopic:bodmas-brackets',     type: 'subtopic', th: 'การใช้วงเล็บ',              en: 'Using Brackets',            minGrade: 6 },
{ key: 'subtopic:bodmas-mixed',        type: 'subtopic', th: 'ผสมหลายการดำเนินการ',       en: 'Mixed Operations',          minGrade: 6 },
{ key: 'subtopic:bodmas-word-problem', type: 'subtopic', th: 'โจทย์ปัญหา',               en: 'Word Problems',             minGrade: 6 },

// skill
{ key: 'skill:arithmetic',       type: 'skill', th: 'คำนวณตัวเลขตรงๆ',          en: 'Arithmetic Computation', minGrade: null },
{ key: 'skill:mental-math',      type: 'skill', th: 'คิดเลขในใจ',                en: 'Mental Math',            minGrade: null },
{ key: 'skill:estimation',       type: 'skill', th: 'ประมาณค่า',                 en: 'Estimation',             minGrade: null },
{ key: 'skill:word-problem',     type: 'skill', th: 'แปลโจทย์ปัญหาเป็นสมการ',   en: 'Word Problem Solving',   minGrade: null },
{ key: 'skill:visual-reasoning', type: 'skill', th: 'ใช้รูปภาพหรือแผนภาพช่วย', en: 'Visual Reasoning',       minGrade: null },
{ key: 'skill:multi-step',       type: 'skill', th: 'แก้ปัญหาหลายขั้นตอน',      en: 'Multi-step Problem',     minGrade: null },
{ key: 'skill:formula',          type: 'skill', th: 'จำและใช้สูตร',              en: 'Apply Formula',          minGrade: null },
{ key: 'skill:conversion',       type: 'skill', th: 'แปลงหน่วย',                 en: 'Unit Conversion',        minGrade: null },
{ key: 'skill:pattern',          type: 'skill', th: 'มองเห็นรูปแบบและลำดับ',    en: 'Pattern Recognition',    minGrade: null },
{ key: 'skill:proof',            type: 'skill', th: 'อ้างเหตุผลและพิสูจน์',     en: 'Proof and Reasoning',    minGrade: null },

// trap
{ key: 'trap:misread',          type: 'trap', th: 'อ่านโจทย์ผิดหรือข้ามข้อมูล',      en: 'Misread Question',          minGrade: null },
{ key: 'trap:wrong-unit',       type: 'trap', th: 'ใช้หน่วยผิดหรือลืมแปลงหน่วย',     en: 'Wrong Unit',                minGrade: null },
{ key: 'trap:misorder',         type: 'trap', th: 'ลำดับการคำนวณผิด',                 en: 'Wrong Order of Operations', minGrade: null },
{ key: 'trap:sign-error',       type: 'trap', th: 'สับสนเรื่องบวก/ลบ/คูณ/หาร',       en: 'Sign Error',                minGrade: null },
{ key: 'trap:partial-answer',   type: 'trap', th: 'ตอบแค่บางส่วน ไม่ครบคำถาม',       en: 'Partial Answer',            minGrade: null },
{ key: 'trap:extra-info',       type: 'trap', th: 'หลงข้อมูลที่ไม่จำเป็น',            en: 'Misleading Extra Info',     minGrade: null },
{ key: 'trap:rounding',         type: 'trap', th: 'ปัดเศษผิดหรือปัดผิดจุด',           en: 'Rounding Error',            minGrade: null },
{ key: 'trap:confusing-choice', type: 'trap', th: 'ตัวเลือกใกล้เคียงกันจนสับสน',      en: 'Confusing Similar Choices', minGrade: null },
```

---

## Schema — สิ่งที่ต้องแก้/เพิ่ม

### Question (แก้)
```prisma
aiGenerated  Boolean   @default(false)
needsReview  Boolean   @default(false)
reviewedAt   DateTime?
// ลบออก: estimatedTimeSec, score (ย้ายเข้า attributes)
```

### AttributeDictionary (แก้)
```prisma
minGrade  Int?
```

### ExamResult (แก้)
```prisma
model ExamResult {
  id               Int            @id @default(autoincrement())
  studentProfileId Int
  studentProfile   StudentProfile @relation(fields: [studentProfileId], references: [id])
  mode             String         // 'practice','timed','mock','remedial'
  examSetId        String?        // timed, mock เท่านั้น
  sectionId        Int?           // practice เท่านั้น
  score            Int?           // timed, mock เท่านั้น
  totalScore       Int?           // timed, mock เท่านั้น
  correctCount     Int
  totalCount       Int
  durationSec      Int
  createdAt        DateTime       @default(now())
}
```

### ExamSetMetadata (แก้)
```prisma
timeLimitSec    Int
blueprint       Json     // [{ difficulty, count, topicTags? }]
isOfficial      Boolean  // true = mock, false = timed
questionSource  String?  // filter Question.source
createdBy       String   // admin เท่านั้น
grade           String
label           String?
year            String?
```

### ExamAnswer ✅ (implement แล้ว 2026-04-12)
```prisma
model ExamAnswer {
  id               Int      @id @default(autoincrement())
  studentProfileId Int
  questionId       String
  selectedIdx      Int
  isCorrect        Boolean
  timeSec          Int?
  createdAt        DateTime @default(now())
  @@index([studentProfileId])
}
```

### SubtopicPass ✅ (implement แล้ว 2026-04-12)
```prisma
model SubtopicPass {
  id               Int            @id @default(autoincrement())
  studentProfileId Int
  grade            String
  topicKey         String
  subtopicKey      String
  passedAt         DateTime       @default(now())
  @@unique([studentProfileId, grade, topicKey, subtopicKey])
}
```

### TopicPass ✅ (implement แล้ว 2026-04-12)
```prisma
model TopicPass {
  id               Int            @id @default(autoincrement())
  studentProfileId Int
  grade            String
  topicKey         String
  passedAt         DateTime       @default(now())
  @@unique([studentProfileId, grade, topicKey])
}
```

### WeakTopicState (ใหม่)
```prisma
model WeakTopicState {
  id               Int      @id @default(autoincrement())
  studentProfileId Int
  topicTag         String
  subtopicTag      String?
  failCount        Int      @default(1)
  lastFailedAt     DateTime
  createdAt        DateTime @default(now())
  @@unique([studentProfileId, topicTag, subtopicTag])
}
```

### SectionProgress (ใหม่)
```prisma
model SectionProgress {
  id               Int       @id @default(autoincrement())
  studentProfileId Int
  sectionId        Int
  isPassed         Boolean   @default(false)
  bestScore        Int
  passedAt         DateTime?
  updatedAt        DateTime  @updatedAt
  @@unique([studentProfileId, sectionId])
}
```

### Curriculum (ใหม่)
```prisma
model Curriculum {
  id         Int                  @id @default(autoincrement())
  grade      String               // 'p4','p5','p6'
  chapterNo  Int
  titleTh    String
  titleEn    String
  isActive   Boolean              @default(true)
  sections   CurriculumSection[]
}
```

### CurriculumSection (ใหม่)
```prisma
model CurriculumSection {
  id           Int        @id @default(autoincrement())
  curriculumId Int
  curriculum   Curriculum @relation(fields: [curriculumId], references: [id])
  sectionNo    Int
  titleTh      String
  titleEn      String
  topicTags    Json
  isActive     Boolean    @default(true)
}
```

---

## Practice Mode — ระบบ Pass/Fail ✅ (implement แล้ว 2026-04-12)

| โหมด | จำนวนข้อ | เกณฑ์ผ่าน | บันทึก |
|------|---------|----------|--------|
| `practice` (ฝึก) | ไม่จำกัด | ไม่มี | ExamAnswer, ExamResult |
| `subtopic_test` (สอบ subtopic) | 10 ข้อ | ≥8/10 | + SubtopicPass |
| `topic_test` (สอบ topic) | 10 ข้อ | ≥8/10 | + TopicPass |

**Gate:** สอบ topic ได้ก็ต่อเมื่อผ่านทุก subtopic แล้ว

**สัดส่วน difficulty ใน test:** ง่าย 3 / กลาง 4 / ยาก 3 (ถ้าไม่พอสุ่มจาก pool)

**UI:** practice.html — topic overview compact row + toggle, สอบ button disabled จนกว่าเงื่อนไขผ่าน

---

## UX การตอบข้อสอบ — ความแตกต่างระหว่าง Practice และ Exam (planned)

**สถานะปัจจุบัน (2026-04-13):**
- ทุกโหมด (ฝึก / subtopic_test / topic_test) ใช้แบบ **ตอบแล้วเห็นเฉลยทันที** (answer-as-you-go)

**ที่ต้องการในอนาคต:**
- **Practice (ฝึก):** คงแบบเดิม — ตอบแล้วเห็นเฉลยทันที เพราะเป้าหมายคือเรียนรู้
- **Exam mode (mock / timed / subtopic_test / topic_test):** เปลี่ยนเป็น **ทำครบก่อน แล้วค่อย submit**
  - ระหว่างทำ: เลือกคำตอบแต่ยังไม่เห็นเฉลย
  - เดินหน้าย้อนหลังดูข้อไหนก็ได้ + แก้คำตอบได้จนกว่าจะ submit
  - มี indicator บอกว่าข้อไหนตอบแล้ว / ข้อไหนยังข้าม
  - กด submit → เห็นผลทีเดียวหมด

**Why:** จำลองบรรยากาศสอบจริง — ในข้อสอบจริง นักเรียนทำทั้งชุดก่อนแล้วค่อยส่ง

**How to apply:** เมื่อจะ implement ให้แยก UI flow ออกเป็น 2 component ชัดเจน อย่า mix logic ใน script.js เดิม

---

## รูปภาพในโจทย์และตัวเลือก (planned)

### โครงสร้างปัจจุบัน
- `Question.image` (String | null) — มีอยู่แล้วใน schema แต่ยังไม่ถูกใช้งาน
- `Question.choices` — JSON array ของ `{ textTh, textEn }` — ยังไม่มี image

### แนวทาง (ไม่ต้องแก้ schema)
```
รูปโจทย์   → Question.image = "/uploads/q_<id>.png"
รูปตัวเลือก → choices[i].image = "/uploads/c_<id>.png"  (เพิ่ม field ใน JSON)
```

ตัวอย่าง choices JSON ที่มีรูป:
```json
[
  { "textTh": "ตัวเลือก ก", "textEn": "Choice A", "image": "/uploads/c_abc.png" },
  { "textTh": "ตัวเลือก ข", "textEn": "Choice B", "image": null }
]
```

### งานที่ต้องทำ

| ส่วน | รายละเอียด |
|------|-----------|
| Backend | `POST /api/upload` รับไฟล์รูปด้วย `multer` → บันทึกใน `server/uploads/` → คืน URL |
| Admin UI | form กรอกโจทย์: upload รูปโจทย์ + รูปแต่ละตัวเลือก (optional) |
| Practice/Exam UI | render `<img>` ใต้ข้อความโจทย์ + ใน choice button (ถ้า choice.image มีค่า) |

### หมายเหตุ
- `server/uploads/` เสิร์ฟที่ `/uploads/` อยู่แล้ว
- ถ้า deploy บน Render (ephemeral FS) ควรย้ายไปเก็บที่ R2 (config พร้อมแล้วใน env)
- ยังไม่มีข้อสอบในฐานข้อมูลที่ใช้รูปภาพ — เพิ่มได้ทีหลัง

---

## Logic สำคัญ

- **เกณฑ์การผ่าน** — hardcode 8/10 ทุก section
- **chapter ผ่าน** — คำนวณ on-the-fly จากทุก section ใน chapter isPassed = true
- **remedial unlock** — เมื่อมี WeakTopicState ค้างอยู่
- **จุดอ่อน** — ผิดข้อไหน นับทุก topic ใน array เท่ากัน → update WeakTopicState
- **ExamAnswer** — ลบทั้งหมดเมื่อเริ่มชุดใหม่
- **WeakTopicState** — ลบเมื่อผ่าน topic นั้นแล้ว
- **ExamSetMetadata** — admin เท่านั้นสร้าง/แก้ได้
- **timed default blueprint** — 20 ข้อ 30 นาที ง่าย 10/กลาง 7/ยาก 3

---

## Teacher Input Flow

```
ครู input โจทย์ + คำตอบ
→ AI tag attributes + สร้าง variant → บันทึก DB ทันที (needsReview = false)
→ หน้า Review: ครูเห็นรายการ ถ้าผิดกด flag (needsReview = true) แล้วค่อยแก้
```

---

## Role & School System

### ภาพรวม Phases
- **Phase 1** — `School` model, `schoolId` ใน User, role `school_admin`, Admin CRUD โรงเรียน
- **Phase 2** — Register ด้วย cascade dropdown (จังหวัด → อำเภอ → โรงเรียน)
- **Phase 3** — school_admin: อัปโหลด CSV roster, ขยับชั้น, reset password
- **Phase 4** — Teacher view: ภาพรวมคะแนนทุกห้อง (read-only)

---

## Gamification System

### ภาพรวม dependency chain
```
Phase 1: Ticket Infrastructure → Phase 2: Daily Mission → Phase 3: Box System → Phase 4: Leaderboard Period
```

### Phase 1 — Ticket Infrastructure ✅ (เสร็จแล้ว)

**กฎ:**
- ใช้ได้สูงสุด 5 ใบ/วัน (reset 3 AM ICT)
- สะสมได้ไม่จำกัด
- competitive mode: ถ้า `useTicket=true` → บันทึก ExamResult, ถ้า `false` → เล่นได้แต่ไม่บันทึก

**API:**
- `GET /api/tickets/balance` — ยอดคงเหลือ + ใช้ไปวันนี้กี่ใบ (max 5/วัน)
- `POST /api/tickets/use` — ตรวจ cap → หัก 1 ใบ

### Phase 2 — Daily Mission System (planned)

**DB Models ใหม่:**
```
MissionTemplate   id, name, description, type('question_count'|'session_count'),
                  targetCount, difficulty('easy'|'normal'|'hard'),
                  rewardType('silver_box'|'tickets'), rewardAmount,
                  isActive, school(optional), createdById
MissionProgress   userId, templateId, date(ICT), currentCount,
                  completed, rewardClaimed, completedAt
                  @@unique([userId, templateId, date])
```

**DailyMission model เดิม** → deprecate เมื่อ Phase 2 เสร็จ

**API:**
- `GET /api/missions/today` — missions + progress วันนี้
- `POST /api/missions/progress` — auto-trigger จาก submit-exam
- `GET/POST/PATCH /api/admin/missions` — admin CRUD templates

**Auto-trigger:** submit exam → server ตรวจ mission → ถ้าครบ → สร้าง RewardBox

### Phase 3 — Box System (planned)

**DB Model ใหม่:**
```
RewardBox   id, userId, boxType('silver'|'gold'),
            source('mission_complete'|'leaderboard_win'|'admin_gift'),
            sourceNote, openedAt, rewardJson, createdAt
```

**Loot Table:**

| กล่องเงิน | โอกาส | รางวัล |
|-----------|-------|--------|
| | 70% | ตั๋ว 2 ใบ |
| | 20% | ตั๋ว 3 ใบ |
| | 10% | ตั๋ว 5 ใบ + XP |

| กล่องทอง | โอกาส | รางวัล |
|----------|-------|--------|
| | 40% | ตั๋ว 5 ใบ |
| | 35% | ตั๋ว 10 ใบ |
| | 20% | ตั๋ว 10 ใบ + XP |
| | 5% | ตั๋ว 15 ใบ + XP ใหญ่ |

**API:**
- `GET /api/boxes` — กล่องที่ยังไม่ได้เปิด
- `POST /api/boxes/:id/open` → random reward → เพิ่ม ticket balance

### Phase 4 — Leaderboard Period & Gold Box (planned)

**DB Model ใหม่:**
```
CompetitionPeriod   id, name, startDate, endDate, grade(optional), isActive
```

**กฎ:**
- Admin กำหนดรอบ 7/14/30 วัน
- หมดรอบ → process top-N → ได้กล่องทอง
- Competitive mode บันทึกคะแนนลง period leaderboard (ต้องใช้ตั๋ว)
