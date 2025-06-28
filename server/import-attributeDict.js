const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('attributeDict.json', 'utf8'));

  for (const [key, value] of Object.entries(data)) {
    const { type, th, en, grade = null } = value;

    await prisma.attributeDictionary.upsert({
      where: { key },
      update: { type, th, en, grade },
      create: { key, type, th, en, grade }
    });
  }

  console.log('✅ Attribute Dictionary imported successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
