const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const config = require('../config');
const { sendEmail } = require('../email');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, name, birthday } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'missing_fields' });
  if (password.length < 8) return res.status(400).json({ error: 'weak_password' });

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length) return res.status(409).json({ error: 'email_taken' });

  const hash = await bcrypt.hash(password, 12);
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await db.query(
    'INSERT INTO users (email, name, birthday) VALUES ($1, $2, $3) RETURNING id',
    [email.toLowerCase(), name, birthday || null]
  );
  await db.query(
    `INSERT INTO auth_identities (user_id, provider, provider_user_id, password_hash, verify_token, verify_expires)
     VALUES ($1, 'password', $2, $3, $4, $5)`,
    [user.rows[0].id, email.toLowerCase(), hash, token, expires]
  );

  const link = config.baseUrl + '/auth/verify?token=' + token;
  await sendEmail({
    to: email,
    subject: 'Confirm your email / Confirmez votre e-mail',
    text: 'Hello ' + name + ',\n\nConfirm your email: ' + link + '\n\nBonjour, confirmez votre e-mail : ' + link,
    html: '<p>Hello ' + name + ',</p><p><a href="' + link + '">Confirm your email</a></p><p><a href="' + link + '">Confirmez votre e-mail</a></p>',
  });
  res.json({ ok: true });
});

router.get('/verify', async (req, res) => {
  const { token } = req.query;
  const r = await db.query(
    `UPDATE auth_identities SET email_verified = true, verify_token = NULL
     WHERE verify_token = $1 AND verify_expires > now() RETURNING user_id`,
    [token]
  );
  if (!r.rows.length) return res.status(400).send('Invalid or expired link.');
  res.redirect('/login.html?verified=1');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const r = await db.query(
    `SELECT u.id, ai.password_hash, ai.email_verified
     FROM users u JOIN auth_identities ai ON ai.user_id = u.id AND ai.provider = 'password'
     WHERE u.email = $1`,
    [(email || '').toLowerCase()]
  );
  const row = r.rows[0];
  if (!row || !(await bcrypt.compare(password || '', row.password_hash)))
    return res.status(401).json({ error: 'bad_credentials' });
  if (!row.email_verified) return res.status(403).json({ error: 'email_not_verified' });
  req.session.userId = row.id;
  res.json({ ok: true });
});

router.post('/logout', (req, res) => req.session.destroy(() => res.json({ ok: true })));

router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'not_logged_in' });
  const r = await db.query('SELECT id, email, name, language FROM users WHERE id = $1', [req.session.userId]);
  res.json(r.rows[0]);
});

module.exports = { router };
