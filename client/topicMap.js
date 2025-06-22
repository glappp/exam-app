// topicMap.js
const topicMap = {
  'บวก': 'addition',
  'ลบ': 'subtraction',
  'คูณ': 'multiplication',
  'หาร': 'division',
  'เศษส่วน': 'fraction',
  'สมการ': 'equation',
  'พื้นที่': 'area'
};

const reverseTopicMap = Object.fromEntries(
  Object.entries(topicMap).map(([th, en]) => [en, th])
);

function getTopicLabel(key) {
  return reverseTopicMap[key] || key;
}

