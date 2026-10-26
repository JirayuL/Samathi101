/**
 * Registration web app for the Samathi 101 website (english.samathi101.com).
 *
 * The site's application form (src/components/ApplyForm.astro) talks to this script:
 *   GET  ?form=<id>   -> { ok, open, message }   is registration open? (no personal data, ever)
 *   POST {form, website, email, consent, turnstile, answers: [[question, answer], ...]}
 *                     -> { ok, emailed } or { ok: false, error }
 * Each application becomes one row in the tab named in FORMS, with one column per question.
 * The applicant gets a copy of their answers by email, like a Google Form receipt.
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
    sheet: 'MIC Online 2027 (website)', // tab in this spreadsheet; created on the first application
    opens: '2026-11-01', // first day applications are accepted, from 00:00 Bangkok time
    closes: '2027-01-10', // last day applications are accepted, until 23:59 Bangkok time
    maxApplications: null, // a number here stops new applications once that many have arrived
  },
};

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
  try {
    const state = status_(config);
    if (!state.open) return json({ ok: false, error: state.message });
    saveRow_(config, data.answers);
  } catch (err) {
    console.error('Saving failed: ' + err.message); // the message never contains answers
    return json({ ok: false, error: 'Sorry, your application could not be saved. Please try again later, or email ' + REPLY_TO + '.' });
  } finally {
    lock.releaseLock();
  }

  let emailed = true;
  try {
    sendCopy_(config, data.email, data.answers);
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

/** Appends one row. The first row holds the questions; a question the sheet hasn't seen gets a new column. */
function saveRow_(config, answers) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(config.sheet) || book.insertSheet(config.sheet);
  const width = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getLastRow() ? sheet.getRange(1, 1, 1, width).getValues()[0].map(String) : [];
  if (!headers.length || headers[0] !== 'Timestamp') {
    if (headers.length) throw new Error('Row 1 of "' + config.sheet + '" must start with Timestamp');
    headers.push('Timestamp');
  }
  for (const pair of answers) if (headers.indexOf(pair[0]) === -1) headers.push(pair[0]);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);

  const row = headers.map(function () {
    return '';
  });
  for (const pair of answers) row[headers.indexOf(pair[0])] = asText_(pair[1]);
  row[0] = new Date();

  const r = sheet.getLastRow() + 1;
  const range = sheet.getRange(r, 1, 1, headers.length);
  range.setNumberFormat('@'); // keep answers as typed: phone numbers keep their leading 0 and +
  sheet.getRange(r, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  range.setValues([row]);
}

/** An answer that starts like a formula (=, +, -, @) gets a leading space, so the Sheet never runs it. */
function asText_(value) {
  const v = String(value).trim();
  return /^[=+\-@]/.test(v) ? ' ' + v : v;
}

function sendCopy_(config, email, answers) {
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
  const intro =
    'Thank you for applying for ' + config.title + '. This is a copy of your application. ' +
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
