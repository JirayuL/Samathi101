# english.samathi101.com — Willpower Institute English Meditation Courses

Landing page rebuilt from the Canva design, using [Astro](https://astro.build).

**Working on the site? Start with [AGENTS.md](AGENTS.md)**: setup, where to edit, rules, testing, demos, deploying, the Google Sheet connection, troubleshooting and the open items.

**Why Astro:** pages are plain HTML + CSS components (easy to read and edit), the output is a static site that GitHub Pages hosts for free (see Hosting below), images are optimized automatically, and when you need server features later (forms, Thai language, a CMS, a database) Astro supports them without switching frameworks.

---

## How it fits together

```
GitHub repo (private) ── deploy bot ──▶ GitHub Pages: the site (static; not published yet)
                                            │  fetch: read course info, send registrations
                                            ▼
                                     Google Apps Script web app ──▶ Google Sheet (private)
```

- **GitHub** keeps the code in a private repo that only collaborators can see. The check bot tests every pull request. The deploy bot checks, publishes and re-checks the live site, rolling back if that fails; it runs by hand until the site is published (see Hosting).
- **GitHub Pages** is where the site is meant to be served for free. It can't keep secrets, so the site holds no keys.
- **Google Apps Script + Google Sheet** store what the site reads and writes. The script runs as the foundation's Google account; the Sheet stays private. Setup and rules: AGENTS.md → "Google Sheet".

## Demo for the client

`demo/samathi101-demo.html` is the whole site in one file. Open it in any browser, or send it over LINE or email; it works offline, except the YouTube video and the Google Sheet. It is a snapshot: run `npm run demo` to regenerate it after changes. While the site isn't published, this is how the client sees it.

## Run it locally

Requires Node.js 22.22 or newer (24 recommended, as in `.node-version`) and Python 3.

```bash
npm ci             # install the exact versions in package-lock.json
npm run dev        # http://localhost:4321/Samathi101/ — auto-reloads as you edit
npm test           # build into dist/ and check every link (the bots run this too)
npm run preview    # serve dist/ at http://localhost:4321/Samathi101/ to double-check the build
npm run smoke-test -- http://localhost:4321/Samathi101/   # check a running copy, as the bot checks the live site
```

## Where things are

```
src/
  data/
    courses.ts        ← ALL course content: text, dates, buttons, links, status, which tab
    tabs.ts           ← the tabs: names and order
    videos.ts         ← YouTube videos on the Videos tab
    site.ts           ← page title, hero text, contact details
  components/
    Header.astro      ← logo + name, centered
    Tabs.astro        ← sticky tab bar (Home, Children, 7-Day, 1-Day, Instructor, Videos, Contact, Register)
    Hero.astro        ← forest-green banner with the gold lotus (Home tab)
    Lotus.astro       ← the lotus line drawing (large, animated) and small ornament
    Divider.astro     ← small lotus between hairlines
    Register.astro    ← Register tab: every course with its sign-up buttons
    Videos.astro      ← Videos tab: embedded YouTube videos
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
  make-demo.py        ← builds the single-file demo (npm run demo)
demo/                 ← the single-file demo for the client
.github/
  workflows/deploy.yml   ← deploy bot: check, publish, check the live site, roll back if needed (run by hand for now)
  workflows/check.yml    ← check bot: runs npm test on every pull request
  pull_request_template.md ← the pre-push checklist, shown on every pull request
.env.example          ← settings for your own computer (copy to .env); the Google Sheet test URL
.claude/launch.json   ← dev and preview servers for Claude Code's preview pane
apps-script/          ← (planned) the Google Apps Script code that reads and writes the Sheet
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
| Add or change a video | `src/data/videos.ts` (YouTube ID + optional start second) |
| Hero text and quote | `src/data/site.ts` |
| Contact details | `src/data/site.ts` |

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

Each Register button appears twice, on its course tab and on the Register tab, and both read the same entry in `courses.ts`.

Content still to fill in (videos, fees, dates) is listed in AGENTS.md → "Open items".

## Hosting (not published yet)

The repo is **private**: only its collaborators (**Settings → Collaborators**) can see the code. The site isn't published anywhere yet; the client sees it through the single-file demo.

**Every change:** open a pull request; the check bot (`.github/workflows/check.yml`) runs `npm test` on it. Merging into `main` doesn't publish anything yet.

**When the foundation is ready to publish**, the hosting choice depends on whether the repo stays private:

- **GitHub Pages** (what the deploy bot is built for) is free only for **public** repos. A private repo needs a paid GitHub plan, and even then the published site is public. Nothing secret is in this repo, so making it public is safe, but then anyone can read the code.
- To keep the repo private at zero cost, use a host that builds from private repos on a free plan, such as **Cloudflare Pages**. samathi101.com's DNS is already on Cloudflare. The deploy bot's publish steps would then need rewriting for that host.

**Publishing on GitHub Pages** (repo admin, once):
1. Make the repo public (**Settings → General → Danger Zone → Change visibility**), or move to a paid plan.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Run the deploy bot: **Actions → "Deploy to GitHub Pages" → Run workflow**. After a minute or two the site is live at **https://jirayul.github.io/Samathi101/**.
4. To publish on every merge from then on, remove the two `#` before `push:` at the top of `.github/workflows/deploy.yml`.

What the deploy bot does each run:

1. Builds the site and runs `npm test`. If that fails, nothing is published: the live site keeps the previous version.
2. Publishes to GitHub Pages.
3. Checks the live site with `scripts/smoke-test.py`: the page, every tab, every image, font and stylesheet.
4. If that check fails, rebuilds the last version that passed, publishes it again and re-checks it (automatic rollback).

Any failure turns the run red in the **Actions** tab, and GitHub emails whoever started it.

**Other one-time settings** (repo admin):
- **Settings → Rules → Rulesets → New branch ruleset** for `main`: require a pull request and the status check **check** (from the check bot), so nobody can merge a change that fails `npm test`. GitHub enforces rulesets on private repos only on paid plans; on the free plan, check for the green tick before merging.
- When the registration page goes live: **Settings → Secrets and variables → Actions → Variables → New repository variable** `PUBLIC_SHEET_API_URL` = the live Apps Script web app URL.

### Switching english.samathi101.com to GitHub Pages

Do this once the site is published (see Hosting) and the team is happy with the review link. Only the `english` subdomain changes; the main `samathi101.com` site and email are not touched.

1. In this repo: set `USE_CUSTOM_DOMAIN = true` in `astro.config.mjs` and rename `public/CNAME.disabled` to `public/CNAME`. Open a pull request and merge it, then run the deploy bot (or let it run, if publishing on every merge is on).
2. The domain admin edits the `english` record in **Cloudflare → DNS** for samathi101.com: Type `CNAME`, Name `english`, Target `jirayul.github.io`, Proxy status **DNS only** (grey cloud). Remove the old Canva `english` records.
3. Repo **Settings → Pages → Custom domain** shows `english.samathi101.com`. Once the DNS check passes, tick **Enforce HTTPS**.
4. In Canva, disconnect the custom domain from the old website.

To roll back, the admin puts the old `english` record back.

## Tabs and links

Each tab has its own link, so you can share a specific tab: `/#home`, `/#children`, `/#retreat`, `/#one-day`, `/#instructor`, `/#videos`, `/#contact`, `/#register`. Linking to a single course (e.g. `/#one-day-phuket`) opens the right tab and scrolls to it.

## Adding features later

- **Registration page for new courses** (website → Google Sheet): the existing courses stay on Google Forms. GitHub Pages can't keep secret keys, so the page posts to a Google Apps Script web app that writes the row into the Sheet, and reads public course info the same way. How to build and test it: AGENTS.md → "Google Sheet".
- **Thai / English versions:** Astro has built-in i18n routing (`/th/...`) — move text from `data/*.ts` into per-language files.
- **Non-developers editing content:** connect a headless CMS (e.g. Decap, Sanity, Notion) that writes to the same data shape as `courses.ts`.
- **More pages** (course detail pages, blog, gallery): add files under `src/pages/` — each file becomes a URL.
