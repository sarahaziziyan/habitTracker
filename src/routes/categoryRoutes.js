const express = require('express');
const svc = require('../services/habitService');
const router = express.Router();

router.get('/', async (req, res) => {
  res.json(await svc.listCategories(req.session.userId));
});

router.post('/', async (req, res) => {
  const { name, color } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'missing_name' });
  res.json(await svc.createCategory(req.session.userId, name, color));
});

router.delete('/:id', async (req, res) => {
  await svc.deleteCategory(req.session.userId, Number(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
