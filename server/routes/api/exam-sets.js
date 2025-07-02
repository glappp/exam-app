// server/routes/api/exam-sets.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const sets = await prisma.examSetMetadata.findMany({
      orderBy: { year: 'desc' }
    });
    res.json(sets);
  } catch (e) {
    console.error('🔥 Error loading exam sets:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
