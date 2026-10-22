# AGENTS.md — working on the Samathi 101 website

Guide for anyone, person or AI coding assistant, who sets up, changes, tests or demos this site. Read it before your first change. `README.md` has the background, the design and the one-time GitHub setup.

## What this is

- The English meditation courses site of the **Willpower Institute Foundation** (Luangphor Viriyang Sirintharo), planned for **https://english.samathi101.com**.
- **Not published yet.** The repo is private (collaborators only), and the client sees the site through the single-file demo. README → "Hosting" covers what publishing needs.
- A static site built with **Astro**, ready to host free on **GitHub Pages**. One page (`src/pages/index.astro`) with tabs: Home, Children Course, 7-Day Course, 1-Day Course, Instructor Course, Videos, Contact Us, Register.
- Data that people send or that changes often (registrations, later live course info) goes to a **Google Sheet** through a Google Apps Script web app. See "Google Sheet" below.
- This is volunteer work for a charity. Keep running costs at zero, and keep things simple enough for the next volunteer to pick up.

## Set up

Needs Node.js 22.22 or newer (the bots use the version in `.node-version`, 24), and Python 3 for the helper scripts (on Windows it may be called `py`). The repo is private: ask Gear (JirayuL) to add you as a collaborator.

```bash
git clone git@github.com:JirayuL/Samathi101.git
cd Samathi101
npm ci                 # installs the exact versions in package-lock.json
npm run dev            # http://localhost:4321/Samathi101/, reloads as you edit
```

| Command | What it does |
|---|---|
| `npm run dev` | Local preview while editing |
| `npm test` | Builds the site into `dist/`, then runs the link check: lists every link and where it appears, and fails on `#` placeholders or broken in-page links. Must pass before you push; the bots run the same command |
| `npm run preview` | Serves the built `dist/` at http://localhost:4321/Samathi101/, the way GitHub Pages will |
| `npm run smoke-test -- <url>` | Checks a running copy of the site: the page, every tab and every file it uses load. The deploy bot runs it on the live site |
| `npm run demo` | Makes `demo/samathi101-demo.html`, the whole site in one file for showing the client |
| `npm run build` / `npm run check-links` | The two halves of `npm test`, if you need one alone |

Using Claude Code? `.claude/launch.json` has the `dev` and `preview` servers ready for the preview pane.

## Where to make changes

Content lives in `src/data/`. Components only lay it out, so most edits never touch a component.

| To change | Edit |
|---|---|
| A course's text, dates, fees, buttons, status | `src/data/courses.ts` |
| Tab names and order | `src/data/tabs.ts` |
| Videos on the Videos tab | `src/data/videos.ts` (YouTube ID + optional start second) |
| Hero text, quote, contact details | `src/data/site.ts` |
| Colors, fonts, spacing | `src/styles/global.css` (`:root` variables) |
| A course image | Put it in `src/assets/courses/`, import it at the top of `courses.ts` |
| What the bots check | `scripts/check-links.py`, `scripts/smoke-test.py` |
| The bots themselves | `.github/workflows/deploy.yml` (publish), `.github/workflows/check.yml` (pull requests) |

Course `status` is `open`, `coming-soon` or `closed`; the buttons follow it automatically. Each course's Register button shows on its own tab and on the Register tab, both from the same entry, so one edit changes both.

## Rules

1. **Existing courses keep their Google Forms.** Do not change those registration links unless the foundation asks. Only the **new course** gets the on-site registration page (website → Google Sheet).
2. **No secrets in the repo.** It is private now, but free GitHub Pages hosting would make it public, and the site's code reaches every visitor anyway. So: no passwords, API keys, or links to the Google Sheet itself. The site reaches the Sheet only through the Apps Script web app URL, which is public by design.
3. **Personal data (Thailand's PDPA).** Registration collects personal details, including children's. Ask only for what the course needs, keep consent wording on forms, never send registrations back to the page or log them, and don't add tracking (Pixel, Analytics) without a consent banner.
4. **Keep the look.** Use the color and font variables in `global.css`. Fonts are Taviraj and Sarabun, which both support Thai. No new fonts, colors or UI libraries without asking.
5. **Images go in `src/assets/`** with a real `alt` text, so Astro optimizes them. Use `public/` only for files served as-is (favicon, CNAME).
6. **Paths:** the site is built for `/Samathi101/` until the domain switch (see `astro.config.mjs`). Don't hard-code links that start with `/`; use `#tab-id` links or `import.meta.env.BASE_URL`.
7. **Desktop and mobile friendly, and accessible:** nothing scrolls sideways at 320px wide, tap targets at least 24px, working keyboard focus, real link text, text contrast at least 4.5:1.

## Test

1. **`npm test`.** It must end with `Placeholder buttons (href="#"): none` and `In-page links with no target: none`. In the "External links" list, each Register button appears twice (its course tab and `register`) with the right form; README → "Registration links" has the list.
2. **Look at what you changed**, in `npm run dev`, at desktop width and at phone width. In Chrome: DevTools (F12, or Cmd+Option+I on a Mac), then the device toolbar (Ctrl+Shift+M / Cmd+Shift+M), then iPhone SE (375px); also try 320px. Check that nothing scrolls sideways, the tab bar shows the active tab, buttons are easy to tap, and the Register buttons open the right form.
3. **Changed images, fonts, paths or `astro.config.mjs`?** Also run `npm test && npm run preview`, then in a second terminal `npm run smoke-test -- http://localhost:4321/Samathi101/`. This is the same check the bot runs on the live site.

## Demo

- **Single file:** `npm run demo`, then send `demo/samathi101-demo.html` over LINE or email. It opens in any browser and works offline, except YouTube and the Google Sheet. It's a snapshot: run it again after changes and commit it with them. While the site isn't published, this is how the client sees it.
- **On your own computer:** `npm run dev`, or `npm test && npm run preview` for the built version.
- **Review link** (once the site is published): https://jirayul.github.io/Samathi101/, which always shows `main`.
- Demos of the Google Sheet features use the **test** Sheet (below), never the live one.

## Publishing and rollback

The site isn't published yet, so the deploy bot (`deploy.yml`) runs **only by hand**, and only works once hosting is set up (README → "Hosting"). Then run it from GitHub → **Actions** → "Deploy to GitHub Pages" → Run workflow. To publish on every merge into `main` instead, remove the two `#` before `push:` at the top of `deploy.yml`. The bot runs four steps:

1. **build**: `npm test`. If it fails, nothing is published and the live site keeps the previous version.
2. **deploy**: publishes the build to GitHub Pages.
3. **verify**: `scripts/smoke-test.py` on the live URL.
4. **rollback**: only if verify fails. It rebuilds the last version that passed, publishes it and checks it again.

A failed run is red, and GitHub emails whoever started it. After a rollback, the broken commit is still on `main`, so revert it (`git revert <sha>` on a branch, then a pull request) or fix it.

Pull requests get the check bot (`check.yml`), which runs the same `npm test`, so a red X shows up before anything is merged. It takes about a minute, well inside the free Actions minutes a private repo gets each month. To move to english.samathi101.com, follow README → "Switching english.samathi101.com to GitHub Pages".

## Google Sheet (read and write)

```
visitor's browser  ── fetch ──▶  Apps Script web app  ──▶  Google Sheet (private)
(page on GitHub Pages) ◀─ JSON ─  (runs as the foundation's Google account)
```

- The Sheet stays private, shared only with the people who handle registrations. The page holds no key: it calls the web app URL, and the script reads or writes the Sheet as the foundation's account.
- **Write** (`doPost`): append one registration row. Check every field in the script as well as in the page, add a hidden "honeypot" field to catch spam bots, and wrap the write in `LockService` so two people registering at the same moment don't clash.
- **Read** (`doGet`): return only public data, such as course status or seats left. Anyone can call the URL, so it must never return registrations or other personal data.
- **From the page:** use `fetch(url)` to read and `fetch(url, { method: 'POST', body: JSON.stringify(data) })` to write, with no custom headers. Adding `Content-Type: application/json` makes the browser ask Apps Script for permission first (a CORS preflight), which Apps Script can't answer, so the call fails. A call takes a second or two: show "Sending…" and a clear message if it fails.
- **Script code** goes in `apps-script/` in this repo (create the folder with the feature) and is pasted into the Apps Script editor (open the Sheet, then Extensions → Apps Script), so script changes get reviewed like everything else. A script created from the Sheet uses `SpreadsheetApp.getActiveSpreadsheet()`, so no Sheet ID or link goes into the code.
- **Deploy settings:** Deploy → New deployment → Web app, "Execute as: Me" (the foundation account), "Who has access: Anyone".
- **Test and live copies.** Keep a test Sheet with its own script deployment for development and demos, next to the live one. The page reads the URL from `PUBLIC_SHEET_API_URL`:
  - on your computer: copy `.env.example` to `.env` and put the **test** URL in it (`.env` is never committed);
  - for the deploy bot: the **live** URL in GitHub → Settings → Secrets and variables → Actions → **Variables** → `PUBLIC_SHEET_API_URL`.
- **Updating the script:** Deploy → Manage deployments → edit (pencil) → Version: New version. This keeps the same URL. "New deployment" creates a new URL, which then has to be updated in `.env` and in the repo variable.

## Troubleshooting

| Problem | Fix |
|---|---|
| `astro: command not found` | Run `npm ci` first |
| `localhost:4321` shows a 404 | The site lives under `/Samathi101/`: open http://localhost:4321/Samathi101/ |
| Port 4321 is busy | Astro picks the next free port; open the URL it prints |
| `npm warn EBADENGINE` | Node is too old: install Node 24 (or 22.22 or newer) |
| `python3: command not found` (Windows) | Install Python 3, or run the script with `py scripts/...` |
| A deploy run is red | Actions → open the run. Red **build**: the live site didn't change; fix and merge again. Red **verify** with green **rollback**: the previous version is back; read the verify log, then revert or fix |

## Before you push

- [ ] `npm test` passes, and every Register button goes to the right form
- [ ] You looked at the changed tab at desktop width and at phone width (375px)
- [ ] No passwords, API keys or Google Sheet links in the code
- [ ] `npm run demo`, committed with the change, if the client will review it

Work on a branch and open a pull request into `main`; the pull request template repeats this list. Ask Gear (JirayuL) to review.

## Open items (22 Oct 2026)

Content to confirm with the foundation:

- The Videos tab shows a placeholder: a Google developer demo video (`M7lc1UVf-VE`) titled "Featured video" in `src/data/videos.ts`.
- The MIC video ID (`youtubeId` in `courses.ts`) is empty, so the Instructor Course shows the poster image.
- The 7-Day Retreat early fee (THB 3,900) ends 31 Oct 2026, and the site lists no fee after that date.
- Of the 2026 1-Day Pattaya dates, only 19 Dec is still ahead.

Design (needs approval, rule 4): the grey `--forest-mute` text is 4.35:1 on the page background, just under 4.5:1. It is used for tab labels, the Register tab summaries and small labels.

Hosting: decide how and when to publish (README → "Hosting"). Until then the site is private and shown with the single-file demo.

## Planned work

- Registration page for the new course (starts 1 Nov 2026) → Google Sheet via Apps Script (see above), demoed to the client with the test Sheet before going live
- Meta Pixel and Google Analytics with a consent banner, to see where people come from and what they register for
- SEO: share image, structured data for courses, sitemap and robots.txt, Search Console after the domain switch
