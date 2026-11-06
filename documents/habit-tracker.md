# Habit Tracker: Documentation

A web-based monthly habit tracker. Every habit gets one card per month, with a calendar grid. You click a day to check it off. The app shows streaks and completion percentages, and has an end-of-month report. It supports several users, English and French, and light and dark mode.

This document explains what the app does, how to run it, how it is built, and how to change it. It does not contain the source code. The code lives in the project folder.

---

## 1. Features at a glance

| Area | What you get |
|---|---|
| Monthly cards | One card per habit per month: a solid title bar in the category colour, Monday-first weekday headers, and a day grid. Days from the neighbouring months are greyed out. |
| Checking days | Click a day to check it, click again to uncheck. Future days are locked. |
| Card order and pinning | Drag cards into any order by their title bar, and pin habits so they stay at the top. The order is saved per month. |
| Statistics | Per card: current streak, longest streak, and completion percentage. |
| Months | The app opens on the current month. Year and month pickers (and a Today button) let you browse past months. |
| Manage page | Create, rename, archive, un-archive and delete habits. Create and delete categories. |
| Categories | Each habit has one category, created by you. The category name and colour appear on the card. |
| Copy habits | Copy the habits of any month into any other month (titles and categories only, no check-ins, no duplicates). |
| Report | An in-app end-of-month report (see section 6). Nothing is emailed. |
| Accounts | Sign-up with name, email, password and an optional birthday. Login is blocked until the email address is verified through a link. |
| Languages | English and French. The choice is remembered. |
| Appearance | Light and dark mode. It follows the computer's setting by default, and your choice is remembered. |

---

## 2. Running the app

### What you need
- Docker Desktop (it includes Docker Compose).
- A code editor such as VS Code is optional.

### First start
In the project folder:

```
docker compose up --build
```

This starts three containers:

| Container | Purpose | Address |
|---|---|---|
| `app` | The Node.js web application | http://localhost:3000 |
| `db` | PostgreSQL 16, the database | internal only |
| `mailpit` | A fake mail server that catches every email the app sends | http://localhost:8025 |

On the very first start, Postgres creates the tables automatically from `db/schema.sql`.

### Everyday use
- Start in the background: `docker compose up -d`
- Stop: `docker compose down`
- See the app's log: `docker compose logs app`
- See the database's log: `docker compose logs db`

### Keeping and resetting your data
Your data lives in a Docker volume named `pgdata`. It survives stopping, restarting and rebuilding. Docker prefixes the volume name with the project name, and `docker-compose.yml` pins that name to `habittracker`, so the volume is always `habittracker_pgdata`, even if you rename or move the project folder. (Without the pin, Docker uses the folder name, so renaming the folder silently creates a new, empty database and leaves the old one behind.) You can list volumes with `docker volume ls`.

> **Warning:** `docker compose down -v` deletes that volume and all accounts and habits with it. Use it only when you want to start from a completely empty database. It is also the way to re-run `db/schema.sql` from scratch.

### First-time sign-up
1. Open http://localhost:3000/signup.html and create an account.
2. No real email is sent. Open http://localhost:8025 (Mailpit), open the "Confirm your email" message and click the link.
3. You are sent to the login page and can log in.

### Backing up and restoring

Make a backup of the whole database to a file (run in the project folder, with the app running):

```
docker compose exec -T db pg_dump -U habit habit > backup.sql
```

Restore a backup into an empty database:

```
docker compose exec -T db psql -U habit habit < backup.sql
```

Backups are plain SQL files. Keep them somewhere safe, not inside the git repository (`*.sql` files other than `db/schema.sql` should not be committed).

---

## 3. Using the app

**Month view (home page).** Shows one card per active habit for the selected month. Use the pickers to change the month and year, or Today to jump back. Click a day on a card to check it. A day that is checked is filled with the card's colour and shows a tick. Today is outlined. Future days are dashed and cannot be checked.

**Each card shows**
- the habit title at the top left (the whole title bar is the drag area, and the mouse pointer turns into a hand over it)
- the category in a pill at the top right (long names are shortened with "…", and hovering shows the full name), followed by a pin button
- three boxes at the bottom: Current streak, Longest, and Completion

**Reordering and pinning.** Drag a card by its title bar (the pointer turns into a hand) to move it. Cards snap into place as you drag, and the new order is saved when you let go. With the keyboard, Tab to a card's title bar and press the arrow keys. The pin button at the right of the title bar pins a habit: pinned cards always appear first, in their own group, and the pin button toggles it off again. Cards can be moved within their own group (pinned or not); to move a card to the other group, pin or unpin it. The order is stored per month, so each month has its own arrangement. The same order can be changed on the Manage page (see below), and both pages always show the same order. New habits are added at the end, and "Copy habits" keeps the order and pins of the source month. Dragging uses the browser's drag and drop, which works with a mouse or trackpad but not yet by touch on phones and tablets; the arrow keys work everywhere there is a keyboard.

**Manage page.** Add a category (name and colour) and add a habit (title and category) for the month you have selected. A **Copy habits** panel copies habits between months (see below). In the table you can drag a row by the grip handle at its left (or Tab to the handle and use the arrow keys) to reorder habits, which changes their order on the Home page too, click the **Title** or **Category** header to sort A to Z (click again for Z to A; habits without a category go last, and pinned habits stay on top; the sorted order is saved, so Home follows it), pin or unpin a habit, rename a habit, change its category, archive it (hide it from the month view, reversible) or delete it. Deleting or archiving a habit only affects the month it belongs to; the same habit in other months is untouched.

**Copy habits.** On the Manage page, the **Copy habits** panel has a From month and year and a To month and year. It starts prefilled with the previous month and the month you are managing, so the common case is one click. You can choose any two different months. Archived habits are not copied. Habits that already exist in the destination (same title) are skipped, so copying twice is safe. Check-ins are never copied. If you copy into a month other than the one you are managing, a link lets you jump there.

**Report page.** The monthly report and the month-by-month history. See section 6.

**Language and theme.** The language switcher and the sun/moon button are in the top bar and on the login and sign-up pages.

---

## 4. How it is built

### Overview

```
Browser (plain HTML, CSS and JavaScript)
   |  fetch() calls with a session cookie
   v
Express server (Node.js)
   |-- /auth/*          login module (swappable)
   |-- /api/habits      habits and check-ins
   |-- /api/categories  categories
   |-- /api/report      report and history
   |-- /api/language    saves the language preference
   |-- static files     the pages in public/
   |
   |-- email module (swappable) ---> Mailpit (SMTP, local)
   v
PostgreSQL
```

There is no front-end build step and no framework. The pages are static files. The server only returns JSON.

### Technology
- **Server:** Node.js 20 and Express 4. `express-async-errors` makes errors in async routes reach the error handler, so one failed query cannot crash the server.
- **Database:** PostgreSQL 16, accessed with the `pg` package.
- **Sessions:** `express-session` with `connect-pg-simple`, so sessions are stored in the database (the `session` table) and survive restarts. The cookie is HttpOnly and SameSite=Lax and lasts 30 days.
- **Passwords:** hashed with `bcryptjs` (cost 12). Plain passwords are never stored.
- **Email:** `nodemailer`.
- **Packaging:** Docker and Docker Compose.

### Folder structure

| Path | Purpose |
|---|---|
| `docker-compose.yml` | Defines the app, database and Mailpit containers. Also mounts `public/` into the app container, so front-end edits show up on a browser refresh. |
| `Dockerfile` | Builds the app image (Node 20 on Alpine Linux). |
| `.env`, `.env.example` | Settings (see section 7). `.env` is private and not committed. |
| `db/schema.sql` | The table definitions, run once when the database is first created. |
| `src/server.js` | Starts Express, sessions, routes and the error handler. |
| `src/config.js` | Reads settings from environment variables. |
| `src/db.js` | The database connection. |
| `src/auth/` | The login module: `index.js` picks the provider, `passwordProvider.js` implements email and password login. |
| `src/email/` | The email module: `index.js` picks the provider, plus the Mailpit and console providers. |
| `src/middleware/requireAuth.js` | Rejects API requests from people who are not logged in. |
| `src/services/` | The logic: `habitService.js` (habits, categories, check-ins, copy), `statsService.js` (streaks and percentages), `reportService.js` (the report). |
| `src/routes/` | The API endpoints, which call the services. |
| `public/` | The front end: pages, `style.css` (design), `app.js` (shared helpers), `i18n.js` (translations), `theme.js` (light/dark). |
| `documents/` | Project documentation (this file). |

### Data model

All tables are created by `db/schema.sql`.

- **users**: id, email (unique), name, optional birthday, language (`en` or `fr`), created time.
- **auth_identities**: one row per way a user can log in. Today that is `password`. It holds the password hash, whether the email is verified, and the verification token with its expiry. Keeping this separate from `users` is what makes it possible to add Google login later without changing the users table.
- **categories**: belong to a user. A name (unique per user) and a colour.
- **habits**: belong to a user, and to **one specific month** (year and month columns). Each habit has a title, an optional category, an archived flag, a `pinned` flag and a `position` (its place in the card order). The same title can appear only once per user per month.
- **check_ins**: one row per checked day, linked to a habit.
- **session**: login sessions, managed by the session library.

A key design decision: **a habit belongs to a single month.** That is why deleting or archiving only affects that month, and why "copy from previous month" exists. It matches the spreadsheet this app replaces, where each month is its own set of cards.

Deleting a user removes their categories, habits and check-ins. Deleting a category leaves its habits in place, with no category.

---

## 5. Rules for days, streaks and percentages

These rules are in `src/services/statsService.js`.

- **Counted days.** For the current month, days from the 1st up to today count. For a past month, all days count. For a future month, no days count.
- **Completion %.** Checked days divided by counted days, rounded to a whole number. A future month shows 0%.
- **Longest streak.** The longest run of consecutive checked days within the counted days.
- **Current streak.** The run of consecutive checked days ending today. If today is not checked yet, the streak is **not** broken: it is counted up to yesterday, because the day is not over.
- **Future days** cannot be checked. The page shows them locked, and the server rejects the request too.
- **Week start.** Weeks start on Monday everywhere (calendar, report).

---

## 6. The monthly report

Open the Report page and choose a month. It shows:

- **Overall completion** across all habits that month.
- **Best and weakest habit**, by completion %.
- **Best streak**, the habit with the longest run.
- **Strongest and weakest weekday**, which days of the week you do best and worst on across all habits.
- **Most improved and most declined** compared with the previous month (habits are matched by title).
- **Never done**, habits with no check-ins at all.
- A **table of all habits** with done days, percentage, longest streak and the change against last month.
- **Category totals**, the completion % per category.
- **History**, one row per month that has habits, with the number of habits and check-ins, linking to that month's report.

The report is computed in `src/services/reportService.js` each time the page is opened. Nothing is stored or emailed.

---

## 7. Configuration

Settings come from environment variables, set in the `.env` file. `.env.example` is the template.

| Setting | Meaning | Default / example |
|---|---|---|
| `PORT` | Port the app listens on | `3000` |
| `BASE_URL` | The public address of the app. It is used to build the link in verification emails. | `http://localhost:3000` |
| `DATABASE_URL` | Database connection | `postgres://habit:habit@db:5432/habit` |
| `SESSION_SECRET` | Secret used to sign the login cookie. Use a long random string. Never share or commit it. | generated for you |
| `AUTH_PROVIDER` | Which login module to use | `password` |
| `EMAIL_PROVIDER` | Which email module to use | `mailpit` (or `console`) |
| `SMTP_HOST`, `SMTP_PORT` | Mail server for the Mailpit provider | `mailpit`, `1025` |
| `MAIL_FROM` | The "From" address of emails | `Habit Tracker <no-reply@habits.local>` |

After you change `.env`, restart with `docker compose up -d` so the app picks it up.

---

## 8. The two swappable modules

The login system and the email system are each hidden behind a small "contract". That is what lets you switch implementations later by changing a setting, without touching the rest of the app.

### Email module (`src/email/`)

**Contract:** a provider exports a `send({ to, subject, text, html })` function that returns a promise.

Included providers:
- `mailpit`: sends to the local fake mail server, which you read at http://localhost:8025.
- `console`: just prints the email in the app's log. Useful for quick tests.

**To use a real email service later** (for example Amazon SES or Resend): add a new provider file with the same `send` function, register it in `src/email/index.js` under a new name, add its credentials to `.env`, and set `EMAIL_PROVIDER` to that name. Nothing else changes.

### Login module (`src/auth/`)

**Contract:** a provider exports an Express router, which is mounted at `/auth`. On a successful login it must set `req.session.userId`. Everything else in the app only cares about that session value.

The included provider, `password`, handles:
- `POST /auth/signup`: validates the input, hashes the password, stores the user and a verification token (valid for 24 hours), and sends the verification email.
- `GET /auth/verify?token=...`: marks the email as verified and redirects to the login page.
- `POST /auth/login`: checks the password. A wrong email or password gives a 401 response. A correct password with an unverified email gives a 403.
- `POST /auth/logout` and `GET /auth/me`.

**To add Google login later:** add a `google` provider that finds or creates the user, adds an `auth_identities` row with provider `google`, and sets `req.session.userId`. Register it in `src/auth/index.js` and set `AUTH_PROVIDER`.

---

## 9. API reference

All `/api/...` endpoints need a logged-in session and return JSON. `year` and `month` default to the current month. Months are numbered 1 to 12.

| Method and path | Purpose |
|---|---|
| `GET /api/habits?year=&month=` | The habits of a month with their checked days and statistics. Add `&archived=1` to include archived habits. |
| `POST /api/habits` | Create a habit. Body: `title`, `categoryId`, `year`, `month`. Returns 409 if the title already exists that month. |
| `PATCH /api/habits/:id` | Change a habit's `title`, `categoryId`, `archived` or `pinned`. |
| `PUT /api/habits/order` | Save the card order of a month. Body: `year`, `month`, `ids` (habit ids in display order). Habits are listed pinned first, then by this order. |
| `DELETE /api/habits/:id` | Delete a habit (that month only). |
| `PUT /api/habits/:id/check` | Check or uncheck a day. Body: `day` (`YYYY-MM-DD`) and `checked` (true or false). |
| `POST /api/habits/copy` | Copy habits from any month to any other month. Body: `fromYear`, `fromMonth`, `toYear`, `toMonth`. Returns `copied` (new habits created) and `found` (habits in the source month). Returns 400 for an invalid or identical month. |
| `GET /api/categories` | List the user's categories. |
| `POST /api/categories` | Create a category. Body: `name`, `color`. |
| `DELETE /api/categories/:id` | Delete a category. |
| `GET /api/report?year=&month=` | The monthly report. |
| `GET /api/report/history` | One summary row per month that has habits. |
| `PUT /api/language` | Save the language preference (`en` or `fr`). |

Every query is limited to the logged-in user's own data, so users cannot see each other's habits.

---

## 10. The front end

- **Pages:** `index.html` (month view), `manage.html`, `report.html`, `login.html`, `signup.html`. Each page loads the shared scripts and renders itself with JavaScript.
- **`app.js`:** shared helpers: the `api()` function for server calls (it redirects to the login page when you are logged out), the top bar, and the month and year pickers.
- **`i18n.js`:** all English and French text. To change a label or add a language, edit this file. Missing French text falls back to English.
- **`theme.js`:** light and dark mode. It runs before the page paints so there is no flash. The choice is stored in the browser.
- **`style.css`:** the whole look, built on the Habit Tracker design system: design tokens (colours, spacing, radii, shadows) are defined once as CSS variables for light and dark, and every component uses those variables rather than fixed colours. To change the look of the whole app, change the tokens at the top of this file.
- **Category colours** are chosen by the user. The page picks white or dark text automatically, depending on how light the colour is, so text stays readable.

---

## 11. Changing things

- **Front-end changes** (anything in `public/`): save the file and refresh the browser (Cmd+Shift+R to bypass the cache). No rebuild is needed, because the folder is mounted into the container.
- **Server changes** (anything in `src/`): rebuild and restart with `docker compose up -d --build`.
- **Database changes:** `db/schema.sql` only runs when the database is first created, so changes for a database that already exists go into `src/migrate.js`. It runs every time the server starts, and each statement uses `IF NOT EXISTS`, so it is safe to run repeatedly (this is how the `pinned` and `position` columns were added without touching existing data). For a change on an existing database, run an `ALTER TABLE` statement manually, or (if you do not mind losing the data) reset with `docker compose down -v`. Before the app has real users it is fine to reset; once it has, use proper migrations.
- **Adding a language:** add a new dictionary in `i18n.js` and a button in the language switcher.

---

## 12. Testing checklist

Go through this after significant changes.

1. Sign up, find the email in Mailpit, click the link, and log in.
2. Logging in before verifying is refused.
3. Create two categories, then create habits in them.
4. Check and uncheck days. A card's streak and percentage update.
   Drag a card to a new place and reload the page: the order is kept. Pin a card: it moves to the top and stays there after a reload. Unpin it again.
5. Future days cannot be checked.
6. Stop and restart with `docker compose down` then `up`. Everything is still there.
7. Switch to a past month and back. Today returns to the current month.
8. Copy habits between two months (including a month other than the one you are managing). Copying twice adds nothing new, and copying from an empty month says so.
9. Delete a habit in one month. The same habit in another month remains.
10. Archive and un-archive a habit.
11. Open the report and check the numbers by hand for one habit.
12. Switch language to French and back, and light and dark mode.
13. Create a second account. It sees none of the first account's data.

---

## 13. Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Sign-up returns HTTP 500 and `docker compose logs app` shows `relation "users" does not exist` | The database was created before the schema file existed. Reset it once with `docker compose down -v` and then `docker compose up --build`. This deletes data. |
| Login returns 401 | No account matches that email and password. The database may have been reset, so sign up again. |
| Login returns 403 | The account exists but its email is not verified. Open http://localhost:8025 and click the link. |
| No verification email appears | Check Mailpit at http://localhost:8025. If sending failed, check `docker compose logs app`. |
| The page looks the old way after a change | Hard-refresh with Cmd+Shift+R. If you changed the server code, rebuild with `--build`. |
| Port 3000 is already in use | Stop the other program, or change the port mapping in `docker-compose.yml`. |

---

## 14. Known limits and next steps

**Before the app is exposed to other people on the internet:**
- Add **rate limiting** to login and sign-up so passwords cannot be guessed endlessly.
- Add **password reset** ("I forgot my password"). It does not exist yet.
- Serve the app over **HTTPS** and mark the session cookie as `secure`. Your domain needs a certificate first.
- Make sign-up **safe when an email fails to send**. Today the account is created before the email is sent, so a failed send leaves an unverified account that cannot sign up again, and there is no "resend verification email" button yet.
- Handle **time zones**: the server decides what "today" is in UTC, while the browser uses local time. Near midnight they can disagree for a few hours, which can affect locked days and streaks.
- Use a real **email provider** (see section 8) and set `BASE_URL` to your public address.
- Set a long random `SESSION_SECRET` and keep `.env` out of git.

**Possible features later:** Google login, habits that carry over automatically each month, reminders, data export, and charts on the report page.

### Hosting options (decide later)

The app runs locally first. Cost estimates gathered earlier (check current prices before deciding):

| Option | Rough monthly cost | Notes |
|---|---|---|
| AWS (EC2 plus RDS PostgreSQL) | about $25 to $30 | Most familiar, but the managed database alone is about $12 to $14. |
| Small VPS (for example Hetzner) | about 5 to 6 euros | Cheapest. You run Docker Compose yourself, including the database and backups. |
| Platform as a service (Railway, Render) | about $13 to $27 | Easiest to operate, and managed databases are available. |

Because everything runs in Docker and the login and email modules are swappable, moving to any of these needs configuration changes, not rewrites.

---

## 15. Using git

A `.gitignore` is included. It keeps `node_modules/`, `.env` (secrets), logs and editor files out of the repository. The database lives in a Docker volume, outside the project folder, so there are no database files to ignore. `db/schema.sql` and `docker-compose.yml` should be committed because they recreate the database.
