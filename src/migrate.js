// Small, safe database updates that run every time the server starts.
// Each statement is idempotent (IF NOT EXISTS), so running it again changes nothing.
// db/schema.sql only runs when the database is first created, so changes for
// databases that already exist belong here.
const db = require('./db');

module.exports = async function migrate() {
  // Card order and pinning on the home page
  await db.query('ALTER TABLE habits ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0');
  await db.query('ALTER TABLE habits ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false');
};
