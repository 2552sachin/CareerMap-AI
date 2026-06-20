"""
scrape_job.py - Fetch public job posting text.
Returns dict {ok, text, title, company, error}.
"""

import re

import requests


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    )
}


def _ok(text, title="", company=""):
    return {"ok": True, "text": text or "", "title": title or "", "company": company or "", "error": ""}


def _err(error):
    return {"ok": False, "text": "", "title": "", "company": "", "error": str(error)}


def fetch_job_description(url, timeout=15):
    if not url or not url.lower().startswith(("http://", "https://")):
        return _err("Provide a full URL starting with https://")

    try:
        r = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        r.raise_for_status()
        html = r.text
    except Exception as e:
        return _err(f"Could not fetch the URL: {e}")

    title = ""
    company = ""
    text = ""

    try:
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style", "noscript", "svg", "iframe"]):
            tag.decompose()

        if soup.title and soup.title.string:
            title = re.sub(r"\s+", " ", soup.title.get_text(" ", strip=True)).strip()[:200]

        og_site = soup.find("meta", attrs={"property": "og:site_name"})
        if og_site and og_site.get("content"):
            company = og_site["content"].strip()
        if not company:
            og_title = soup.find("meta", attrs={"property": "og:title"})
            if og_title and og_title.get("content"):
                company = og_title["content"].strip()[:100]

        text = soup.get_text(" ", strip=True)
    except Exception:
        text = re.sub(r"<[^>]+>", " ", html)

    text = re.sub(r"\s+", " ", text).strip()

    if len(text) < 200:
        return _err("The page returned very little text — it may be behind a login wall or block bots.")
    if len(text) > 40000:
        text = text[:40000]

    return _ok(text, title, company)
