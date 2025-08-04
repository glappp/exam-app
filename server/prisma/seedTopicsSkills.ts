import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Topics...');
  const topics = [
    { id: 'TOP_P4_01', labelTh: 'จำนวนนับที่มากกว่า 100,000', labelEn: 'Large Numbers', grade: 'P4' },
    { id: 'TOP_P4_02', labelTh: 'การบวกและการลบจำนวนนับที่มากกว่า 100,000', labelEn: 'Addition and Subtraction of Large Numbers', grade: 'P4' },
    { id: 'TOP_P4_03', labelTh: 'การคูณและการหารจำนวนนับ', labelEn: 'Multiplication and Division of Whole Numbers', grade: 'P4' },
    { id: 'TOP_P4_04', labelTh: 'การบวก ลบ คูณ หารจำนวนนับ', labelEn: 'Mixed Operations of Whole Numbers', grade: 'P4' },
    { id: 'TOP_P4_05', labelTh: 'เวลา', labelEn: 'Time', grade: 'P4' },
    { id: 'TOP_P4_06', labelTh: 'เศษส่วน', labelEn: 'Fractions', grade: 'P4' },
    { id: 'TOP_P4_07', labelTh: 'ทศนิยม', labelEn: 'Decimals', grade: 'P4' },
    { id: 'TOP_P4_08', labelTh: 'มุม', labelEn: 'Angles', grade: 'P4' },
    { id: 'TOP_P4_09', labelTh: 'รูปสี่เหลี่ยมมุมฉาก', labelEn: 'Rectangles and Squares', grade: 'P4' },
    { id: 'TOP_P4_10', labelTh: 'การนำเสนอข้อมูล', labelEn: 'Data Presentation', grade: 'P4' },

    { id: 'TOP_P5_01', labelTh: 'เศษส่วน', labelEn: 'Fractions', grade: 'P5' },
    { id: 'TOP_P5_02', labelTh: 'ทศนิยม', labelEn: 'Decimals', grade: 'P5' },
    { id: 'TOP_P5_03', labelTh: 'การนำเสนอข้อมูล', labelEn: 'Data Presentation', grade: 'P5' },
    { id: 'TOP_P5_04', labelTh: 'บัญญัติไตรยางศ์', labelEn: 'Proportion', grade: 'P5' },
    { id: 'TOP_P5_05', labelTh: 'ร้อยละ', labelEn: 'Percentage', grade: 'P5' },
    { id: 'TOP_P5_06', labelTh: 'เส้นขนาน', labelEn: 'Parallel Lines', grade: 'P5' },
    { id: 'TOP_P5_07', labelTh: 'รูปสี่เหลี่ยม', labelEn: 'Quadrilaterals', grade: 'P5' },
    { id: 'TOP_P5_08', labelTh: 'ปริมาตรและความจุ', labelEn: 'Volume and Capacity', grade: 'P5' },

    { id: 'TOP_P6_01', labelTh: 'ห.ร.ม. และ ค.ร.น.', labelEn: 'HCF and LCM', grade: 'P6' },
    { id: 'TOP_P6_02', labelTh: 'เศษส่วน', labelEn: 'Fractions', grade: 'P6' },
    { id: 'TOP_P6_03', labelTh: 'ทศนิยม', labelEn: 'Decimals', grade: 'P6' },
    { id: 'TOP_P6_04', labelTh: 'ร้อยละและอัตราส่วน', labelEn: 'Percentage and Ratio', grade: 'P6' },
    { id: 'TOP_P6_05', labelTh: 'แบบรูป', labelEn: 'Patterns', grade: 'P6' },
    { id: 'TOP_P6_06', labelTh: 'รูปสามเหลี่ยม', labelEn: 'Triangles', grade: 'P6' },
    { id: 'TOP_P6_07', labelTh: 'รูปหลายเหลี่ยม', labelEn: 'Polygons', grade: 'P6' },
    { id: 'TOP_P6_08', labelTh: 'วงกลม', labelEn: 'Circles', grade: 'P6' },
    { id: 'TOP_P6_09', labelTh: 'รูปเรขาคณิตสามมิติ', labelEn: '3D Shapes', grade: 'P6' },
    { id: 'TOP_P6_10', labelTh: 'การนำเสนอข้อมูล', labelEn: 'Data Presentation', grade: 'P6' }
  ];

  await Promise.all(topics.map(topic =>
    prisma.topic.upsert({ where: { id: topic.id }, update: topic, create: topic })
  ));

  console.log('🌱 Seeding Skills...');
  const skills = [
    { id: 'SKL001', labelTh: 'การอ่านและเขียนจำนวนนับ', labelEn: 'Reading and Writing Numbers', grade: 'P4' },
    { id: 'SKL002', labelTh: 'หลักและค่าประจำหลัก', labelEn: 'Place Value', grade: 'P4' },
    { id: 'SKL003', labelTh: 'การเปรียบเทียบและเรียงลำดับ', labelEn: 'Comparison and Ordering', grade: 'P4' },
    { id: 'SKL004', labelTh: 'การประมาณค่า', labelEn: 'Estimation', grade: 'P4' },
    { id: 'SKL005', labelTh: 'การบวกและลบ', labelEn: 'Addition and Subtraction', grade: 'P4' },
    { id: 'SKL006', labelTh: 'การคูณและการหาร', labelEn: 'Multiplication and Division', grade: 'P4' },
    { id: 'SKL007', labelTh: 'โจทย์ปัญหา 2 ขั้นตอน', labelEn: 'Two-step Word Problems', grade: 'P4' },
    { id: 'SKL008', labelTh: 'การวิเคราะห์โจทย์ปัญหา', labelEn: 'Problem Analysis', grade: null },
    { id: 'SKL009', labelTh: 'การใช้เครื่องคิดเลข', labelEn: 'Calculator Use', grade: 'P4' },
    { id: 'SKL010', labelTh: 'เศษส่วนพื้นฐาน', labelEn: 'Basic Fractions', grade: 'P4' },
    { id: 'SKL011', labelTh: 'การบวกและลบเศษส่วน', labelEn: 'Addition and Subtraction of Fractions', grade: 'P4' },
    { id: 'SKL012', labelTh: 'ทศนิยมพื้นฐาน', labelEn: 'Basic Decimals', grade: 'P4' },
    { id: 'SKL013', labelTh: 'มุมและการวัดมุม', labelEn: 'Angles and Measurement', grade: 'P4' },
    { id: 'SKL014', labelTh: 'รูปเรขาคณิต 2 มิติ', labelEn: '2D Shapes', grade: 'P4' },
    { id: 'SKL015', labelTh: 'การนำเสนอข้อมูลเบื้องต้น', labelEn: 'Basic Data Presentation', grade: 'P4' },
    { id: 'SKL016', labelTh: 'เศษส่วนขั้นสูง', labelEn: 'Advanced Fractions', grade: 'P5' },
    { id: 'SKL017', labelTh: 'ทศนิยมขั้นสูง', labelEn: 'Advanced Decimals', grade: 'P5' },
    { id: 'SKL018', labelTh: 'บัญญัติไตรยางศ์', labelEn: 'Proportion Solving', grade: 'P5' },
    { id: 'SKL019', labelTh: 'ร้อยละ', labelEn: 'Percentage Calculations', grade: 'P5' },
    { id: 'SKL020', labelTh: 'ปริมาตรและความจุ', labelEn: 'Volume and Capacity', grade: 'P5' },
    { id: 'SKL021', labelTh: 'อัตราส่วน', labelEn: 'Ratio', grade: 'P6' },
    { id: 'SKL022', labelTh: 'ห.ร.ม. และ ค.ร.น.', labelEn: 'HCF and LCM', grade: 'P6' },
    { id: 'SKL023', labelTh: 'รูปสามเหลี่ยมและวงกลม', labelEn: 'Triangles and Circles', grade: 'P6' },
    { id: 'SKL024', labelTh: 'เรขาคณิตสามมิติ', labelEn: '3D Geometry', grade: 'P6' },
    { id: 'SKL025', labelTh: 'การตีความข้อมูล', labelEn: 'Data Interpretation', grade: 'P6' }
  ];

  await Promise.all(skills.map(skill =>
    prisma.skill.upsert({
      where: { id: skill.id },
      update: { ...skill, grade: skill.grade ?? undefined },
      create: { ...skill, grade: skill.grade ?? undefined },
    })
  ));

  console.log('🌱 Linking Topic-Skills...');
  const topicSkills = [
    { topicId: 'TOP_P4_01', skillId: 'SKL001' },
    { topicId: 'TOP_P4_01', skillId: 'SKL002' },
    { topicId: 'TOP_P4_01', skillId: 'SKL003' },
    { topicId: 'TOP_P4_01', skillId: 'SKL004' },

    { topicId: 'TOP_P4_02', skillId: 'SKL005' },
    { topicId: 'TOP_P4_02', skillId: 'SKL009' },
    { topicId: 'TOP_P4_02', skillId: 'SKL008' },

    { topicId: 'TOP_P4_03', skillId: 'SKL006' },
    { topicId: 'TOP_P4_03', skillId: 'SKL008' },

    { topicId: 'TOP_P4_04', skillId: 'SKL005' },
    { topicId: 'TOP_P4_04', skillId: 'SKL006' },
    { topicId: 'TOP_P4_04', skillId: 'SKL007' },
    { topicId: 'TOP_P4_04', skillId: 'SKL008' },

    { topicId: 'TOP_P4_05', skillId: 'SKL007' },
    { topicId: 'TOP_P4_05', skillId: 'SKL008' },

    { topicId: 'TOP_P4_06', skillId: 'SKL010' },
    { topicId: 'TOP_P4_06', skillId: 'SKL011' },

    { topicId: 'TOP_P4_07', skillId: 'SKL012' },

    { topicId: 'TOP_P4_08', skillId: 'SKL013' },

    { topicId: 'TOP_P4_09', skillId: 'SKL014' },

    { topicId: 'TOP_P4_10', skillId: 'SKL015' },

    { topicId: 'TOP_P5_01', skillId: 'SKL016' },
    { topicId: 'TOP_P5_02', skillId: 'SKL017' },
    { topicId: 'TOP_P5_03', skillId: 'SKL015' },
    { topicId: 'TOP_P5_04', skillId: 'SKL018' },
    { topicId: 'TOP_P5_05', skillId: 'SKL019' },
    { topicId: 'TOP_P5_06', skillId: 'SKL014' },
    { topicId: 'TOP_P5_07', skillId: 'SKL014' },
    { topicId: 'TOP_P5_08', skillId: 'SKL020' },

    { topicId: 'TOP_P6_01', skillId: 'SKL022' },
    { topicId: 'TOP_P6_02', skillId: 'SKL016' },
    { topicId: 'TOP_P6_03', skillId: 'SKL017' },
    { topicId: 'TOP_P6_04', skillId: 'SKL019' },
    { topicId: 'TOP_P6_04', skillId: 'SKL021' },
    { topicId: 'TOP_P6_05', skillId: 'SKL008' },
    { topicId: 'TOP_P6_06', skillId: 'SKL023' },
    { topicId: 'TOP_P6_07', skillId: 'SKL023' },
    { topicId: 'TOP_P6_08', skillId: 'SKL023' },
    { topicId: 'TOP_P6_09', skillId: 'SKL024' },
    { topicId: 'TOP_P6_10', skillId: 'SKL025' },
  ];

  await Promise.all(topicSkills.map(ts =>
    prisma.topicSkill.upsert({
      where: { topicId_skillId: { topicId: ts.topicId, skillId: ts.skillId } },
      update: {},
      create: ts,
    })
  ));

  console.log('✅ Seed completed for P4–P6');
}

main()
  .catch(e => {
    console.error('🔥 Error during seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
