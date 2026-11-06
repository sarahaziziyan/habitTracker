async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && !location.pathname.match(/login|signup/)) {
    location.href = '/login.html';
    throw new Error('not_logged_in');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'error'), { data });
  return data;
}

async function logout() {
  await api('POST', '/auth/logout');
  location.href = '/login.html';
}

function headerHtml() {
  const p = location.pathname;
  const cls = (match) => 'btn' + (match ? ' active' : '');
  return '<h1>' + t('appName') + '</h1>' +
    '<a class="' + cls(p === '/' || p === '/index.html') + '" href="/">' + t('back') + '</a>' +
    '<a class="' + cls(p.indexOf('manage') >= 0) + '" href="/manage.html">' + t('manage') + '</a>' +
    '<a class="' + cls(p.indexOf('report') >= 0) + '" href="/report.html">' + t('report') + '</a>' +
    langSwitcherHtml() +
    themeToggleHtml() +
    '<button onclick="logout()">' + t('logout') + '</button>';
}

// Month/year helpers. Month is 1-12.
function nowYM() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}
function pad2(n) { return String(n).padStart(2, '0'); }
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}
function prevYM(y, m) { return m === 1 ? { year: y - 1, month: 12 } : { year: y, month: m - 1 }; }

// Read ?year=&month= from the URL, defaulting to the current month.
function getYM() {
  const p = new URLSearchParams(location.search);
  const n = nowYM();
  return { year: Number(p.get('year')) || n.year, month: Number(p.get('month')) || n.month };
}

// Month + year pickers. Calls onChange({year, month}) when either changes.
function renderPickers(el, ym, onChange) {
  const n = nowYM();
  let yearOpts = '';
  for (let y = n.year - 5; y <= n.year + 1; y++)
    yearOpts += '<option value="' + y + '"' + (y === ym.year ? ' selected' : '') + '>' + y + '</option>';
  let monthOpts = '';
  I18N[currentLang].months.forEach((name, i) => {
    monthOpts += '<option value="' + (i + 1) + '"' + (i + 1 === ym.month ? ' selected' : '') + '>' + name + '</option>';
  });
  el.innerHTML =
    '<label>' + t('year') + ' <select id="yearSel">' + yearOpts + '</select></label>' +
    '<label>' + t('month') + ' <select id="monthSel">' + monthOpts + '</select></label>' +
    '<button id="todayBtn">' + t('today') + '</button>';
  const fire = () => onChange({
    year: Number(document.getElementById('yearSel').value),
    month: Number(document.getElementById('monthSel').value),
  });
  document.getElementById('yearSel').onchange = fire;
  document.getElementById('monthSel').onchange = fire;
  document.getElementById('todayBtn').onclick = () => onChange(nowYM());
}
