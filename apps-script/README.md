# Registration web app (Google Apps Script)

`Code.gs` receives applications from the site's form and saves them in a Google Sheet, one row per application, and emails each applicant a copy. It runs on the foundation's Google account for free. How it fits with the site: AGENTS.md → "Google Sheet".

Make **two copies**: a **test** one for development and demos, and the **live** one. Do the steps below once for each.

## Set it up (about 10 minutes)

1. **Pick the spreadsheet.** For the live copy, use the spreadsheet that already collects the Google Form's responses (in the Google Form: Responses → Link to Sheets). The website's applications then land in a tab next to them. For the test copy, make a new spreadsheet, for example "Samathi 101 registrations (TEST)".
2. In that spreadsheet: **Extensions → Apps Script**. Name the project, for example "Samathi 101 registration".
3. **Project Settings** (gear icon) → tick **Show "appsscript.json" manifest file in editor**.
4. Back in **Editor**: replace everything in `Code.gs` with this folder's `Code.gs`, and everything in `appsscript.json` with this folder's `appsscript.json`. Save.
5. **Deploy → New deployment** → type **Web app**. Description "website form". Execute as: **Me**. Who has access: **Anyone**. **Deploy**.
6. Google asks to authorize: choose the foundation's account. It asks for two permissions, to edit **this spreadsheet** and to **send email as you** (for the applicant's copy). If Google says the app isn't verified, click Advanced → Go to the project. That's expected for your own script.
7. Copy the **Web app URL** (it ends in `/exec`).
   - Test copy: put it in `.env` on your computer as `PUBLIC_SHEET_API_URL=<url>` (copy `.env.example` to `.env` first), then restart `npm run dev`. The form now writes to the test spreadsheet, and so does the demo built on your computer.
   - Live copy: give it to whoever publishes the site, as the `PUBLIC_SHEET_API_URL` build setting (AGENTS.md → "Google Sheet").
8. **Try it:** open the URL with `?form=mic-online-2027` on the end. You should see `{"ok":true,"open":true}`. Then send a test application from the site and check that a row appears in the tab "MIC Online 2027 (website)" and that the copy arrives by email.

## Change it later

- Edit `Code.gs` in this repo first (pull request as usual), then paste it into the editor.
- **Deploy → Manage deployments** → pencil icon → Version: **New version** → Deploy. This keeps the same URL. "New deployment" would create a new URL that then has to be changed everywhere.
- To close registration early, or limit it, change `closes` or `maxApplications` in `FORMS` at the top of `Code.gs`.
- A new form on the site: add it to `src/data/registration.ts`, and add the same id to `FORMS`.

## Good to know

- **Columns:** row 1 holds the questions, worded as in the Google Form. A question the tab hasn't seen before gets a new column at the end, so don't rename row 1 by hand.
- **Privacy (PDPA):** share the spreadsheet only with the people who handle registrations. The web app answers only "open or closed" to the public and never returns anyone's answers.
- **Spam:** the form has a hidden field that people never fill in. Applications with it filled in are dropped quietly.
- **Email limit:** a free Google account can send about 100 emails a day. If the limit is reached, the application is still saved; the applicant just doesn't get their copy.
- **Without Google:** `npm run mock-sheet` runs a local stand-in for this script, for testing the form (AGENTS.md → "Google Sheet").
