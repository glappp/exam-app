// topicMap.js

// หัวข้อหลักในแต่ละระดับชั้น (key ตรงกับ attributes.topic ใน DB)
const gradeTopics = {
  p4: [
    { key: 'topic:whole-numbers', label: 'จำนวนนับ' },
    { key: 'topic:fractions',     label: 'เศษส่วน' },
    { key: 'topic:decimals',      label: 'ทศนิยม' },
    { key: 'topic:geometry',      label: 'เรขาคณิต' },
    { key: 'topic:measurement',   label: 'การวัด' },
    { key: 'topic:statistics',    label: 'สถิติ' },
  ],
  p5: [
    { key: 'topic:fractions',           label: 'เศษส่วน' },
    { key: 'topic:decimals',            label: 'ทศนิยม' },
    { key: 'topic:percentage',          label: 'ร้อยละ' },
    { key: 'topic:geometry',            label: 'เรขาคณิต (วงกลม)' },
    { key: 'topic:area-volume',         label: 'พื้นที่และปริมาตร' },
    { key: 'topic:statistics',          label: 'สถิติ' },
  ],
  p6: [
    { key: 'topic:ratio',               label: 'อัตราส่วน' },
    { key: 'topic:geometry',            label: 'เรขาคณิต (พิกัด)' },
    { key: 'topic:area-volume',         label: 'พื้นที่และปริมาตร' },
    { key: 'topic:statistics',          label: 'สถิติ (แผนภูมิวงกลม)' },
    { key: 'topic:order-of-operations', label: 'ลำดับการดำเนินการ' },
  ],
};

// หัวข้อย่อยต่อ grade+topic  (key ตรงกับ attributes.subtopic ใน DB)
const gradeTopicSubtopics = {
  p4: {
    'topic:whole-numbers': [
      { key: 'subtopic:whole-numbers-read-write', label: 'อ่านและเขียนจำนวน' },
      { key: 'subtopic:whole-numbers-compare',    label: 'เปรียบเทียบจำนวน' },
      { key: 'subtopic:whole-numbers-add',        label: 'การบวก' },
      { key: 'subtopic:whole-numbers-subtract',   label: 'การลบ' },
      { key: 'subtopic:whole-numbers-multiply',   label: 'การคูณ' },
      { key: 'subtopic:whole-numbers-divide',     label: 'การหาร' },
      { key: 'subtopic:whole-numbers-word-problem', label: 'โจทย์ปัญหา' },
    ],
    'topic:fractions': [
      { key: 'subtopic:fractions-concept',      label: 'ความหมายเศษส่วน' },
      { key: 'subtopic:fractions-compare',      label: 'เปรียบเทียบ' },
      { key: 'subtopic:fractions-add-like',     label: 'บวก (ส่วนเท่ากัน)' },
      { key: 'subtopic:fractions-subtract',     label: 'การลบ' },
      { key: 'subtopic:fractions-mixed',        label: 'เศษส่วนปน' },
      { key: 'subtopic:fractions-word-problem', label: 'โจทย์ปัญหา' },
    ],
    'topic:decimals': [
      { key: 'subtopic:decimals-concept',      label: 'ความหมายทศนิยม' },
      { key: 'subtopic:decimals-compare',      label: 'เปรียบเทียบ' },
      { key: 'subtopic:decimals-add',          label: 'การบวก' },
      { key: 'subtopic:decimals-subtract',     label: 'การลบ' },
      { key: 'subtopic:decimals-convert',      label: 'แปลงหน่วย' },
      { key: 'subtopic:decimals-word-problem', label: 'โจทย์ปัญหา' },
    ],
    'topic:geometry': [
      { key: 'subtopic:geometry-shapes',       label: 'รูปเรขาคณิต' },
      { key: 'subtopic:geometry-angle',        label: 'มุม' },
      { key: 'subtopic:geometry-triangle',     label: 'สามเหลี่ยม' },
      { key: 'subtopic:geometry-quadrilateral', label: 'สี่เหลี่ยม' },
      { key: 'subtopic:geometry-symmetry',     label: 'สมมาตร' },
    ],
    'topic:measurement': [
      { key: 'subtopic:measurement-length',       label: 'ความยาว' },
      { key: 'subtopic:measurement-weight',       label: 'น้ำหนัก' },
      { key: 'subtopic:measurement-liquid',       label: 'ปริมาตร' },
      { key: 'subtopic:measurement-time',         label: 'เวลา' },
      { key: 'subtopic:measurement-convert',      label: 'แปลงหน่วย' },
      { key: 'subtopic:measurement-word-problem', label: 'โจทย์ปัญหา' },
    ],
    'topic:statistics': [
      { key: 'subtopic:statistics-read-table',   label: 'อ่านตาราง' },
      { key: 'subtopic:statistics-bar-chart',    label: 'แผนภูมิแท่ง' },
      { key: 'subtopic:statistics-read-chart',   label: 'อ่านกราฟ' },
      { key: 'subtopic:statistics-word-problem', label: 'โจทย์ปัญหา' },
    ],
  },
  p5: {
    'topic:fractions': [
      { key: 'subtopic:fractions-add-unlike', label: 'บวก (ต่างส่วน)' },
      { key: 'subtopic:fractions-multiply',   label: 'การคูณ' },
      { key: 'subtopic:fractions-divide',     label: 'การหาร' },
    ],
    'topic:decimals': [
      { key: 'subtopic:decimals-multiply', label: 'การคูณ' },
      { key: 'subtopic:decimals-divide',   label: 'การหาร' },
    ],
    'topic:percentage': [
      { key: 'subtopic:percentage-concept',      label: 'ความหมายร้อยละ' },
      { key: 'subtopic:percentage-convert',      label: 'แปลงร้อยละ' },
      { key: 'subtopic:percentage-of-amount',    label: 'ร้อยละของจำนวน' },
      { key: 'subtopic:percentage-word-problem', label: 'โจทย์ปัญหา' },
    ],
    'topic:geometry': [
      { key: 'subtopic:geometry-circle', label: 'วงกลม' },
    ],
    'topic:area-volume': [
      { key: 'subtopic:area-rectangle',    label: 'พื้นที่สี่เหลี่ยม' },
      { key: 'subtopic:area-word-problem', label: 'โจทย์ปัญหา' },
    ],
    'topic:statistics': [
      { key: 'subtopic:statistics-line-chart', label: 'กราฟเส้น' },
      { key: 'subtopic:statistics-mean',       label: 'ค่าเฉลี่ย' },
    ],
  },
  p6: {
    'topic:ratio': [
      { key: 'subtopic:ratio-concept',      label: 'ความหมายอัตราส่วน' },
      { key: 'subtopic:ratio-simplify',     label: 'ทำให้ง่าย' },
      { key: 'subtopic:ratio-proportion',   label: 'สัดส่วน' },
      { key: 'subtopic:ratio-word-problem', label: 'โจทย์ปัญหา' },
    ],
    'topic:geometry': [
      { key: 'subtopic:geometry-coordinate', label: 'ระบบพิกัด' },
    ],
    'topic:area-volume': [
      { key: 'subtopic:area-triangle',      label: 'พื้นที่สามเหลี่ยม' },
      { key: 'subtopic:area-parallelogram', label: 'พื้นที่ขนานทแยง' },
      { key: 'subtopic:area-trapezoid',     label: 'พื้นที่คางหมู' },
      { key: 'subtopic:area-combined',      label: 'รูปซับซ้อน' },
      { key: 'subtopic:volume-cuboid',      label: 'ปริมาตรทรงสี่เหลี่ยม' },
    ],
    'topic:statistics': [
      { key: 'statistics:pie-chart', label: 'แผนภูมิวงกลม' },
    ],
    'topic:order-of-operations': [
      { key: 'order-of-operations:bodmas-basic',        label: 'พื้นฐาน' },
      { key: 'order-of-operations:bodmas-brackets',     label: 'วงเล็บ' },
      { key: 'order-of-operations:bodmas-mixed',        label: 'ผสม' },
      { key: 'order-of-operations:bodmas-word-problem', label: 'โจทย์ปัญหา' },
    ],
  },
};

// label สำหรับแสดงชื่อ grade
const gradeLabel = { p4: 'ป.4', p5: 'ป.5', p6: 'ป.6' };

// ค้นหา label จาก topic key
function getTopicLabel(key) {
  for (const topics of Object.values(gradeTopics)) {
    const found = topics.find(t => t.key === key);
    if (found) return found.label;
  }
  return key.replace(/^topic:/, '');
}

// ค้นหา label จาก subtopic key
function getSubtopicLabel(key) {
  for (const topicMap of Object.values(gradeTopicSubtopics)) {
    for (const subs of Object.values(topicMap)) {
      const found = subs.find(s => s.key === key);
      if (found) return found.label;
    }
  }
  return key.replace(/^[^:]+:/, '');
}

// เติม topic dropdown เมื่อเลือก grade
function onGradeChange(grade) {
  const topicSel   = document.getElementById('chapter');
  const subtopicSel = document.getElementById('subtopic');

  topicSel.innerHTML = '<option value="">-- เลือกหัวข้อ --</option>';
  topicSel.disabled = !grade;
  if (subtopicSel) { subtopicSel.innerHTML = '<option value="">-- เลือกหัวข้อย่อย --</option>'; subtopicSel.disabled = true; }
  if (!grade) return;

  for (const t of (gradeTopics[grade] || [])) {
    const opt = document.createElement('option');
    opt.value = t.key;
    opt.textContent = t.label;
    topicSel.appendChild(opt);
  }
  topicSel.selectedIndex = 1;
  onTopicChange(grade, topicSel.value);
}

// เติม subtopic dropdown เมื่อเลือก topic
function onTopicChange(grade, topicKey) {
  const subtopicSel = document.getElementById('subtopic');
  if (!subtopicSel) return;

  subtopicSel.innerHTML = '<option value="">ทั้งหมด</option>';
  const subs = (gradeTopicSubtopics[grade] || {})[topicKey] || [];
  subtopicSel.disabled = subs.length === 0;

  for (const s of subs) {
    const opt = document.createElement('option');
    opt.value = s.key;
    opt.textContent = s.label;
    subtopicSel.appendChild(opt);
  }

  if (typeof updateTestBtn === 'function') updateTestBtn();
}

// compat เผื่อโค้ดเก่ายังอ้างถึง
const topicMap = {};
const reverseTopicMap = {};
