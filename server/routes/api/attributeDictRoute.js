const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/attribute-dict', async (req, res) => {
  try {
    const all = await prisma.attributeDictionary.findMany();
    const dict = {};
    all.forEach(item => {
      dict[item.key] = item.labelTh;
    });
    res.json(dict);
  } catch (err) {
    console.error('โหลด attributeDictionary ผิดพลาด:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
