/**
 * create-admin.js — สร้าง admin user ครั้งแรก
 *
 * วิธีใช้:
 *   cd server
 *   node prisma/create-admin.js
 *
 * หรือระบุ username/password ผ่าน env:
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD=mypassword node prisma/create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const USERNAME  = process.env.ADMIN_USERNAME  || 'admin';
const PASSWORD  = process.env.ADMIN_PASSWORD  || 'admin1234';
const FIRSTNAME = process.env.ADMIN_FIRSTNAME || 'ผู้ดูแล';
const LASTNAME  = process.env.ADMIN_LASTNAME  || 'ระบบ';
const EMAIL     = process.env.ADMIN_EMAIL     || '';

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: USERNAME } });
  if (existing) {
    console.log(`⚠️  user "${USERNAME}" มีอยู่แล้ว (role: ${existing.role})`);
    if (existing.role !== 'admin') {
      await prisma.user.update({
        where: { username: USERNAME },
        data: { role: 'admin' }
      });
      console.log(`✅ อัปเดต role เป็น admin แล้ว`);
    }
    return;
  }

  const hashed = await bcrypt.hash(PASSWORD, 10);
  await prisma.user.create({
    data: {
      username:  USERNAME,
      password:  hashed,
      firstName: FIRSTNAME,
      lastName:  LASTNAME,
      email:     EMAIL,
      role:      'admin',
    }
  });

  console.log(`✅ สร้าง admin สำเร็จ`);
  console.log(`   username: ${USERNAME}`);
  console.log(`   password: ${PASSWORD}`);
  console.log(`⚠️  เปลี่ยนรหัสผ่านหลัง login ครั้งแรกด้วย`);
}

main()
  .catch(err => { console.error('❌', err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
