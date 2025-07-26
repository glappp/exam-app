import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/attributeDict.json', async (req, res) => {
  try {
    const items = await prisma.attributeDictionary.findMany();
    res.json(items);
  } catch (err) {
    console.error("❌ Error loading attribute dictionary:", err);
    res.status(500).json({ error: 'โหลด attribute dictionary ไม่สำเร็จ' });
  }
});

export default router;
