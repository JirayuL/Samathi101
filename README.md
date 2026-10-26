# english.samathi101.com — Willpower Institute English Meditation Courses

Landing page rebuilt from the Canva design, using [Astro](https://astro.build).

**Working on the site? Start with [AGENTS.md](AGENTS.md)**: setup, where to edit, rules, testing, demos, the Google Sheet connection, troubleshooting and the open items.

**Why Astro:** pages are plain HTML + CSS components (easy to read and edit), the output is a static site that GitHub Pages hosts for free (see Going live below), images are optimized automatically, and when you need server features later (forms, Thai language, a CMS, a database) Astro supports them without switching frameworks.

---

## How it fits together

```
GitHub repo (public) ── deploy bot ──▶ GitHub Pages: the site
                                            │  fetch: "open?", send applications
                                            ▼
                                     Google Apps Script web app ──▶ Google Sheet (private)
```

- **GitHub** keeps the code in a public repo (free GitHub Pages needs that); collaborators push. The check bot tests every pull request, and the deploy bot checks, publishes and re-checks the live site, rolling back if that fails.
- **GitHub Pages** serves the site for free: first at https://jirayul.github.io/Samathi101/ for review, later at english.samathi101.com. It can't keep secrets, so the site holds no keys.
- **Google Apps Script + Google Sheet** store the applications sent with the site's registration form (MIC Online 2027), and tell the form whether registration is still open. The script runs as the Google account that deploys it; the Sheet stays private. Setup: `apps-script/README.md`; rules: AGENTS.md → "Google Sheet".

## Demo for the client

`demo/samathi101-demo.html` is the whole site in one file. Open it in any browser, or send it over LINE or email; it works offline, except the Google Sheet and the course video. YouTube won't play videos inside a page opened from a file, so the demo shows the video's thumbnail with a button that opens it on YouTube. Every `npm run build` and `npm test` regenerates the demo, so commit it with each change. Until the review site is up, this is how the client sees it.

## Open items (26 Oct 2026)

The same list is in AGENTS.md → "Open items"; when you finish or add one, update both.

Content to confirm with the foundation:

- The MIC Online poster spells the founder's title "Somdet Phra Nyanavajirodome"; the site and the Google Form use "Nyanavajirodom".

Design (needs approval, AGENTS.md rule 4): the grey `--forest-mute` text is 4.35:1 on the page background, just under the 4.5:1 minimum for readable text. It is used for tab labels, the Register tab summaries and small labels.

Going live: see "Going live" below: first the review site on GitHub Pages for the client, then the live Sheet, then the domain switch.

MIC Online 2027 registration (the course being promoted):

- Update the **test** script to the latest `Code.gs` and `appsscript.json` (registration opening date, "Verify you are human" check), approve the new permission, and give it the Script Property `ALLOW_BEFORE_OPENING` = `yes`, so the client can try the form before 1 November (`apps-script/README.md`).
- The live spreadsheet is, for now, Gear's "Samathi 101 registrations", with its own deployment of the script. Later, move it to the foundation's Google account, so the email copies come from the foundation and the data stays with it.
- The course poster on the site is a small copy (360 × 540), so it looks soft, especially when enlarged. A larger original (1000 px wide or more) can simply replace `src/assets/courses/mic-online-2027.jpg`.

Other courses (not a priority now; the focus is MIC Online):

- The 7-Day Retreat early fee (THB 3,900) ends 31 Oct 2026, and the site lists no fee after that date.
- Of the 2026 1-Day Pattaya dates, only 19 Dec is still ahead.

## Run it locally

Requires Node.js 22.22 or newer (24 recommended, as in `.node-version`) and Python 3.

```bash
npm ci             # install the exact versions in package-lock.json
npm run dev        # http://localhost:4321/Samathi101/ — auto-reloads as you edit
npm test           # build into dist/, update the demo, check every link (the bots run this too)
npm run preview    # serve dist/ at http://localhost:4321/Samathi101/ to double-check the build
npm run smoke-test -- http://localhost:4321/Samathi101/   # check a running copy, as the deploy bot checks the live site
npm run mock-sheet # stand-in for the Google Sheet script, to test the registration form (AGENTS.md → "Google Sheet")
```

## Where things are

```
src/
  data/
    courses.ts        ← ALL course content: text, dates, buttons, links, status, which tab
    tabs.ts           ← the tabs: names and order
    site.ts           ← page title, hero text, contact details
    registration.ts   ← registration forms on the site: questions, texts, the Google Form fallback
  components/
    Header.astro      ← logo + name, centered
    Tabs.astro        ← sticky tab bar (Home, Instructor, Children, 7-Day, 1-Day, Contact, Register)
    Hero.astro        ← forest-green banner with the gold lotus (Home tab)
    Lotus.astro       ← the lotus line drawing (large, animated) and small ornament
    Divider.astro     ← small lotus between hairlines
    Register.astro    ← Register tab: every course with its sign-up buttons
    ApplyForm.astro   ← a registration form (Register tab): checks answers, sends them to the Sheet
    Analytics.astro   ← cookie banner and Google Analytics (only after "Allow analytics")
    Lightbox.astro    ← click-to-preview for posters and photos
    CourseSection.astro  ← layout for every course block (image left, text right)
    Button.astro
    About.astro       ← founder biography, quote, About our courses
    Contact.astro     ← photo strip + contact details
    Footer.astro
  layouts/Base.astro  ← <head>, fonts, SEO tags
  styles/global.css   ← colors, fonts, spacing (design tokens)
  assets/             ← images (auto-converted to WebP at build)
public/               ← files served as-is (favicon, CNAME.disabled)
scripts/
  check-links.py      ← link check (part of npm test)
  smoke-test.py       ← checks a running copy of the site (the deploy bot runs it on the live site)
  make-demo.py        ← builds the single-file demo (runs with every npm run build and npm test)
demo/                 ← the single-file demo for the client (regenerated by every build)
.github/
  workflows/deploy.yml   ← deploy bot: check, publish, check the live site, roll back if needed (run by hand for now)
  workflows/check.yml    ← check bot: runs npm test on every pull request
  pull_request_template.md ← the pre-push checklist, shown on every pull request
.env.example          ← settings for your own computer (copy to .env); the Google Sheet test URL
.claude/launch.json   ← dev and preview servers for Claude Code's preview pane
apps-script/          ← the Google Apps Script that saves applications in the Sheet, its test and setup steps
scripts/mock-sheet-api.py ← a local stand-in for that script (npm run mock-sheet)
```

## Common edits

| Task | Where |
|---|---|
| Change a date, fee or description | `src/data/courses.ts` |
| Add a new course | Copy a block in `courses.ts`, put the image in `src/assets/courses/`, import it at the top |
| Close registration | Set `status: 'closed'` and add a `closedNote` |
| Mark as "Coming Soon" | Set `status: 'coming-soon'` (buttons are hidden automatically) |
| Rename or reorder tabs | `src/data/tabs.ts` |
| Move a course to another tab | Change its `tab:` in `courses.ts` |
| Lines shown on the Register tab | The course's `summary:` list in `courses.ts` |
| Button look | `style: 'primary'` (robe ochre), `'secondary'` (forest green) or `'outline'` |
| Change colors / fonts | `src/styles/global.css` (`:root` variables) |
| Add or change a course's video | `youtubeId` of the course in `src/data/courses.ts` (the part after `watch?v=`) |
| Hero text and quote | `src/data/site.ts` |
| Contact details | `src/data/site.ts` |
| A registration form's questions | `src/data/registration.ts` (each question is a column in the Sheet) |
| Close registration early or limit it | `closes` / `maxApplications` in `apps-script/Code.gs`, then deploy a new version (`apps-script/README.md`) |

## Design

Theme: the Thai Forest tradition the courses come from.

| Token | Color | Used for |
|---|---|---|
| `--forest` | `#1f3b2d` | headings, hero banner, footer |
| `--kasaya` | `#a2561a` | robe ochre: buttons, links, labels |
| `--gold` / `--gold-light` | `#c39a48` / `#e2c47e` | lotus, hairlines, active tab |
| `--saffron` | `#e2a13b` | hero button |
| `--lacquer` | `#7a2418` | institute name, "registration closed" |
| `--palm` | `#f4ecdb` | founder band background |

Fonts are **Taviraj** (headings) and **Sarabun** (text), both by the Thai foundry Cadson Demak and both with Thai script, so a Thai version of the site will match. They are self-hosted through Fontsource (`@fontsource/*`), with no Google Fonts request.

### Registration links

The existing courses keep their **Google Forms** (same links as the old Canva site, checked 22 Oct 2026):

| Course | Form |
|---|---|
| 7-Day Retreat | `docs.google.com/forms/d/e/1FAIpQLSe7…/viewform`, asks people to sign in with Google |
| 1-Day Bangkok & Pattaya | `forms.gle/umpNTfYY7UHgvEjX9` |
| Yuvasa Kids (6–11) | `forms.gle/2AMSsJ2RbV2WAUgW8` |
| Yuvasa Teens (12–15) | `forms.gle/DQau1198rduHX3Ew8` |
| MIC | `forms.gle/VA9aqUrcUoFoeZ1u7`, the 2026 USA application form, closed (not shown) |
| MIC Online Batch 1 (2027) | The site's own form on the Register tab, saving to the Google Sheet. Its Google Form `forms.gle/sPF3JG52DH9VHdRw5` is the fallback while the Sheet isn't connected |

Each Register button appears twice, on its course tab and on the Register tab, and both read the same entry in `courses.ts`.

Content still to confirm is listed under "Open items" above.

## Going live (GitHub Pages)

The site goes live in three steps, each one checked before the next. The deploy bot (`.github/workflows/deploy.yml`, AGENTS.md → "Publishing") runs by hand: **Actions → "Deploy to GitHub Pages" → Run workflow**.

### 1. Review site for the client: https://jirayul.github.io/Samathi101/

- [ ] **Test script up to date:** paste the latest `apps-script/Code.gs` and `appsscript.json` into the test script, deploy a **new version** (approve the new "connect to an external service" permission), and add the Script Property `ALLOW_BEFORE_OPENING` = `yes` (`apps-script/README.md`), so the client can try the form before 1 November.
- [ ] Repo **Settings → General → Danger Zone → Change visibility → Public**.
- [ ] **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- [ ] **Settings → Secrets and variables → Actions → Secrets → New repository secret:** `PUBLIC_SHEET_API_URL` = the **test** script's URL, so the client's tries land in the TEST sheet.
- [ ] **"Verify you are human" check:** in Cloudflare (a free account is enough), **Turnstile → Add widget**: name "Samathi 101 registration", hostnames `jirayul.github.io`, `english.samathi101.com` and `localhost`, mode **Managed**. Then in GitHub, **Settings → Secrets and variables → Actions → Variables → New repository variable:** `PUBLIC_TURNSTILE_SITE_KEY` = the widget's **site key**. Keep the **secret key** for step 2.
- [ ] **Actions → "Deploy to GitHub Pages" → Run workflow.** build, deploy and verify should turn green (about 2 minutes).
- [ ] Look at it on a phone and a desktop, send one application marked TEST, then send the link to the client.

### 2. Live Sheet (when the client approves)

- [ ] In the live spreadsheet (for now "Samathi 101 registrations"): set up the script (`apps-script/README.md`) with the Script Property `TURNSTILE_SECRET` = the Turnstile widget's **secret key**, and **without** `ALLOW_BEFORE_OPENING`.
- [ ] Change the secret `PUBLIC_SHEET_API_URL` to the **live** script's URL, then run the deploy bot again.
- [ ] Before 1 November the form says "opens on 1 November 2026"; from then on it takes applications. Send one marked TEST, check the row and the email copy, then delete the row.
- [ ] Delete the test rows in the TEST sheet.
- [ ] **Google Analytics** (optional, free): at analytics.google.com, create a GA4 property "Samathi 101" (time zone Bangkok) with a **Web** data stream for `english.samathi101.com`, and copy its **Measurement ID** (`G-…`). In GitHub, **Settings → Secrets and variables → Actions → Variables:** `PUBLIC_GA_MEASUREMENT_ID` = that ID, then run the deploy bot. The site then shows the cookie banner, and Analytics counts only visitors who allow it (AGENTS.md → "Analytics").

### 3. Switch english.samathi101.com (pick a quiet time)

Only the `english` subdomain changes; the main `samathi101.com` site and email are not touched.

- [ ] In this repo: set `USE_CUSTOM_DOMAIN = true` in `astro.config.mjs` and rename `public/CNAME.disabled` to `public/CNAME`. Pull request, merge, run the deploy bot. From then on jirayul.github.io/Samathi101/ forwards to english.samathi101.com, so do the next step straight away.
- [ ] The domain admin, in **Cloudflare → DNS** for samathi101.com: **screenshot the current `english` record first** (today an A record to 103.169.142.0, the Canva site), then replace it with Type `CNAME`, Name `english`, Target `jirayul.github.io`, Proxy status **DNS only** (grey cloud).
- [ ] Repo **Settings → Pages → Custom domain** shows `english.samathi101.com`. Once the DNS check passes, tick **Enforce HTTPS** (the certificate can take up to an hour).
- [ ] Check https://english.samathi101.com on a phone and a desktop, and run `npm run smoke-test -- https://english.samathi101.com/`.
- [ ] **To roll back**, the admin puts the old `english` record back from the screenshot; the Canva site returns within minutes.
- [ ] After a few good days: in Canva, disconnect the custom domain from the old website.

### After launch

- [ ] Publish on every merge: remove the two `#` before `push:` at the top of `deploy.yml`.
- [ ] **Settings → Rules → Rulesets → New branch ruleset** for `main`: require a pull request and the status check **check**, so nobody can merge a change that fails `npm test` (free on public repos).
- [ ] Optional: verify the domain in your GitHub account (**Settings → Pages → Add a domain**), so nobody else can claim english.samathi101.com on GitHub Pages.
- [ ] Add volunteers under **Settings → Collaborators**.

## Tabs and links

Each tab has its own link, so you can share a specific tab: `/#home`, `/#instructor`, `/#children`, `/#retreat`, `/#one-day`, `/#contact`, `/#register`. Linking to a single course (e.g. `/#one-day-phuket`) opens the right tab and scrolls to it.

## Adding features later

- **More registration forms on the site:** add one in `src/data/registration.ts` and the same id in `FORMS` at the top of `apps-script/Code.gs`. A static site can't keep secret keys, which is why the page posts to the Apps Script web app instead of writing to the Sheet itself.
- **Thai / English versions:** Astro has built-in i18n routing (`/th/...`) — move text from `data/*.ts` into per-language files.
- **Non-developers editing content:** connect a headless CMS (e.g. Decap, Sanity, Notion) that writes to the same data shape as `courses.ts`.
- **More pages** (course detail pages, blog, gallery): add files under `src/pages/` — each file becomes a URL.
