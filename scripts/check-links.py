"""List every link in the built page, grouped by where it goes, and flag problems.

Usage (from the repo root, after a build):  npm run check-links

Shows:
  - each external link and every place it appears (so you can see that, e.g., both
    "Register" buttons for a course go to the same Google Form)
  - placeholder buttons that still point to "#"
  - in-page links (#something) whose target does not exist
Exits with code 1 if it finds placeholders or broken in-page links.
"""
import collections, re, sys

path = sys.argv[1] if len(sys.argv) > 1 else "dist/index.html"
html = open(path, encoding="utf-8").read()

ids = set(re.findall(r'\sid="([^"]+)"', html))
# "Where" a link is: the nearest section or tab panel before it
section_starts = [(m.start(), m.group(1)) for m in re.finditer(r'<(?:section|div(?=[^>]*role="tabpanel"))\b[^>]*\sid="([^"]+)"', html)]

def where(pos):
    before = [i for (start, i) in section_starts if start < pos]
    return before[-1] if before else "(top)"

links = []
for m in re.finditer(r'<a\b[^>]*\shref="([^"]+)"[^>]*>(.*?)</a>', html, re.S):
    text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", m.group(2))).strip()
    links.append((m.group(1), where(m.start()), text[:60]))

external = collections.defaultdict(list)
for href, place, text in links:
    if href.startswith(("http://", "https://", "mailto:")):
        external[href].append((place, text))

print("External links (each place they appear):")
for href in sorted(external):
    print(f"\n  {href}")
    for place, text in external[href]:
        print(f"     - {place:30s} {text}")

placeholders = [(place, text) for href, place, text in links if href == "#"]
broken = sorted({href for href, _, _ in links if href.startswith("#") and len(href) > 1 and href[1:] not in ids})
print("\nPlaceholder buttons (href=\"#\"):", placeholders or "none")
print("In-page links with no target:", broken or "none")
sys.exit(1 if placeholders or broken else 0)
