require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding parentQuestionId to Question...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Question"
    ADD COLUMN IF NOT EXISTS "parentQuestionId" TEXT REFERENCES "Question"("id") ON DELETE SET NULL;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Question_parentQuestionId_idx"
    ON "Question"("parentQuestionId");
  `);

  console.log('Adding mock tracking fields to ExamSetMetadata...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ExamSetMetadata"
    ADD COLUMN IF NOT EXISTS "mockGeneratedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "mockQuestionCount" INTEGER;
  `);

  console.log('✅ Migration complete.');

  // ตรวจสอบ
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name IN ('Question', 'ExamSetMetadata')
      AND column_name IN ('parentQuestionId', 'mockGeneratedAt', 'mockQuestionCount')
    ORDER BY table_name, column_name;
  `;
  console.log('Verified columns:', cols);
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
