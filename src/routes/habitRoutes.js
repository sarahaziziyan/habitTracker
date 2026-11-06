const express = require('express');
const svc = require('../services/habitService');
const { computeStats } = require('../services/statsService');
const router = express.Router();

function parseYM(q) {
  const now = new Date();
  const year = Number(q.year) || now.getUTCFullYear();
  const month = Number(q.month) || now.getUTCMonth() + 1;
  return { year, month };
}

// GET /api/habits?year=2026&month=11  (defaults to the current month)
router.get('/', async (req, res) => {
  const { year, month } = parseYM(req.query);
  const includeArchived = req.query.archived === '1';
  const habits = await svc.listHabitsForMonth(req.session.userId, year, month, includeArchived);
  res.json({
    year, month,
    habits: habits.map(h => ({ ...h, stats: computeStats(year, month, h.days) })),
  });
});

router.post('/', async (req, res) => {
  const { title, categoryId } = req.body;
  const { year, month } = parseYM(req.body);
  if (!title || !title.trim()) return res.status(400).json({ error: 'missing_title' });
  const created = await svc.createHabit(req.session.userId, { title, categoryId, year, month });
  if (!created) return res.status(409).json({ error: 'duplicate_title' });
  res.json(created);
});

router.patch('/:id', async (req, res) => {
  await svc.updateHabit(req.session.userId, Number(req.params.id), req.body);
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await svc.deleteHabit(req.session.userId, Number(req.params.id));
  res.json({ ok: true });
});

// PUT /api/habits/:id/check  body: { day: '2026-11-06', checked: true }
router.put('/:id/check', async (req, res) => {
  const { day, checked } = req.body;
  const result = await svc.setCheckIn(req.session.userId, Number(req.params.id), day, !!checked);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

// POST /api/habits/copy  body: { fromYear, fromMonth, toYear, toMonth }
router.post('/copy', async (req, res) => {
  const { fromYear, fromMonth, toYear, toMonth } = req.body;
  const out = await svc.copyMonth(
    req.session.userId,
    { year: Number(fromYear), month: Number(fromMonth) },
    { year: Number(toYear), month: Number(toMonth) });
  res.json(out);
});

module.exports = router;
