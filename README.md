# english.samathi101.com — Willpower Institute English Meditation Courses

Landing page rebuilt from the Canva design, using [Astro](https://astro.build).

**Working on the site? Start with [AGENTS.md](AGENTS.md)**: setup, where to edit, rules and the pre-push checklist.

**Why Astro:** pages are plain HTML + CSS components (easy to read and edit), the output is a static site that GitHub Pages hosts for free (see Hosting below), images are optimized automatically, and when you need server features later (forms, Thai language, a CMS, a database) Astro supports them without switching frameworks.

---

## Demo for the client

`demo/samathi101-demo.html` is the whole site in one file. Open it in any browser, or send it over LINE or email; it works offline, except the YouTube video. It is a snapshot: run `npm run demo` to regenerate it after changes.

## Run it locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev        # http://localhost:4321 — auto-reloads as you edit
npm run build      # outputs the production site to dist/
npm run preview    # serve dist/ locally to double-check the build
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
    Tabs.astro        ← sticky tab bar (Home, Children, 7-Day, 1-Day, Instructor, Contact, Register)
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
.github/workflows/deploy.yml ← the bot: builds and publishes to GitHub Pages on every push
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

Still to fill in: the MIC **YouTube video ID** (`youtubeId` in `courses.ts`).

## Hosting: GitHub Pages (free)

The bot in `.github/workflows/deploy.yml` builds the site and publishes it on every push to `main`.

**One-time setup**
1. GitHub Pages is free only for **public** repositories (private needs a paid GitHub plan). Repo **Settings → General → Danger Zone → Change visibility → Public**. Nothing secret is in this repo; never commit passwords or API keys.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The **Actions** tab shows the build; after about a minute the site is live at **https://jirayul.github.io/Samathi101/** for the team to review.

**Updating the site:** edit, commit, `git push`. The bot republishes within about a minute.

### Switching english.samathi101.com to GitHub Pages

Do this when the team is happy with the review link. Only the `english` subdomain changes; the main `samathi101.com` site and email are not touched.

1. In this repo: set `USE_CUSTOM_DOMAIN = true` in `astro.config.mjs` and rename `public/CNAME.disabled` to `public/CNAME`. Commit and push.
2. The domain admin edits the `english` record in **Cloudflare → DNS** for samathi101.com: Type `CNAME`, Name `english`, Target `jirayul.github.io`, Proxy status **DNS only** (grey cloud). Remove the old Canva `english` records.
3. Repo **Settings → Pages → Custom domain** shows `english.samathi101.com`. Once the DNS check passes, tick **Enforce HTTPS**.
4. In Canva, disconnect the custom domain from the old website.

To roll back, the admin puts the old `english` record back.

## Tabs and links

Each tab has its own link, so you can share a specific tab: `/#home`, `/#children`, `/#retreat`, `/#one-day`, `/#instructor`, `/#videos`, `/#contact`, `/#register`. Linking to a single course (e.g. `/#one-day-phuket`) opens the right tab and scrolls to it.

## Adding features later

- **Registration page for new courses** (website → Google Sheet): the existing courses stay on Google Forms. GitHub Pages can't keep secret keys, so the page posts to a Google Apps Script web app that writes the row into the Sheet.
- **Thai / English versions:** Astro has built-in i18n routing (`/th/...`) — move text from `data/*.ts` into per-language files.
- **Non-developers editing content:** connect a headless CMS (e.g. Decap, Sanity, Notion) that writes to the same data shape as `courses.ts`.
- **More pages** (course detail pages, blog, gallery): add files under `src/pages/` — each file becomes a URL.
