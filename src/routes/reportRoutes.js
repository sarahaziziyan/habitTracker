const express = require('express');
const { buildReport } = require('../services/reportService');
const router = express.Router();

// GET /api/report?year=2026&month=10
router.get('/', async (req, res) => {
  const now = new Date();
  const year = Number(req.query.year) || now.getUTCFullYear();
  const month = Number(req.query.month) || now.getUTCMonth() + 1;
  res.json(await buildReport(req.session.userId, year, month));
});

// GET /api/report/history  -> one summary row per month that has habits
router.get('/history', async (req, res) => {
  const db = require('../db');
  const r = await db.query(
    `SELECT h.year, h.month, COUNT(DISTINCT h.id)::int AS habits, COUNT(ci.day)::int AS check_ins
     FROM habits h LEFT JOIN check_ins ci ON ci.habit_id = h.id
     WHERE h.user_id = $1
     GROUP BY h.year, h.month ORDER BY h.year DESC, h.month DESC`,
    [req.session.userId]);
  res.json(r.rows);
});

module.exports = router;
