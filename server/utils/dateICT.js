// utils/dateICT.js — helper วันที่เวลาไทย (UTC+7)
// reset ที่ 03:00 ICT ทุกวัน (= 20:00 UTC วันก่อนหน้า)

/**
 * คืนค่า "YYYY-MM-DD" ของ "วันนี้" ตามเวลาไทย
 * ถ้าเวลา ICT ยังไม่ถึง 03:00 น. → นับเป็นวันก่อนหน้า
 */
function getTodayICT() {
  const now = new Date();
  const ict = new Date(now.getTime() + 7 * 60 * 60 * 1000); // UTC+7
  if (ict.getUTCHours() < 3) {
    ict.setUTCDate(ict.getUTCDate() - 1);
  }
  return ict.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

module.exports = { getTodayICT };
