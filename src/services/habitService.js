const db = require('../db');

async function listCategories(userId) {
  const r = await db.query(
    'SELECT id, name, color FROM categories WHERE user_id = $1 ORDER BY name', [userId]);
  return r.rows;
}

async function createCategory(userId, name, color) {
  const r = await db.query(
    `INSERT INTO categories (user_id, name, color) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, name) DO UPDATE SET color = EXCLUDED.color
     RETURNING id, name, color`,
    [userId, name.trim(), color || '#5b8def']);
  return r.rows[0];
}

async function deleteCategory(userId, id) {
  await db.query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
}

// All habits for one month, with the days that are checked off.
async function listHabitsForMonth(userId, year, month, includeArchived) {
  const habits = await db.query(
    `SELECT h.id, h.title, h.archived, h.category_id,
            c.name AS category_name, c.color AS category_color
     FROM habits h LEFT JOIN categories c ON c.id = h.category_id
     WHERE h.user_id = $1 AND h.year = $2 AND h.month = $3
       AND ($4 OR h.archived = false)
     ORDER BY c.name NULLS LAST, h.title`,
    [userId, year, month, !!includeArchived]);

  const ids = habits.rows.map(h => h.id);
  let byHabit = {};
  if (ids.length) {
    const ci = await db.query(
      `SELECT habit_id, to_char(day, 'YYYY-MM-DD') AS day
       FROM check_ins WHERE habit_id = ANY($1)`, [ids]);
    for (const row of ci.rows) {
      (byHabit[row.habit_id] = byHabit[row.habit_id] || []).push(row.day);
    }
  }
  return habits.rows.map(h => ({ ...h, days: byHabit[h.id] || [] }));
}

async function createHabit(userId, { title, categoryId, year, month }) {
  const r = await db.query(
    `INSERT INTO habits (user_id, category_id, title, year, month)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, year, month, title) DO NOTHING
     RETURNING id`,
    [userId, categoryId || null, title.trim(), year, month]);
  return r.rows[0] || null;
}

async function updateHabit(userId, id, { title, categoryId, archived }) {
  await db.query(
    `UPDATE habits SET
       title = COALESCE($3, title),
       category_id = CASE WHEN $4::boolean THEN $5 ELSE category_id END,
       archived = COALESCE($6, archived)
     WHERE id = $1 AND user_id = $2`,
    [id, userId, title ? title.trim() : null,
     categoryId !== undefined, categoryId === undefined ? null : categoryId,
     archived === undefined ? null : archived]);
}

// Deletes ONE habit in ONE month (its check-ins go with it). Other months stay.
async function deleteHabit(userId, id) {
  await db.query('DELETE FROM habits WHERE id = $1 AND user_id = $2', [id, userId]);
}

// Check or uncheck a day. Future days are refused.
async function setCheckIn(userId, habitId, day, checked) {
  const owns = await db.query(
    'SELECT year, month FROM habits WHERE id = $1 AND user_id = $2', [habitId, userId]);
  if (!owns.rows.length) return { error: 'not_found' };

  const { year, month } = owns.rows[0];
  const d = new Date(day + 'T00:00:00Z');
  if (isNaN(d) || d.getUTCFullYear() !== year || d.getUTCMonth() + 1 !== month)
    return { error: 'day_not_in_month' };

  const today = new Date().toISOString().slice(0, 10);
  if (day > today) return { error: 'future_day' };

  if (checked) {
    await db.query(
      'INSERT INTO check_ins (habit_id, day) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [habitId, day]);
  } else {
    await db.query('DELETE FROM check_ins WHERE habit_id = $1 AND day = $2', [habitId, day]);
  }
  return { ok: true };
}

// Copy habits (title + category, no check-ins) from one month to another.
async function copyMonth(userId, from, to) {
  const r = await db.query(
    `INSERT INTO habits (user_id, category_id, title, year, month)
     SELECT user_id, category_id, title, $4, $5 FROM habits
     WHERE user_id = $1 AND year = $2 AND month = $3 AND archived = false
     ON CONFLICT (user_id, year, month, title) DO NOTHING
     RETURNING id`,
    [userId, from.year, from.month, to.year, to.month]);
  return { copied: r.rows.length };
}

module.exports = {
  listCategories, createCategory, deleteCategory,
  listHabitsForMonth, createHabit, updateHabit, deleteHabit,
  setCheckIn, copyMonth,
};
