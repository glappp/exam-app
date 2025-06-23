// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.examSetMetadata.create({
    data: {
      examType: "chulabhorn",
      year: "2566",
      grade: "p6",
      questionCount: 40,
      timeLimitSec: 3600,
      isOfficial: true
    }
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
