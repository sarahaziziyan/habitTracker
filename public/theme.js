// Light / dark theme. Default follows the OS; the user's choice is remembered.
(function () {
  try {
    var s = localStorage.getItem('theme');
    if (s === 'light' || s === 'dark') document.documentElement.setAttribute('data-theme', s);
  } catch (e) {}
})();

function currentTheme() {
  var a = document.documentElement.getAttribute('data-theme');
  if (a) return a;
  return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function themeIcon() {
  // Lucide line icons: moon (switch to dark) / sun (switch to light)
  return currentTheme() === 'dark'
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
}

function themeToggleHtml() {
  var label = (typeof t === 'function') ? t('theme') : 'Dark / light mode';
  return '<button type="button" class="icon-btn theme-btn" onclick="toggleTheme()" aria-label="' + label + '" title="' + label + '">' + themeIcon() + '</button>';
}

function toggleTheme() {
  var next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  document.querySelectorAll('.theme-btn').forEach(function (b) { b.innerHTML = themeIcon(); });
}
