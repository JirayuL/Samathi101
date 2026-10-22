# AGENTS.md — working on the Samathi 101 website

Guide for anyone, person or AI coding assistant, who sets up, changes or edits this site. Read it before your first change. `README.md` has the background and the hosting details.

## What this is

- The English meditation courses site of the **Willpower Institute Foundation** (Luangphor Viriyang Sirintharo), planned for **https://english.samathi101.com**.
- A static site built with **Astro**. One page (`src/pages/index.astro`) with tabs: Home, Children Course, 7-Day Course, 1-Day Course, Instructor Course, Videos, Contact Us, Register.
- This is volunteer work for a charity. Keep running costs at zero, and keep things simple enough for the next volunteer to pick up.

## Set up

Needs Node.js 22 or newer, and Python 3 for the two helper scripts.

```bash
git clone git@github.com:JirayuL/Samathi101.git
cd Samathi101
npm install
npm run dev            # http://localhost:4321/Samathi101/, reloads as you edit
```

| Command | What it does |
|---|---|
| `npm run dev` | Local preview while editing |
| `npm run build` | Builds the site into `dist/`; must pass before you push |
| `npm run check-links` | After a build: lists every link and where it appears, and fails on `#` placeholders or broken in-page links |
| `npm run demo` | Makes `demo/samathi101-demo.html`, the whole site in one file for showing the client |

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

Course `status` is `open`, `coming-soon` or `closed`; the buttons follow it automatically. Each course's Register button shows on its own tab and on the Register tab, both from the same entry, so one edit changes both.

## Rules

1. **Existing courses keep their Google Forms.** Do not change those registration links unless the foundation asks. Only the **new course** gets the on-site registration page (website → Google Sheet).
2. **No secrets in the repo.** It may be made public for GitHub Pages: no passwords, API keys or private sheet links. The Google Sheet is written through a Google Apps Script web app, never with keys in the site's code.
3. **Personal data (Thailand's PDPA).** Registration collects personal details, including children's. Ask only for what the course needs, keep consent wording on forms, and don't add tracking (Pixel, Analytics) without a consent banner.
4. **Keep the look.** Use the color and font variables in `global.css`. Fonts are Taviraj and Sarabun, which both support Thai. No new fonts, colors or UI libraries without asking.
5. **Images go in `src/assets/`** with a real `alt` text, so Astro optimizes them. Use `public/` only for files served as-is (favicon, CNAME).
6. **Paths:** the site is built for `/Samathi101/` until the domain switch (see `astro.config.mjs`). Don't hard-code links that start with `/`; use `#tab-id` links or `import.meta.env.BASE_URL`.
7. **Keep it accessible:** working keyboard focus, real link text, readable on a phone at 375px wide.

## Before you push

- [ ] `npm run build` passes
- [ ] `npm run check-links`: every Register button goes to the right form, and nothing says `#`
- [ ] You looked at the changed tab on a desktop and a phone-width window
- [ ] `npm run demo` if the client will review this change

## Git and deploying

- Work on a branch and open a pull request into `main`; ask Gear (JirayuL) to review.
- `.github/workflows/deploy.yml` is the deploy bot. For now it runs **only by hand** (GitHub → Actions → "Deploy to GitHub Pages" → Run workflow), because the client approves the demo first. After approval, uncomment the `push` trigger so every merge to `main` deploys.
- Moving to english.samathi101.com: follow README → "Switching english.samathi101.com to GitHub Pages".

## Planned work

- Registration page for the new course (starts 1 Nov 2026) → Google Sheet via Apps Script, demoed to the client before going live
- Meta Pixel and Google Analytics with a consent banner, to see where people come from and what they register for
- SEO: share image, structured data for courses, sitemap and robots.txt, Search Console after the domain switch
