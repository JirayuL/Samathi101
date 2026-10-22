"""Turn a built site (dist-demo/) into ONE self-contained HTML file for showing the client.

Usage (from the repo root):  npm run demo
  = astro build --base / --outDir dist-demo  +  python3 scripts/make-demo.py dist-demo demo/samathi101-demo.html

Inlines the CSS, images (largest size up to 1000px for the page, plus the large
versions used by the click-to-preview lightbox), fonts (Latin subset only) and favicons.
"""
import re, base64, sys, pathlib, mimetypes
dist = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
html = (dist/"index.html").read_text()

def data_uri(path):
    p = dist/path.lstrip("/")
    mime = {".webp":"image/webp",".woff2":"font/woff2"}.get(p.suffix) or mimetypes.guess_type(str(p))[0] or "application/octet-stream"
    return f"data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"

# Inline local stylesheets
def css_sub(m):
    css = (dist/m.group(1).lstrip("/")).read_text()
    # Preview only: keep the Latin subset of each font (woff2), embed it, drop the rest
    def ff(fm):
        block = fm.group(0)
        if "-latin-" not in block or "-latin-ext-" in block:
            return ""
        w2 = re.search(r"url\((/_astro/[^)]+\.woff2)\)", block).group(1)
        block = re.sub(r"src:[^;}]+", f'src:url({data_uri(w2)}) format("woff2")', block)
        return block
    css = re.sub(r"@font-face\{[^}]*\}", ff, css)
    return "<style>" + css + "</style>"
html = re.sub(r'<link rel="stylesheet" href="(/_astro/[^"]+\.css)">', css_sub, html)

# Images: pick the largest srcset candidate up to ~1000w, embed it, drop srcset/sizes
def img_sub(m):
    tag = m.group(0)
    if not re.search(r'\ssrc="', tag):
        return tag  # e.g. the empty lightbox <img>, filled in by script
    srcset = re.search(r'srcset="([^"]+)"', tag)
    src = re.search(r'\ssrc="([^"]+)"', tag).group(1)
    if srcset:
        cands = []
        for part in srcset.group(1).split(","):
            u, w = part.strip().rsplit(" ", 1)
            cands.append((int(w.rstrip("w")), u))
        cands.sort()
        ok = [c for c in cands if c[0] <= 1000] or cands[:1]
        src = ok[-1][1]
    tag = re.sub(r'\s(srcset|sizes)="[^"]*"', "", tag)
    tag = re.sub(r'src="[^"]+"', f'src="{data_uri(src)}"', tag, count=1)
    return tag
html = re.sub(r"<img\b[^>]*>", img_sub, html)

# CSS background url(...) in inline styles
html = re.sub(r"url\((/_astro/[^)]+)\)", lambda m: f"url({data_uri(m.group(1))})", html)
# Lightbox links to large images
html = re.sub(r'href="(/_astro/[^"]+\.webp)"', lambda m: f'href="{data_uri(m.group(1))}"', html)
# Favicons
html = re.sub(r'href="(/favicon[^"]*\.png)"', lambda m: f'href="{data_uri(m.group(1))}"', html)
# Leftover root-relative links that would break outside the site
html = html.replace('href="/"', 'href="#"')

leftover = re.findall(r'(?:src|href)="/(?!/)[^"]*"', html)
print("leftover local refs:", leftover)
out.write_text(html)
print(out, round(out.stat().st_size/1024), "KB")
