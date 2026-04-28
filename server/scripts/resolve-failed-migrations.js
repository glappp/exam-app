/**
 * resolve-failed-migrations.js
 * รันก่อน prisma migrate deploy เพื่อ mark migration ที่ fail ว่า rolled_back
 * ทำให้ Prisma ยอม deploy migration ใหม่ต่อได้
 *
 * ปลอดภัย: update เฉพาะ row ที่ failed จริง (finished_at IS NULL AND rolled_back_at IS NULL)
 * ถ้าไม่มี row ที่ตรงเงื่อนไข → ไม่ทำอะไร
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$executeRaw`
      UPDATE "_prisma_migrations"
      SET    "rolled_back_at" = NOW()
      WHERE  "finished_at"    IS NULL
        AND  "rolled_back_at" IS NULL
    `;
    if (result > 0) {
      console.log(`✅ Resolved ${result} failed migration(s)`);
    } else {
      console.log('✅ No failed migrations to resolve');
    }
  } catch (e) {
    // _prisma_migrations ยังไม่มี (first deploy) หรือ error อื่น → ปล่อยผ่าน
    console.log('ℹ️  resolve-failed-migrations skipped:', e.message);
  }
}

main().finally(() => prisma.$disconnect());
