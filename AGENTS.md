# AGENTS.md — working on the Samathi 101 website

Guide for anyone, person or AI coding assistant, who sets up, changes, tests or demos this site. Read it before your first change. `README.md` has the background, the design and the one-time GitHub setup.

## What this is

- The English meditation courses site of the **Willpower Institute Foundation** (Luangphor Viriyang Sirintharo), planned for **https://english.samathi101.com**.
- **Hosted on GitHub Pages** from this repo, which is public because free GitHub Pages needs that. The review site is live at https://jirayul.github.io/Samathi101/; english.samathi101.com still shows the old Canva site until the domain switch. README → "Status" says where everything stands, README → "Going live" what's next.
- A static site built with **Astro**, so any static host can serve it. One page (`src/pages/index.astro`) with tabs: Home, Instructor Course (MIC Online, the course being promoted), Children Course, 7-Day Course, 1-Day Course, Contact Us, Register.
- Applications for **MIC Online 2027** go through the site's own form into a **Google Sheet**, through a Google Apps Script web app. The other courses use their Google Forms. See "Google Sheet" below.
- This is volunteer work for a charity. Keep running costs at zero, and keep things simple enough for the next volunteer to pick up.

## Set up

Needs Node.js 22.22 or newer (the bots use the version in `.node-version`, 24), and Python 3 for the helper scripts (on Windows it may be called `py`). Anyone can read the repo; to push, ask Gear (JirayuL) to add you as a collaborator.

```bash
git clone git@github.com:JirayuL/Samathi101.git
cd Samathi101
npm ci                 # installs the exact versions in package-lock.json
npm run dev            # http://localhost:4321/Samathi101/, reloads as you edit
```

| Command | What it does |
|---|---|
| `npm run dev` | Local preview while editing |
| `npm test` | Checks the Apps Script without Google, builds the site into `dist/` and updates the demo, then runs the link check: lists every link and where it appears, and fails on `#` placeholders or broken in-page links. Must pass before you push; the bots run the same command |
| `npm run preview` | Serves the built `dist/` at http://localhost:4321/Samathi101/, the way a host would |
| `npm run build` | Builds the site into `dist/` and updates `demo/samathi101-demo.html`, the whole site in one file for showing the client |
| `npm run demo` / `npm run check-links` | Only the demo, or only the link check |
| `npm run mock-sheet` | A stand-in for the Google Sheet script at http://localhost:8787/exec, for testing the registration form without Google (see "Google Sheet") |

Using Claude Code? `.claude/launch.json` has `dev`, `preview`, `mock-sheet`, `dev-mock` (the dev server wired to `mock-sheet`) and `dev-analytics` (the same, plus the cookie banner with a test Analytics ID) ready for the preview pane; the last two need macOS or Linux.

## Where to make changes

Content lives in `src/data/`. Components only lay it out, so most edits never touch a component.

| To change | Edit |
|---|---|
| A course's text, dates, fees, buttons, status | `src/data/courses.ts` |
| Tab names and order | `src/data/tabs.ts` |
| A course's video | `youtubeId` of that course in `src/data/courses.ts` (the part after `watch?v=`); it replaces the course's images |
| Hero text, quote, contact details | `src/data/site.ts` |
| Colors, fonts, spacing | `src/styles/global.css` (`:root` variables) |
| A course image | Put it in `src/assets/courses/`, import it at the top of `courses.ts` |
| A registration form's questions and texts | `src/data/registration.ts` |
| How the form looks and sends | `src/components/ApplyForm.astro` |
| Cookie banner and Google Analytics events | `src/components/Analytics.astro` |
| What happens to an application (Sheet row, email copy, closing date) | `apps-script/Code.gs`, then deploy a new version (`apps-script/README.md`) |
| What the check bot checks | `scripts/check-links.py`, `apps-script/Code.test.mjs` |
| The check bot itself | `.github/workflows/check.yml` |

Course `status` is `open`, `coming-soon` or `closed`; the buttons follow it automatically. Each course's Register button shows on its own tab and on the Register tab, both from the same entry, so one edit changes both.

## Rules

1. **Registration links stay as the foundation set them.** The courses use their Google Forms, except MIC Online 2027, which uses the site's own form (`src/data/registration.ts` → Google Sheet); its Google Form is the fallback. Don't change a link, a question or the consent text unless the foundation asks.
2. **No secrets in the repo.** The repo is public, and the site's code reaches every visitor anyway. So: no passwords, API keys, or links to the Google Sheet itself. The site reaches the Sheet only through the Apps Script web app URL, which visitors' browsers can see; the live one is still kept out of the repo, as a GitHub secret.
3. **Personal data (Thailand's PDPA).** Registration collects personal details, including children's. Ask only for what the course needs, keep consent wording on forms, never send registrations back to the page or log them. Tracking runs only after the visitor agrees: Google Analytics waits for "Allow analytics" (`src/components/Analytics.astro`), and anything new (a Meta Pixel, say) must go through the same banner. Never send names, emails or form answers to any tracker.
4. **Keep the look.** Use the color and font variables in `global.css`. Fonts are Taviraj and Sarabun, which both support Thai. No new fonts, colors or UI libraries without asking.
5. **Images go in `src/assets/`** with a real `alt` text, so Astro optimizes them. Use `public/` only for files served as-is (favicon, CNAME).
6. **Paths:** the site is built for `/Samathi101/` until the domain switch (see `astro.config.mjs`). Don't hard-code links that start with `/`; use `#tab-id` links or `import.meta.env.BASE_URL`.
7. **Desktop and mobile friendly, and accessible:** nothing scrolls sideways at 320px wide, tap targets at least 24px, working keyboard focus, real link text, text contrast at least 4.5:1.

## Test

1. **`npm test`.** It must end with `Placeholder buttons (href="#"): none` and `In-page links with no target: none`. In the "External links" list, each Register button appears twice (its course tab and `register`) with the right form; README → "Registration links" has the list.
2. **Look at what you changed**, in `npm run dev`, at desktop width and at phone width. In Chrome: DevTools (F12, or Cmd+Option+I on a Mac), then the device toolbar (Ctrl+Shift+M / Cmd+Shift+M), then iPhone SE (375px); also try 320px. Check that nothing scrolls sideways, the tab bar shows the active tab, buttons are easy to tap, and the Register buttons open the right form.
3. **Changed images, fonts, paths or `astro.config.mjs`?** Also run `npm test && npm run preview`, look at the built site at http://localhost:4321/Samathi101/, and open `demo/samathi101-demo.html`: images, fonts and links must work in both.
4. **Changed the registration form or the script?** Test it without Google ("Google Sheet" → "Testing"): send one application as a non-Thai and one as a Thai applicant, and try a missing answer. `npm test` also checks `Code.gs`.

## Demo

- **Single file:** send `demo/samathi101-demo.html` over LINE or email. It opens in any browser and works offline, except the registration form and the course video. YouTube refuses to play videos inside a page opened from a file (Error 153), so the demo shows the video's thumbnail with a button that opens it on YouTube. Every `npm run build` and `npm test` updates the demo, so commit it with every change. While the site isn't published, this is how the client sees it.
- **On your own computer:** `npm run dev`, or `npm test && npm run preview` for the built version.
- **The demo's registration form** uses `PUBLIC_SHEET_API_URL` from your `.env` when you build it: the **test** Sheet's URL lets the client try it for real; with no URL (or the local stand-in), the form shows a link to the Google Form instead. Never build a demo with the live URL.

## Publishing (GitHub Pages)

The deploy bot (`.github/workflows/deploy.yml`) publishes `main` to GitHub Pages. For now it runs **only by hand**: GitHub → **Actions** → "Deploy to GitHub Pages" → Run workflow. Each run:

1. **build**: `npm test`, with the registration form's web app URL taken from the repository secret `PUBLIC_SHEET_API_URL`. If it fails, nothing is published and the live site keeps the previous version.
2. **deploy**: publishes the build to GitHub Pages.
3. **verify**: `scripts/smoke-test.py` on the live URL: the page, every tab, every image, font and stylesheet.
4. **rollback**: only if verify fails. It rebuilds the last version that passed, publishes it and checks it again.

**After merging a pull request, run the deploy bot** to publish it; until publishing on every merge is switched on, merging alone changes nothing on the site. A failed run is red, and GitHub emails whoever started it. After a rollback, the broken commit is still on `main`, so revert it (`git revert <sha>` on a branch, then a pull request) or fix it. To publish on every merge into `main`, remove the two `#` before `push:` at the top of `deploy.yml`.

Pull requests get the check bot (`check.yml`), which runs `npm test`; the ruleset "Protect main" won't let a pull request with a red X be merged. First publish, the live Sheet and the domain switch: README → "Going live".

## Google Sheet (read and write)

```
visitor's browser  ── fetch ──▶  Apps Script web app  ──▶  Google Sheet (private)
(Register tab form)  ◀─ JSON ─  (apps-script/Code.gs, runs as the foundation's account)
```

- **The pieces:** the questions are data in `src/data/registration.ts`, worded exactly like the Google Form, so the Sheet's columns line up with that form's responses. `src/components/ApplyForm.astro` shows them on the Register tab, and `apps-script/Code.gs` saves each application as one row and emails the applicant a copy.
- **Read** (`GET ?form=<id>`): "open or closed" only, checked once when the form comes into view. Anyone can call the URL, so it never returns anyone's answers.
- **Write** (`POST`): the page checks required answers, "LINE or WhatsApp" and "Other:" boxes. The script checks email, consent, sizes and the opening and closing dates again, drops spam (a hidden field people never fill in), and stores answers as plain text, so nothing typed can run as a formula.
- **"Verify you are human" (Cloudflare Turnstile, free):** with a site key in `PUBLIC_TURNSTILE_SITE_KEY`, the check shows above the Submit button. It's loaded from Cloudflare only when someone reaches the form. The script asks Cloudflare whether the check was passed when its Script Property `TURNSTILE_SECRET` is set (the live copy), and refuses the application if not. The secret key lives only in the script's settings. Without it (test copy, demo) the check is skipped, which matters because it can't run in a page opened from a file. For local testing, Cloudflare's test site key `1x00000000000000000000AA` always passes.
- **No headers on the fetch:** `fetch(url, { method: 'POST', body: JSON.stringify(data) })`. Adding `Content-Type: application/json` makes the browser ask Apps Script for permission first (a CORS preflight), which Apps Script can't answer, so the call fails.
- **Set up, update, close registration:** step by step in `apps-script/README.md`. Change `Code.gs` here first, then paste it into the Apps Script editor and deploy a **new version** of the same deployment, so the URL stays the same.
- **Opening and closing:** registration opens on 1 November 2026 at 00:00 and closes on 10 January 2027 at 23:59, Bangkok time (`opens` and `closes` in `FORMS`). Before it opens, the form says "opens on 1 November 2026" and stays greyed out. A **test** copy can skip the opening date with the Script Property `ALLOW_BEFORE_OPENING` = `yes`; never set it on the live copy.
- **Test and live copies.** A test spreadsheet with its own script deployment for development and demos, and the live one. The page reads the URL from `PUBLIC_SHEET_API_URL`:
  - on your computer: copy `.env.example` to `.env` and put the **test** URL in it (`.env` is never committed), then restart `npm run dev`;
  - for the published site: the **live** URL as the repository **secret** `PUBLIC_SHEET_API_URL` (Settings → Secrets and variables → Actions → **Secrets**); the deploy bot puts it into the page when it builds. Visitors' browsers can still see it, as on any static site. That's safe: the script only takes applications and answers "open or closed".
  - With no URL, the form shows a link to the Google Form instead of its submit button.
- **Testing without Google:** run `npm run mock-sheet` and set `PUBLIC_SHEET_API_URL=http://localhost:8787/exec` in `.env`, then restart `npm run dev` (in Claude Code: start `mock-sheet`, then `dev-mock`). Applications are printed in the `mock-sheet` window. `npm run mock-sheet -- --closed` shows the "closed" state, `-- --fail` the error message, and `-- --human` refuses applications without a passed human check. `dev-mock` also turns on the check with Cloudflare's always-pass test key.
- **Privacy:** share the spreadsheet only with the people who handle registrations. Don't add questions, tracking or logging of answers. The human check is a security measure from Cloudflare, loaded only on the form, not tracking.

## Analytics (Google Analytics 4)

- **Consent first:** with a measurement ID in `PUBLIC_GA_MEASUREMENT_ID` (a GitHub variable; now `G-ZS01177BLR`, live on the review site), the site shows a cookie banner at the bottom. Nothing is loaded from Google until the visitor clicks "Allow analytics"; "No thanks" is remembered, and "Cookie settings" in the footer changes the choice. Switching off also removes Analytics' cookies. Both buttons look the same on purpose.
- **What is sent:** the usual page visit, plus three events with ids only (never names, emails or answers):
  - `view_tab` (`tab_id`): someone opened a tab;
  - `register_click` (`course_id`, `destination` = `site_form` or `google_form`, `tab_id`): someone clicked a Register button;
  - `application_sent` (`form_id`): an application went through the site's form.

  Ads features and Google signals are switched off in the code.
- **How it's wired:** `Tabs.astro` and `ApplyForm.astro` announce tab changes and sent applications (`samathi:tab`, `samathi:applied`), and Register buttons carry `data-course`; only `Analytics.astro` talks to Google.
- **Not in the demo, not on your computer:** leave `PUBLIC_GA_MEASUREMENT_ID` empty in `.env`, so local work doesn't count as visits. The demo drops it anyway, because cookies don't work in a page opened from a file and client reviews aren't real visits. To test the banner locally, start the dev server with any ID, e.g. `PUBLIC_GA_MEASUREMENT_ID=G-TEST000000 npm run dev`, and click "No thanks" or block the request.
- **In Google Analytics** (Admin): keep data retention at 2 months, leave Google signals off, and don't link Google Ads. In the reports, the three events appear under Reports → Engagement → Events; mark `application_sent` as a key event to count applications.

## Troubleshooting

| Problem | Fix |
|---|---|
| `astro: command not found` | Run `npm ci` first |
| `localhost:4321` shows a 404 | The site lives under `/Samathi101/`: open http://localhost:4321/Samathi101/ |
| Port 4321 is busy | Astro picks the next free port; open the URL it prints |
| `npm warn EBADENGINE` | Node is too old: install Node 24 (or 22.22 or newer) |
| `python3: command not found` (Windows) | Install Python 3, or run the script with `py scripts/...` |
| The form says it "isn't connected" | `PUBLIC_SHEET_API_URL` is empty: put the test URL (or the local stand-in) in `.env` and restart `npm run dev` |
| "Your application could not be sent" while testing | Is `npm run mock-sheet` running, or is the Apps Script URL right? Open the URL with `?form=mic-online-2027`: it should say `"open":true` |
| "Please complete the Verify you are human check" | The check above the button hasn't finished, or couldn't load (offline, an ad blocker). Reload the page. On the live copy, check that the site key (GitHub variable) and `TURNSTILE_SECRET` (Script Property) come from the same Turnstile widget, and that the widget lists the site's hostname |
| The form says "opens on 1 November 2026" | Expected before the opening date. On a **test** copy, add the Script Property `ALLOW_BEFORE_OPENING` = `yes` |
| The Sheet suddenly has a second, similar column | A question's wording changed in `registration.ts`; new answers go to the new column. Merge the two by hand if needed |
| `Demo not written: these files would be missing in it` | Something links a file with a path starting with `/`. Put images in `src/assets/` and import them, or use `import.meta.env.BASE_URL` (rule 6) |

## Before you push

- [ ] `npm test` passes, and every Register button goes to the right form
- [ ] You looked at the changed tab at desktop width and at phone width (375px)
- [ ] No passwords, API keys or Google Sheet links in the code
- [ ] The updated `demo/samathi101-demo.html` is committed with the change (`npm test` regenerates it)

Work on a branch and open a pull request into `main`; the pull request template repeats this list. Ask Gear (JirayuL) to review. `main` is protected by the ruleset "Protect main": changes arrive only through a pull request, the check bot (`check`) must pass before merging, and force-pushes and deleting `main` are blocked.

## Open items (26 Oct 2026)

The same list is in README → "Open items"; when you finish or add one, update both.

Content to confirm with the foundation:

- The MIC Online poster spells the founder's title "Somdet Phra Nyanavajirodome"; the site and the Google Form use "Nyanavajirodom".

Design (needs approval, rule 4): the grey `--forest-mute` text is 4.35:1 on the page background, just under 4.5:1. It is used for tab labels, the Register tab summaries and small labels.

Going live: the review site is up (README → "Status"). Next come the live Sheet and then the domain switch (README → "Going live").

MIC Online 2027 registration (the course being promoted):

- If not done yet: update the **test** script to the latest `Code.gs` and `appsscript.json` (registration opening date, "Verify you are human" check), approve the new permission, and give it the Script Property `ALLOW_BEFORE_OPENING` = `yes`, so the client can try the form before 1 November (`apps-script/README.md`).
- The "Verify you are human" check shows on the form but isn't enforced yet: the review site sends to the test script, which has no `TURNSTILE_SECRET`. The live script gets it (README → "Going live", step 2).
- The live spreadsheet is, for now, Gear's "Samathi 101 registrations", with its own deployment of the script. Later, move it to the foundation's Google account, so the email copies come from the foundation and the data stays with it.

GitHub and Analytics:

- Google Analytics also counts the client's visits to the review site. That's harmless; to keep the numbers clean, empty the `PUBLIC_GA_MEASUREMENT_ID` variable until the domain switch.

Other courses (not a priority now; the focus is MIC Online):

- The 7-Day Retreat early fee (THB 3,900) ends 31 Oct 2026, and the site lists no fee after that date.
- Of the 2026 1-Day Pattaya dates, only 19 Dec is still ahead.

## Planned work

- Meta Pixel, through the same consent banner as Google Analytics (`Analytics.astro`), if the foundation runs Facebook ads
- SEO: share image, structured data for courses, sitemap and robots.txt, Search Console after the domain switch
