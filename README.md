# english.samathi101.com — Willpower Institute English Meditation Courses

Landing page rebuilt from the Canva design, using [Astro](https://astro.build).

**Working on the site? Start with [AGENTS.md](AGENTS.md)**: setup, where to edit, rules, testing, demos, the Google Sheet connection, troubleshooting and the open items.

**Why Astro:** pages are plain HTML + CSS components (easy to read and edit), the output is a static site that free hosts such as GitHub Pages can serve (see Hosting below), images are optimized automatically, and when you need server features later (forms, Thai language, a CMS, a database) Astro supports them without switching frameworks.

---

## How it fits together

```
GitHub repo (private) ──▶ static host (not chosen yet): the site, not published
                               │  fetch: read course info, send registrations
                               ▼
                        Google Apps Script web app ──▶ Google Sheet (private)
```

- **GitHub** keeps the code in a private repo that only collaborators can see. The check bot tests every pull request.
- **A static host** (to be chosen, see Hosting) will serve the site. It can't keep secrets, so the site holds no keys.
- **Google Apps Script + Google Sheet** store the applications sent with the site's registration form (MIC Online 2027), and tell the form whether registration is still open. The script runs as the foundation's Google account; the Sheet stays private. Setup: `apps-script/README.md`; rules: AGENTS.md → "Google Sheet".

## Demo for the client

`demo/samathi101-demo.html` is the whole site in one file. Open it in any browser, or send it over LINE or email; it works offline, except the Google Sheet and the course video. YouTube won't play videos inside a page opened from a file, so the demo shows the video's thumbnail with a button that opens it on YouTube. Every `npm run build` and `npm test` regenerates the demo, so commit it with each change. While the site isn't published, this is how the client sees it.

## Open items (26 Oct 2026)

The same list is in AGENTS.md → "Open items"; when you finish or add one, update both.

Content to confirm with the foundation:

- The 7-Day Retreat early fee (THB 3,900) ends 31 Oct 2026, and the site lists no fee after that date.
- Of the 2026 1-Day Pattaya dates, only 19 Dec is still ahead.
- The MIC Online poster spells the founder's title "Somdet Phra Nyanavajirodome"; the site and the Google Form use "Nyanavajirodom".

Design (needs approval, AGENTS.md rule 4): the grey `--forest-mute` text is 4.35:1 on the page background, just under the 4.5:1 minimum for readable text. It is used for tab labels, the Register tab summaries and small labels.

Hosting: decide how and when to publish (see Hosting below). Until then the site is private and shown with the single-file demo.

MIC Online 2027 registration:

- Set up the Apps Script (`apps-script/README.md`): the **test** copy now, so the client can try the form in the demo, and the **live** copy before the site is published. Until then the form links to the Google Form.
- Decide where applications go: the live script can sit in the spreadsheet that already collects the Google Form's answers, so both arrive in one file, in two tabs.
- The course poster on the site is a small copy (360 × 540), so it looks soft, especially when enlarged. A larger original (1000 px wide or more) can simply replace `src/assets/courses/mic-online-2027.jpg`.

## Run it locally

Requires Node.js 22.22 or newer (24 recommended, as in `.node-version`) and Python 3.

```bash
npm ci             # install the exact versions in package-lock.json
npm run dev        # http://localhost:4321/Samathi101/ — auto-reloads as you edit
npm test           # build into dist/, update the demo, check every link (the bots run this too)
npm run preview    # serve dist/ at http://localhost:4321/Samathi101/ to double-check the build
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
  make-demo.py        ← builds the single-file demo (runs with every npm run build and npm test)
demo/                 ← the single-file demo for the client (regenerated by every build)
.github/
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

## Hosting (not published yet)

The repo is **private**: only its collaborators (**Settings → Collaborators**) can see the code. Nothing is published while we wait for the client's new course and content; the client sees the single-file demo.

**Every change:** open a pull request; the check bot (`.github/workflows/check.yml`) runs `npm test` on it. Merging into `main` doesn't publish anything.

**When the foundation is ready to publish**, the hosting choice depends on whether the repo stays private:

- **GitHub Pages** (what `astro.config.mjs` is already set up for) is free only for **public** repos. A private repo needs a paid GitHub plan, and even then the published site is public. Nothing secret is in this repo, so making it public is safe, but then anyone can read the code.
- To keep the repo private at zero cost, use a host that builds from private repos on a free plan, such as **Cloudflare Pages**. samathi101.com's DNS is already on Cloudflare.

**A ready-made GitHub Pages deploy bot** was written and then removed for now. Each run built the site and ran `npm test` (nothing published if that failed), published to GitHub Pages, checked the live site (the page, every tab, every image, font and stylesheet), and republished the last version that passed if that check failed. To bring it back: `git fetch origin pull/1/head`, then `git checkout 8b2f262 -- .github/workflows/deploy.yml scripts/smoke-test.py`, then:

1. Make the repo public (**Settings → General → Danger Zone → Change visibility**), or move to a paid plan.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Merge the restored files, then **Actions → "Deploy to GitHub Pages" → Run workflow**. After a minute or two the site is live at **https://jirayul.github.io/Samathi101/**. The comments at the top of `deploy.yml` say how to publish on every merge.

**Other one-time settings** (repo admin):
- **Settings → Rules → Rulesets → New branch ruleset** for `main`: require a pull request and the status check **check** (from the check bot), so nobody can merge a change that fails `npm test`. GitHub enforces rulesets on private repos only on paid plans; on the free plan, check for the green tick before merging.
- When the registration page goes live: give the published build the live Apps Script web app URL as `PUBLIC_SHEET_API_URL` (AGENTS.md → "Google Sheet").

### Switching english.samathi101.com to GitHub Pages

Do this once the site is published on GitHub Pages (see Hosting) and the team is happy with it. Only the `english` subdomain changes; the main `samathi101.com` site and email are not touched.

1. In this repo: set `USE_CUSTOM_DOMAIN = true` in `astro.config.mjs` and rename `public/CNAME.disabled` to `public/CNAME`. Open a pull request, merge it, and publish.
2. The domain admin edits the `english` record in **Cloudflare → DNS** for samathi101.com: Type `CNAME`, Name `english`, Target `jirayul.github.io`, Proxy status **DNS only** (grey cloud). Remove the old Canva `english` records.
3. Repo **Settings → Pages → Custom domain** shows `english.samathi101.com`. Once the DNS check passes, tick **Enforce HTTPS**.
4. In Canva, disconnect the custom domain from the old website.

To roll back, the admin puts the old `english` record back.

## Tabs and links

Each tab has its own link, so you can share a specific tab: `/#home`, `/#instructor`, `/#children`, `/#retreat`, `/#one-day`, `/#contact`, `/#register`. Linking to a single course (e.g. `/#one-day-phuket`) opens the right tab and scrolls to it.

## Adding features later

- **More registration forms on the site:** add one in `src/data/registration.ts` and the same id in `FORMS` at the top of `apps-script/Code.gs`. A static site can't keep secret keys, which is why the page posts to the Apps Script web app instead of writing to the Sheet itself.
- **Thai / English versions:** Astro has built-in i18n routing (`/th/...`) — move text from `data/*.ts` into per-language files.
- **Non-developers editing content:** connect a headless CMS (e.g. Decap, Sanity, Notion) that writes to the same data shape as `courses.ts`.
- **More pages** (course detail pages, blog, gallery): add files under `src/pages/` — each file becomes a URL.
