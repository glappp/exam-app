// server/routes/api/attributeDictRoute.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

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

module.exports = router;
