function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function pad(n) { return String(n).padStart(2, '0'); }

function todayString() { return new Date().toISOString().slice(0, 10); }

// Last day that counts: today for the current month, last day for past months,
// none for future months.
function lastCountedDay(year, month) {
  const total = daysInMonth(year, month);
  const today = todayString();
  const first = year + '-' + pad(month) + '-01';
  const last = year + '-' + pad(month) + '-' + pad(total);
  if (today < first) return 0;
  if (today > last) return total;
  return Number(today.slice(8, 10));
}

function computeStats(year, month, checkedDays) {
  const total = daysInMonth(year, month);
  const counted = lastCountedDay(year, month);
  const set = new Set(checkedDays.map(d => Number(d.slice(8, 10))));

  let longest = 0, run = 0;
  for (let d = 1; d <= counted; d++) {
    if (set.has(d)) { run++; longest = Math.max(longest, run); } else { run = 0; }
  }

  // Current streak: counted back from today (or the last counted day).
  // If today is not checked yet, the streak is not broken until tomorrow.
  let current = 0;
  let d = counted;
  if (d > 0 && !set.has(d) && year + '-' + pad(month) + '-' + pad(d) === todayString()) d--;
  for (; d >= 1 && set.has(d); d--) current++;

  const done = [...set].filter(x => x <= counted).length;
  return {
    done,
    totalDays: total,
    countedDays: counted,
    percent: counted ? Math.round((done / counted) * 100) : 0,
    currentStreak: current,
    longestStreak: longest,
  };
}

module.exports = { computeStats, daysInMonth, lastCountedDay };
