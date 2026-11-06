const { listHabitsForMonth } = require('./habitService');
const { computeStats, lastCountedDay } = require('./statsService');

function previousMonth(year, month) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

function weekdayStats(habits, year, month) {
  // Index 0 = Monday ... 6 = Sunday
  const done = [0, 0, 0, 0, 0, 0, 0];
  const possible = [0, 0, 0, 0, 0, 0, 0];
  const counted = lastCountedDay(year, month);
  for (let d = 1; d <= counted; d++) {
    const wd = (new Date(Date.UTC(year, month - 1, d)).getUTCDay() + 6) % 7;
    possible[wd] += habits.length;
  }
  for (const h of habits) {
    for (const day of h.days) {
      const d = Number(day.slice(8, 10));
      if (d > counted) continue;
      const wd = (new Date(Date.UTC(year, month - 1, d)).getUTCDay() + 6) % 7;
      done[wd]++;
    }
  }
  return done.map((n, i) => ({
    weekday: i, done: n, possible: possible[i],
    percent: possible[i] ? Math.round((n / possible[i]) * 100) : 0,
  }));
}

async function buildReport(userId, year, month) {
  const habits = await listHabitsForMonth(userId, year, month, false);
  const rows = habits.map(h => ({
    id: h.id, title: h.title, category: h.category_name, color: h.category_color,
    ...computeStats(year, month, h.days),
  }));

  const prev = previousMonth(year, month);
  const prevHabits = await listHabitsForMonth(userId, prev.year, prev.month, false);
  const prevByTitle = {};
  for (const h of prevHabits) prevByTitle[h.title] = computeStats(prev.year, prev.month, h.days).percent;
  for (const r of rows) {
    r.previousPercent = prevByTitle[r.title] === undefined ? null : prevByTitle[r.title];
    r.change = r.previousPercent === null ? null : r.percent - r.previousPercent;
  }

  const sorted = [...rows].sort((a, b) => b.percent - a.percent);
  const wd = weekdayStats(habits, year, month);
  const wdSorted = wd.filter(x => x.possible > 0).sort((a, b) => b.percent - a.percent);

  const categories = {};
  for (const r of rows) {
    const key = r.category || '';
    categories[key] = categories[key] || { name: key, done: 0, possible: 0 };
    categories[key].done += r.done;
    categories[key].possible += r.countedDays;
  }

  const totalDone = rows.reduce((s, r) => s + r.done, 0);
  const totalPossible = rows.reduce((s, r) => s + r.countedDays, 0);

  return {
    year, month,
    overallPercent: totalPossible ? Math.round((totalDone / totalPossible) * 100) : 0,
    habits: rows,
    best: sorted[0] || null,
    worst: sorted.length > 1 ? sorted[sorted.length - 1] : null,
    neverDone: rows.filter(r => r.done === 0).map(r => r.title),
    bestStreak: [...rows].sort((a, b) => b.longestStreak - a.longestStreak)[0] || null,
    strongestWeekday: wdSorted[0] || null,
    weakestWeekday: wdSorted[wdSorted.length - 1] || null,
    weekdays: wd,
    categories: Object.values(categories).map(c => ({
      ...c, percent: c.possible ? Math.round((c.done / c.possible) * 100) : 0,
    })),
    mostImproved: [...rows].filter(r => r.change !== null).sort((a, b) => b.change - a.change)[0] || null,
    mostDeclined: [...rows].filter(r => r.change !== null).sort((a, b) => a.change - b.change)[0] || null,
  };
}

module.exports = { buildReport };
