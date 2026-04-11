// topicMap.js

// หัวข้อในแต่ละระดับชั้น (key ตรงกับ attributes.topic ใน DB)
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
    { key: 'topic:fractions',        label: 'เศษส่วน' },
    { key: 'topic:decimals',         label: 'ทศนิยม' },
    { key: 'topic:percentage',       label: 'ร้อยละ' },
    { key: 'topic:geometry-circle',  label: 'วงกลม' },
    { key: 'topic:area-volume',      label: 'พื้นที่และปริมาตร' },
    { key: 'topic:statistics',       label: 'สถิติ' },
  ],
  p6: [
    { key: 'topic:ratio',                label: 'อัตราส่วน' },
    { key: 'topic:geometry-coordinate',  label: 'พิกัด' },
    { key: 'topic:area-volume',          label: 'พื้นที่และปริมาตร' },
    { key: 'topic:statistics-pie-chart', label: 'แผนภูมิวงกลม' },
    { key: 'topic:order-of-operations',  label: 'ลำดับการดำเนินการ' },
  ],
};

// label สำหรับแสดงชื่อ grade
const gradeLabel = { p4: 'ป.4', p5: 'ป.5', p6: 'ป.6' };

// ค้นหา label จาก topic key (ใช้ใน adaptive mode)
function getTopicLabel(key) {
  for (const topics of Object.values(gradeTopics)) {
    const found = topics.find(t => t.key === key);
    if (found) return found.label;
  }
  return key.replace(/^topic:/, '');
}

// เติม dropdown หัวข้อเมื่อเลือก grade
function onGradeChange(grade) {
  const sel = document.getElementById('chapter');
  sel.innerHTML = '<option value="">-- เลือกหัวข้อ --</option>';
  sel.disabled = !grade;
  if (!grade) return;
  for (const t of (gradeTopics[grade] || [])) {
    const opt = document.createElement('option');
    opt.value = t.key;
    opt.textContent = t.label;
    sel.appendChild(opt);
  }
  sel.selectedIndex = 1; // เลือกหัวข้อแรกไว้ให้ก่อน
}

// compat เผื่อโค้ดเก่ายังอ้างถึง
const topicMap = {};
const reverseTopicMap = {};

