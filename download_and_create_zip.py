#!/usr/bin/env python3
"""
Usage:
  python download_and_create_zip.py "https://share.codeflying.app?..."
Creates code.zip in the current directory.
Requires: requests, beautifulsoup4
Install: pip install requests beautifulsoup4
"""
import sys
import os
import io
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import zipfile

HEADERS = {"User-Agent": "code-zipper/1.0"}

# heuristic file extensions to consider downloading from a page
CODE_EXTS = {
    ".py", ".js", ".ts", ".java", ".c", ".cpp", ".h", ".hpp", ".go", ".rb",
    ".php", ".html", ".css", ".json", ".yaml", ".yml", ".md", ".txt", ".sh",
    ".ps1", ".rs", ".swift", ".kt", ".gradle", ".xml", ".dockerfile"
}

def is_likely_file(url):
    p = urlparse(url).path
    _, ext = os.path.splitext(p)
    return ext.lower() in CODE_EXTS or ext != ""

def fetch_url(url, session):
    r = session.get(url, headers=HEADERS, timeout=30, allow_redirects=True, stream=True)
    r.raise_for_status()
    return r

def filename_from_response(resp, url):
    # try content-disposition
    cd = resp.headers.get("content-disposition", "")
    if "filename=" in cd:
        # crude parse
        idx = cd.find("filename=")
        fn = cd[idx+9:].strip(' "')
        return fn
    # fallback to path basename
    path = urlparse(url).path
    name = os.path.basename(path) or "index.html"
    return name

def gather_files_from_page(url, session):
    resp = fetch_url(url, session)
    content_type = resp.headers.get("content-type", "")
    if "text/html" not in content_type:
        # direct file
        return [(url, filename_from_response(resp, url), resp.content)]
    html = resp.text
    soup = BeautifulSoup(html, "html.parser")
    links = set()
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        full = urljoin(url, href)
        # same domain only (safety)
        if urlparse(full).netloc != urlparse(url).netloc:
            continue
        links.add(full)
    files = []
    # include the page itself as index.html if useful
    files.append((url, "index.html", resp.content))
    # try to download likely code files from links (one level)
    for link in sorted(links):
        if is_likely_file(link):
            try:
                r = fetch_url(link, session)
                name = filename_from_response(r, link)
                files.append((link, name, r.content))
            except Exception:
                # ignore download errors for individual files
                continue
    return files

def create_zip_from_url(url, out_zip="code.zip"):
    session = requests.Session()
    try:
        files = gather_files_from_page(url, session)
    except Exception as e:
        # try as direct file fetch
        try:
            r = fetch_url(url, session)
            files = [(url, filename_from_response(r, url), r.content)]
        except Exception as e2:
            print("Error fetching URL:", e2)
            return False
    seen_names = set()
    with zipfile.ZipFile(out_zip, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for src_url, name, content in files:
            # avoid name collisions
            safe_name = name
            i = 1
            while safe_name in seen_names:
                base, ext = os.path.splitext(name)
                safe_name = f"{base}_{i}{ext}"
                i += 1
            seen_names.add(safe_name)
            zf.writestr(safe_name, content)
            print(f"Added {safe_name} from {src_url}")
    print(f"Created {out_zip} with {len(seen_names)} file(s).")
    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python download_and_create_zip.py <URL>")
        sys.exit(1)
    url = sys.argv[1]
    ok = create_zip_from_url(url)
    if not ok:
        sys.exit(2)

if __name__ == "__main__":
    main()