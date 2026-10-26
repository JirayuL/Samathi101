"""A stand-in for the Google Apps Script web app (apps-script/Code.gs), for testing the site's
registration form on your own computer without Google. Applications are printed here, not saved.

Usage:  npm run mock-sheet                  (or: python3 scripts/mock-sheet-api.py [--closed] [--fail] [--human])
Then in .env:  PUBLIC_SHEET_API_URL=http://localhost:8787/exec   and restart npm run dev.

  --closed   answer that registration has closed (the form greys out)
  --fail     refuse every application (to see the error message)
  --human    refuse applications without a "Verify you are human" token, like the live script
             with TURNSTILE_SECRET set (it doesn't ask Cloudflare whether the token is real)

Like Apps Script, it doesn't answer the browser's CORS preflight, so a fetch that adds a
Content-Type header fails here too.
"""
import json, re, sys, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

sys.stdout.reconfigure(line_buffering=True)  # print each application straight away, even in a log window
PORT = 8787
CLOSED = "--closed" in sys.argv
FAIL = "--fail" in sys.argv
HUMAN = "--human" in sys.argv
count = 0


class Handler(BaseHTTPRequestHandler):
    def reply(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        form = parse_qs(urlsplit(self.path).query).get("form", [""])[0]
        if not form:
            return self.reply({"ok": False, "error": "Unknown form."})
        if CLOSED:
            return self.reply({"ok": True, "open": False, "message": f"Registration for {form} has closed. (mock)"})
        self.reply({"ok": True, "open": True})

    def do_OPTIONS(self):
        self.send_response(405)  # Apps Script can't answer a CORS preflight either
        self.end_headers()

    def do_POST(self):
        global count
        time.sleep(1)  # Apps Script takes a second or two
        try:
            data = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
        except ValueError:
            return self.reply({"ok": False, "error": "The application could not be read. Please try again."})
        if data.get("website"):
            print("Spam trap filled in: ignored")
            return self.reply({"ok": True})
        if FAIL:
            return self.reply({"ok": False, "error": "Sorry, your application could not be saved. (mock --fail)"})
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", str(data.get("email", ""))):
            return self.reply({"ok": False, "error": "Please enter a valid email address."})
        if data.get("consent") != "Agree":
            return self.reply({"ok": False, "error": "Please agree to the terms and conditions to apply."})
        if HUMAN and not data.get("turnstile"):
            return self.reply({"ok": False, "error": 'Please complete the "Verify you are human" check above the Submit button, then send again.'})
        count += 1
        print(f"\n=== Application {count} for {data.get('form')} (human check token: {'yes' if data.get('turnstile') else 'no'}) ===")
        for question, answer in data.get("answers", []):
            print(f"  {question[:70]:70}  {answer!r}")
        self.reply({"ok": True, "emailed": True})

    def log_message(self, *args):
        pass


print(f"Mock registration web app on http://localhost:{PORT}/exec" + (" (closed)" if CLOSED else "") + (" (failing)" if FAIL else "") + (" (human check required)" if HUMAN else ""))
ThreadingHTTPServer(("localhost", PORT), Handler).serve_forever()
