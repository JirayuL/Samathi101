/**
 * Registration web app for the Samathi 101 website (english.samathi101.com).
 *
 * The site's application form (src/components/ApplyForm.astro) talks to this script:
 *   GET  ?form=<id>   -> { ok, open, message }   is registration open? (no personal data, ever)
 *   POST {form, website, email, name, consent, turnstile, answers: [[question, answer], ...]}
 *                     -> { ok, emailed } or { ok: false, error }
 * Each application becomes one row in the tab named in FORMS: an Application ID (one per application,
 * e.g. MIC27-0001) and a Student ID (one per person, matched on email and reused across courses and
 * years), then the Timestamp and one column per question. The Students tab lists the people behind the
 * Student IDs. The applicant gets a copy of their answers, with their Application ID, by email.
 *
 * Set up and update: apps-script/README.md. This file is the reviewed copy: change it here first,
 * then paste it into the Apps Script editor and deploy a new version.
 *
 * Settings that stay out of the repo (Apps Script editor -> Project Settings -> Script Properties):
 *   TURNSTILE_SECRET      Cloudflare Turnstile secret key: applications need a passed "Verify you are human"
 *                         check. Set it on the live copy. Without it the check is skipped (test copy, demo).
 *   ALLOW_BEFORE_OPENING  yes = take applications before the opening date. Test copy only, never live.
 */

/** One entry per form on the site. The key is the form's id in src/data/registration.ts. */
const FORMS = {
  'mic-online-2027': {
    title: 'MIC Online — Batch 1 (2027)',
    prefix: 'MIC27', // Application IDs look like MIC27-0001; keep it short and unique to this form
    sheet: 'MIC Online 2027 (website)', // tab in this spreadsheet; created on the first application
    opens: '2026-11-01', // first day applications are accepted, from 00:00 Bangkok time
    closes: '2027-01-10', // last day applications are accepted, until 23:59 Bangkok time
    maxApplications: null, // a number here stops new applications once that many have arrived
  },
};

const STUDENTS_SHEET = 'Students'; // one row per person, keyed on email; links the same person across courses
const REPLY_TO = 'wif.meditation@gmail.com';
const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const SENDER_NAME = 'Willpower Institute Foundation';
const LIMITS = { body: 60000, answers: 60, question: 500, answer: 5000 };

function doGet(e) {
  const id = e && e.parameter && e.parameter.form;
  const config = FORMS[id];
  if (!config) return json({ ok: false, error: 'Unknown form.' });
  return json(Object.assign({ ok: true }, status_(config)));
}

function doPost(e) {
  let data;
  try {
    if (!e || !e.postData || e.postData.contents.length > LIMITS.body) throw new Error();
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'The application could not be read. Please try again.' });
  }

  const config = FORMS[data.form];
  if (!config) return json({ ok: false, error: 'Unknown form.' });
  // Spam trap: the hidden "website" field is empty for people. Pretend it worked so bots don't retry.
  if (data.website) return json({ ok: true });

  const problem = check_(data);
  if (problem) return json({ ok: false, error: problem });
  if (!human_(data.turnstile)) {
    return json({ ok: false, error: 'Please complete the "Verify you are human" check above the Submit button, then send again.' });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return json({ ok: false, error: 'We are busy right now. Please try again in a minute.' });
  let applicationId;
  try {
    const state = status_(config);
    if (!state.open) return json({ ok: false, error: state.message });
    applicationId = saveApplication_(config, data);
  } catch (err) {
    console.error('Saving failed: ' + err.message); // the message never contains answers
    return json({ ok: false, error: 'Sorry, your application could not be saved. Please try again later, or email ' + REPLY_TO + '.' });
  } finally {
    lock.releaseLock();
  }

  let emailed = true;
  try {
    sendCopy_(config, data.email, data.answers, applicationId);
  } catch (err) {
    emailed = false; // e.g. the daily email quota is used up; the application is saved anyway
  }
  return json({ ok: true, emailed: emailed });
}

/** Returns a message for the applicant if something is wrong, or '' if the application is fine. */
function check_(data) {
  const answers = data.answers;
  if (!Array.isArray(answers) || !answers.length || answers.length > LIMITS.answers) return 'The application is incomplete.';
  for (const pair of answers) {
    if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string') {
      return 'The application could not be read. Please try again.';
    }
    if (!pair[0].trim() || pair[0].length > LIMITS.question) return 'The application could not be read. Please try again.';
    if (pair[1].length > LIMITS.answer) return 'One of your answers is too long. Please shorten it and try again.';
  }
  if (typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return 'Please enter a valid email address.';
  }
  if (data.consent !== 'Agree') return 'Please agree to the terms and conditions to apply.';
  return '';
}

/** Asks Cloudflare whether the "Verify you are human" check was passed. Skipped when TURNSTILE_SECRET isn't set. */
function human_(token) {
  const secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  if (!secret) return true;
  if (typeof token !== 'string' || !token || token.length > 2048) return false;
  try {
    const res = UrlFetchApp.fetch(TURNSTILE_VERIFY, {
      method: 'post',
      payload: { secret: secret, response: token },
      muteHttpExceptions: true,
    });
    return JSON.parse(res.getContentText()).success === true;
  } catch (err) {
    return false; // Cloudflare unreachable: refuse rather than let bots through; the page offers the Google Form
  }
}

/** Whether a form takes applications now. Never returns personal data: anyone can call doGet. */
function status_(config) {
  const now = new Date();
  const opens = new Date(config.opens + 'T00:00:00+07:00');
  const testCopy = PropertiesService.getScriptProperties().getProperty('ALLOW_BEFORE_OPENING') === 'yes';
  if (now < opens && !testCopy) {
    return { open: false, message: 'Registration for ' + config.title + ' opens on ' + longDate_(config.opens) + '.' };
  }
  const closes = new Date(config.closes + 'T23:59:59+07:00');
  if (now > closes) return { open: false, message: 'Registration for ' + config.title + ' has closed.' };
  if (config.maxApplications) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.sheet);
    const count = sheet ? Math.max(sheet.getLastRow() - 1, 0) : 0;
    if (count >= config.maxApplications) return { open: false, message: config.title + ' is full. Thank you for your interest.' };
  }
  return { open: true };
}

/**
 * Saves one application as a row and returns its Application ID. The first three columns are the
 * Application ID (one per application), the Student ID (one per person; see resolveStudent_) and the
 * Timestamp; then one column per question. A question the tab hasn't seen before gets a new column.
 */
function saveApplication_(config, data) {
  const answers = data.answers;
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(config.sheet) || book.insertSheet(config.sheet);
  const width = Math.max(sheet.getLastColumn(), 1);
  let headers = sheet.getLastRow() ? sheet.getRange(1, 1, 1, width).getValues()[0].map(String) : [];
  if (!headers.length) {
    headers = ['Application ID', 'Student ID', 'Timestamp'];
  } else if (headers.indexOf('Timestamp') === -1) {
    throw new Error('Row 1 of "' + config.sheet + '" must include a Timestamp column');
  } else {
    // An older tab from before IDs existed: add the two id columns at the end rather than move data.
    for (const h of ['Application ID', 'Student ID']) if (headers.indexOf(h) === -1) headers.push(h);
  }
  for (const pair of answers) if (headers.indexOf(pair[0]) === -1) headers.push(pair[0]);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // The Timestamp guard above has already ruled out a misaligned tab, so resolving the person here
  // (which writes to the Students tab) can't leave a student with no matching application row.
  const studentId = resolveStudent_(data.email, data.name);
  const r = sheet.getLastRow() + 1;
  const applicationId = config.prefix + '-' + pad_(r - 1, 4); // r - 1 is the application's number (row 1 is headers)

  const row = headers.map(function () {
    return '';
  });
  for (const pair of answers) row[headers.indexOf(pair[0])] = asText_(pair[1]);
  row[headers.indexOf('Application ID')] = applicationId;
  row[headers.indexOf('Student ID')] = studentId;
  const tsCol = headers.indexOf('Timestamp');
  row[tsCol] = new Date();

  const range = sheet.getRange(r, 1, 1, headers.length);
  range.setNumberFormat('@'); // keep answers as typed: phone numbers keep their leading 0 and +
  sheet.getRange(r, tsCol + 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  range.setValues([row]);
  return applicationId;
}

/**
 * Returns the Student ID for this email, the same one every time that email applies, so one person's
 * applications (across courses and years) can be found together later. The Students tab is the list:
 * Student ID, Email, Name, First registered, Last registered, Applications. Email is the match key,
 * compared lower-case and trimmed; someone who applies under two emails gets two ids (merge by hand).
 */
function resolveStudent_(email, name) {
  const key = String(email).trim().toLowerCase();
  const person = String(name == null ? '' : name).trim();
  const header = ['Student ID', 'Email', 'Name', 'First registered', 'Last registered', 'Applications'];
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(STUDENTS_SHEET) || book.insertSheet(STUDENTS_SHEET);
  if (!sheet.getLastRow()) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  const now = new Date();
  const dataRows = Math.max(sheet.getLastRow() - 1, 0);
  const rows = dataRows ? sheet.getRange(2, 1, dataRows, header.length).getValues() : [];
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][1]).trim().toLowerCase() === key) {
      const id = String(rows[i][0]);
      const count = Number(rows[i][5]) || 0;
      // Keep First registered (rows[i][3]); refresh Last registered, the count and the name.
      writeStudentRow_(sheet, i + 2, [id, rows[i][1], asText_(person || rows[i][2]), rows[i][3], now, count + 1]);
      return id;
    }
  }
  const id = 'WIF-' + pad_(dataRows + 1, 5);
  writeStudentRow_(sheet, sheet.getLastRow() + 1, [id, key, asText_(person), now, now, 1]);
  return id;
}

/** Writes one Students row: ids, email and name as text, the two date columns as dates. */
function writeStudentRow_(sheet, r, values) {
  const range = sheet.getRange(r, 1, 1, values.length);
  range.setNumberFormat('@');
  sheet.getRange(r, 4).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange(r, 5).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  range.setValues([values]);
}

/** Zero-pads a number to a width, e.g. pad_(7, 4) -> '0007'. */
function pad_(n, width) {
  let s = String(n);
  while (s.length < width) s = '0' + s;
  return s;
}

/** An answer that starts like a formula (=, +, -, @) gets a leading space, so the Sheet never runs it. */
function asText_(value) {
  const v = String(value).trim();
  return /^[=+\-@]/.test(v) ? ' ' + v : v;
}

function sendCopy_(config, email, answers, applicationId) {
  const lines = answers.filter(function (pair) {
    return pair[1];
  });
  const text = lines
    .map(function (pair) {
      return pair[0] + '\n' + pair[1];
    })
    .join('\n\n');
  const html = lines
    .map(function (pair) {
      return '<p><b>' + escape_(pair[0]) + '</b><br>' + escape_(pair[1]).replace(/\n/g, '<br>') + '</p>';
    })
    .join('');
  const reference = applicationId ? ' Your application reference is ' + applicationId + '.' : '';
  const intro =
    'Thank you for applying for ' + config.title + '.' + reference + ' This is a copy of your application. ' +
    'Please keep it as proof of your application. We will send further instructions before the orientation.';
  MailApp.sendEmail({
    to: email,
    subject: 'Your application: ' + config.title,
    replyTo: REPLY_TO,
    name: SENDER_NAME,
    body: intro + '\n\n' + text + '\n\nQuestions? Reply to this email or write to ' + REPLY_TO + '.',
    htmlBody: '<p>' + escape_(intro) + '</p>' + html + '<p>Questions? Reply to this email or write to ' + REPLY_TO + '.</p>',
  });
}

/** '2026-11-01' -> '1 November 2026' */
function longDate_(iso) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const parts = iso.split('-').map(Number);
  return parts[2] + ' ' + months[parts[1] - 1] + ' ' + parts[0];
}

function escape_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
