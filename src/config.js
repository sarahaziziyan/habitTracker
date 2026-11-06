module.exports = {
  port: process.env.PORT || 3000,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret',
  authProvider: process.env.AUTH_PROVIDER || 'password',
  emailProvider: process.env.EMAIL_PROVIDER || 'mailpit',
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT || 1025),
    from: process.env.MAIL_FROM || 'Habit Tracker <no-reply@habits.local>',
  },
};
