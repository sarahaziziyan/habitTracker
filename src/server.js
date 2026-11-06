require('express-async-errors');   // lets async route errors reach the error handler
const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const path = require('path');

const config = require('./config');
const db = require('./db');
const auth = require('./auth');
const requireAuth = require('./middleware/requireAuth');

const app = express();
app.use(express.json());

app.use(session({
  store: new PgSession({ pool: db.pool, tableName: 'session' }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 },
}));

// Login module (swappable)
app.use('/auth', auth.router);

// Habit API (needs a logged-in user)
app.use('/api/habits', requireAuth, require('./routes/habitRoutes'));
app.use('/api/categories', requireAuth, require('./routes/categoryRoutes'));
app.use('/api/report', requireAuth, require('./routes/reportRoutes'));

// Language preference
app.put('/api/language', requireAuth, async (req, res) => {
  const lang = req.body.language === 'fr' ? 'fr' : 'en';
  await db.query('UPDATE users SET language = $1 WHERE id = $2', [lang, req.session.userId]);
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, '..', 'public')));

// Basic error handler so a failed query never crashes the server
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'server_error' });
});

app.listen(config.port, () => console.log('Habit Tracker on port ' + config.port));
