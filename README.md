# Habit Tracker

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

A web app for tracking daily habits one month at a time: one card per habit, a calendar on each card, and a click to check off a day.

## Description

This project replaces a Google Sheets habit tracker. In the spreadsheet, every month is a set of cards: a coloured title, the weekday headers and a grid of days that you tick off. The app keeps that familiar layout and adds what a spreadsheet can't do easily: streaks, completion percentages, an end-of-month report, accounts for several people, English and French, and light and dark mode.

**Why these technologies**
- **Node.js and Express** keep the server small and the whole project in one language (JavaScript).
- **PostgreSQL** keeps the data reliable and is ready for more than one user. It also moves easily to a hosted database later.
- **Plain HTML, CSS and JavaScript** on the front end, with no build step, so every page can be edited and refreshed straight away.
- **Docker Compose** starts the app, the database and a fake mail server with one command, so nothing needs to be installed on the computer except Docker.
- **Swappable login and email modules.** Login (email and password today, Google later) and email (a local fake mail server today, a real provider later) are hidden behind small interfaces, so they can be changed in settings without rewriting the app.

**Challenges along the way**
- Streaks need care: today's streak should not break until the day is over.
- A habit belongs to one specific month, so deleting or archiving it affects only that month.
- Category colours are chosen by users, so text colour has to adapt automatically to stay readable in light and dark mode.

## Features

- Monthly habit cards with a Monday-first calendar and greyed-out days from neighbouring months
- Click a day to check it off. Future days are locked
- Current streak, longest streak and completion percentage for every habit
- Opens on the current month, with year and month pickers for past months
- Manage page to create, rename, archive and delete habits and categories
- Categories with their own colours, shown on each card
- Copy habits from any month to any month (titles and categories, never check-ins)
- In-app monthly report: best and weakest habits, strongest and weakest weekday, change since last month, category totals and history
- Sign-up with email verification, and a separate login for each person
- English and French
- Light and dark mode, following the computer's setting by default

## Table of Contents

- [Installation and running](#installation-and-running)
- [Usage](#usage)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Tests](#tests)
- [Known limits and roadmap](#known-limits-and-roadmap)
- [Documentation](#documentation)
- [License](#license)
- [Credits](#credits)

## Installation and running

**You need:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (it includes Docker Compose). Nothing else.

1. Get the project folder onto your computer.
2. Create the settings file by copying the template:
   ```
   cp .env.example .env
   ```
   Then open `.env` and replace `SESSION_SECRET` with a long random string.
3. Start everything:
   ```
   docker compose up --build
   ```
4. Open **http://localhost:3000** in your browser.

On the first start the database creates its tables automatically.

| Service | What it is | Address |
|---|---|---|
| App | The Habit Tracker | http://localhost:3000 |
| Mailpit | A fake inbox that catches all emails the app sends | http://localhost:8025 |
| PostgreSQL | The database (internal only) | |

**Everyday commands**

```
docker compose up -d        # start in the background
docker compose down         # stop (your data is kept)
docker compose logs app     # see the app's log
```

> **Careful:** `docker compose down -v` also deletes the database volume, which wipes all accounts and habits. Only use it when you want to start from scratch.

## Usage

1. **Create an account.** Go to http://localhost:3000/signup.html and fill in your name, email and password (at least 8 characters). The birthday is optional.
2. **Verify your email.** No real email is sent while the app runs locally. Open Mailpit at http://localhost:8025, open the "Confirm your email" message and click the link.
3. **Log in.**
4. **Set up.** Open **Manage**, add a few categories (name and colour), then add your habits for the month. To start a new month quickly, use **Copy habits** on the same page.
5. **Track.** Go back to the month view and click a day on a card to check it. Click again to uncheck.
6. **Look back.** Use the month and year pickers to see previous months. Habits can be copied from any month to any month on the **Manage** page (see step 4).
7. **Review.** Open **Report** for the monthly report and history.

The language switcher and the sun/moon button (light and dark mode) are in the top bar.

<!-- Add screenshots here, for example:
![Month view](docs/images/month-view.png)
-->

## Configuration

Settings live in the `.env` file (see `.env.example`).

| Setting | Meaning |
|---|---|
| `PORT` | Port the app listens on (default `3000`) |
| `BASE_URL` | Public address of the app, used for the link in verification emails |
| `DATABASE_URL` | Database connection |
| `SESSION_SECRET` | Secret that signs the login cookie. Keep it private |
| `AUTH_PROVIDER` | Login module (`password`) |
| `EMAIL_PROVIDER` | Email module (`mailpit` or `console`) |
| `SMTP_HOST`, `SMTP_PORT`, `MAIL_FROM` | Settings for the local mail server |

To send real emails later, add an email provider (for example Amazon SES or Resend) and change `EMAIL_PROVIDER`. To add Google login, add an auth provider and change `AUTH_PROVIDER`. Details are in the [documentation](documents/habit-tracker.md).

## Project structure

```
db/schema.sql        database tables
src/                 server code (routes, services, login and email modules)
public/              pages, styles, translations, light/dark mode
documents/           full documentation
docker-compose.yml   app + database + fake mail server
Dockerfile           builds the app image
```

Changes in `public/` show up when you refresh the browser. Changes in `src/` need `docker compose up -d --build`.

## Tests

There are no automated tests yet. A manual checklist covers sign-up, checking days, streaks, month switching, copying habits, the report, language and theme, and data isolation between two accounts. It is in the [documentation](documents/habit-tracker.md#12-testing-checklist).

## Known limits and roadmap

Before the app is put on the internet, these still need work:

- Rate limiting on login and sign-up
- Password reset
- HTTPS and secure cookies
- A "resend verification email" option, and safer sign-up when an email fails to send
- Consistent handling of time zones around midnight
- A real email provider

Ideas for later: Google login, reminders, data export and charts in the report.

## Documentation

The full documentation (how it works, data model, streak rules, API, how to swap the login and email modules, troubleshooting and hosting options) is in [`documents/habit-tracker.md`](documents/habit-tracker.md).

## License

No license has been chosen yet. Until one is added, all rights are reserved. [choosealicense.com](https://choosealicense.com/) can help you pick one.

## Credits

Created by Sarah, with the help of Claude (Anthropic) for planning and building.

The look follows the Habit Tracker design system, using the [Outfit](https://fonts.google.com/specimen/Outfit) typeface from Google Fonts.
