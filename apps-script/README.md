# Registration web app (Google Apps Script)

`Code.gs` receives applications from the site's form and saves them in a Google Sheet, one row per application, and emails each applicant a copy. It runs on the foundation's Google account for free. How it fits with the site: AGENTS.md → "Google Sheet".

Make **two copies**: a **test** one for development and demos, and the **live** one. Do the steps below once for each.

## Set it up (about 10 minutes)

1. **Pick the spreadsheet.** Test copy: "Samathi 101 registrations (TEST)". Live copy: for now "Samathi 101 registrations"; later the foundation's spreadsheet, ideally the one that already collects the Google Form's responses, so both arrive in one file.
2. In that spreadsheet: **Extensions → Apps Script**. Name the project, for example "Samathi 101 registration".
3. **Project Settings** (gear icon) → tick **Show "appsscript.json" manifest file in editor**.
4. Back in **Editor**: replace everything in `Code.gs` with this folder's `Code.gs`, and everything in `appsscript.json` with this folder's `appsscript.json`. Save.
5. **Deploy → New deployment** → type **Web app**. Description "website form". Execute as: **Me**. Who has access: **Anyone**. **Deploy**.
6. Google asks to authorize: choose the account that should own the registrations. It asks for three permissions: edit **this spreadsheet**, **send email as you** (the applicant's copy) and **connect to an external service** (Cloudflare, for the "Verify you are human" check). If Google says the app isn't verified, click Advanced → Go to the project. That's expected for your own script.
7. **Script Properties** (Project Settings, gear icon → Script Properties → Add script property):
   - **Live copy:** `TURNSTILE_SECRET` = the **secret key** of the Cloudflare Turnstile widget (README → "Going live"). Applications then need a passed "Verify you are human" check. The key stays here, never in the repo.
   - **Test copy:** `ALLOW_BEFORE_OPENING` = `yes`, so the client can try the form before registration opens. Never add it to the live copy. Leave out `TURNSTILE_SECRET` so the demo, which can't run the check, still works.
8. Copy the **Web app URL** (it ends in `/exec`).
   - Test copy: put it in `.env` on your computer as `PUBLIC_SHEET_API_URL=<url>` (copy `.env.example` to `.env` first), then restart `npm run dev`. The form now writes to the test spreadsheet, and so does the demo built on your computer (which is why the demo is never committed).
   - Live copy: in GitHub, **Settings → Secrets and variables → Actions → Secrets**, set `PUBLIC_SHEET_API_URL` to it, then run the deploy bot (README → "Going live").
9. **Try it:** open the URL with `?form=mic-online-2027` on the end. The test copy says `{"ok":true,"open":true}`. Before 1 November the live copy says it "opens on 1 November 2026", as it should. Then send a test application from the site and check that a row appears in the tab "MIC Online 2027 (website)" and that the copy arrives by email.

## Change it later

- Edit `Code.gs` in this repo first (pull request as usual), then paste it into the editor.
- **Deploy → Manage deployments** → pencil icon → Version: **New version** → Deploy. This keeps the same URL. "New deployment" would create a new URL that then has to be changed everywhere.
- **Opening and closing dates** are `opens` (first day, from 00:00) and `closes` (last day, until 23:59), Bangkok time, in `FORMS` at the top of `Code.gs`. To close early, or limit the number of applications, change `closes` or `maxApplications`.
- **After any change to `Code.gs` or `appsscript.json`, update both copies** (test and live): paste them in, then deploy a new version. If Google asks for a new permission (for example "connect to an external service"), approve it.
- A new form on the site: add it to `src/data/registration.ts`, and add the same id to `FORMS`.

## Good to know

- **Columns and IDs:** row 1 of a course tab is `Application ID`, `Student ID`, `Timestamp`, then the questions (worded as in the Google Form). A question the tab hasn't seen before gets a new column at the end, so don't rename row 1 by hand. The **Application ID** (e.g. `MIC27-0001`, from `prefix` in `FORMS`) is one per application and is the reference in the applicant's email; the **Student ID** (`WIF-00001`) is one per person, matched on email and reused across every course and year. A separate **Students** tab lists the people behind the Student IDs — the start of a cross-course student database. Both tabs appear automatically on the first application. (A tab that already holds applications from before IDs existed keeps its layout and just gets the two id columns added at the end.)
- **Privacy (PDPA):** share the spreadsheet only with the people who handle registrations. The web app answers only "open or closed" to the public and never returns anyone's answers.
- **Spam:** the form has a hidden field that people never fill in, and applications with it filled in are dropped quietly. On the live copy, the "Verify you are human" check (Cloudflare Turnstile) stops automated sending as well; if Cloudflare can't be reached, applications are refused rather than let through, and the page offers the Google Form.
- **Email limit:** a free Google account can send about 100 emails a day. If the limit is reached, the application is still saved; the applicant just doesn't get their copy.
- **Without Google:** `npm run mock-sheet` runs a local stand-in for this script, for testing the form (AGENTS.md → "Google Sheet").
