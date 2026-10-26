"""Check a running copy of the site: the page loads, every tab is there, and every file it uses loads.

Usage:  npm run smoke-test -- <site URL>
  live site:      npm run smoke-test -- https://jirayul.github.io/Samathi101/
  local build:    npm run build && npm run preview   then   npm run smoke-test -- http://localhost:4321/Samathi101/

The deploy bot runs this on the live site right after publishing. If it fails, the bot
republishes the last version that passed (see .github/workflows/deploy.yml).
Exits with code 1 on any problem.
"""
import html as htmllib, re, sys, time, urllib.error, urllib.parse, urllib.request

site = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4321/Samathi101/"
if not site.endswith("/"):
    site += "/"
host = urllib.parse.urlsplit(site).netloc

def fetch(url, method="GET"):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": "samathi101-smoke-test"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, b""
    except (urllib.error.URLError, TimeoutError) as e:
        return str(e), b""

# 1. The page. A site that was just published can take a moment, so try for about a minute.
#    The ?smoke= query skips any cached copy of the old page.
for attempt in range(6):
    status, body = fetch(f"{site}?smoke={int(time.time())}")
    if status == 200:
        break
    if attempt < 5:
        time.sleep(10)
else:
    sys.exit(f"FAIL: {site} did not load ({status})")
page = body.decode("utf-8")
problems = []

# 2. Every tab has its panel
tabs = re.findall(r'role="tab"[^>]*aria-controls="([^"]+)"', page)
if not tabs:
    problems.append("no tabs found on the page")
for tab in tabs:
    if f'id="{tab}"' not in page:
        problems.append(f'tab "{tab}" has no panel')
if "<title>" not in page:
    problems.append("the page has no <title>")

# 3. Every file the page uses on this site (styles, scripts, images, fonts, favicons) loads
def same_site(refs, base):
    urls = set()
    for ref in refs:
        ref = htmllib.unescape(ref.strip().strip("'\""))
        if not ref or ref.startswith(("#", "mailto:", "data:")):
            continue
        url = urllib.parse.urljoin(base, ref)
        if urllib.parse.urlsplit(url).netloc == host and url.split("#")[0].rstrip("/") != site.rstrip("/"):
            urls.add(url.split("#")[0])
    return urls

refs = re.findall(r'\s(?:src|href)="([^"]+)"', page) + re.findall(r"url\(([^)]+)\)", page)
for srcset in re.findall(r'\ssrcset="([^"]+)"', page):
    refs += [part.strip().split(" ")[0] for part in srcset.split(",")]
files = same_site(refs, site)

checked = set()
while files:
    url = files.pop()
    if url in checked:
        continue
    checked.add(url)
    is_css = url.endswith(".css")
    status, content = fetch(url, "GET" if is_css else "HEAD")
    if status == 405:
        status, content = fetch(url)
    if status != 200:
        problems.append(f"{status}  {url}")
    elif is_css:  # fonts and images the stylesheet uses
        files |= same_site(re.findall(r"url\(([^)]+)\)", content.decode("utf-8", "replace")), url) - checked

if problems:
    print(f"FAIL: {site}")
    for p in problems:
        print("  -", p)
    sys.exit(1)
print(f"OK: {site} loads, {len(tabs)} tabs, {len(checked)} files")
