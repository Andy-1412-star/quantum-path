#!/usr/bin/env python3
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

SEARCH_TERMS = [
    "quantum computing",
    "quantum computer",
    "quantum error correction",
    "superconducting qubit",
    "trapped ion",
    "neutral atom",
    "Rydberg",
    "photonic quantum",
    "quantum algorithm",
    "quantum simulation",
]
MAX_RESULTS = 100
API_URL = "http://export.arxiv.org/api/query"

ATOM_NS = "http://www.w3.org/2005/Atom"
ARXIV_NS = "http://arxiv.org/schemas/atom"


def build_query() -> str:
    term_queries = [f'all:"{term}"' for term in SEARCH_TERMS]
    combined_terms = " OR ".join(term_queries)
    return f'cat:quant-ph AND ({combined_terms})'


def fetch_feed(url: str) -> bytes:
    try:
        with urllib.request.urlopen(url) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        print(f"Request failed: HTTP {exc.code} - {exc.reason}")
        sys.exit(1)
    except urllib.error.URLError as exc:
        print(f"Request failed: {exc.reason}")
        sys.exit(1)


def parse_date(date_text: str) -> str:
    if date_text.endswith("Z"):
        date_text = date_text[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(date_text)
        return dt.isoformat()
    except ValueError:
        return date_text


def extract_text(element: ET.Element | None) -> str:
    return element.text.strip() if element is not None and element.text else ""


def parse_entries(feed_xml: bytes) -> list[dict]:
    try:
        root = ET.fromstring(feed_xml)
    except ET.ParseError as exc:
        print(f"Failed to parse XML response: {exc}")
        sys.exit(1)

    ns = {"atom": ATOM_NS, "arxiv": ARXIV_NS}
    entries = []
    seen_ids = set()

    for entry in root.findall("atom:entry", ns):
        raw_id = extract_text(entry.find("atom:id", ns))
        arxiv_id = raw_id.rsplit("/", 1)[-1]
        if not arxiv_id or arxiv_id in seen_ids:
            continue

        seen_ids.add(arxiv_id)
        title = extract_text(entry.find("atom:title", ns))
        abstract = extract_text(entry.find("atom:summary", ns))
        published = parse_date(extract_text(entry.find("atom:published", ns)))
        updated = parse_date(extract_text(entry.find("atom:updated", ns)))
        authors = [
            extract_text(author.find("atom:name", ns))
            for author in entry.findall("atom:author", ns)
            if author.find("atom:name", ns) is not None
        ]

        pdf_url = ""
        url = raw_id
        for link in entry.findall("atom:link", ns):
            link_type = link.attrib.get("type", "")
            title_attr = link.attrib.get("title", "")
            rel = link.attrib.get("rel", "")
            href = link.attrib.get("href", "")
            if title_attr.lower() == "pdf" or link_type == "application/pdf":
                pdf_url = href
            if rel == "alternate" and href:
                url = href

        if not pdf_url:
            pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"

        entries.append(
            {
                "id": arxiv_id,
                "title": title,
                "abstract": abstract,
                "authors": authors,
                "publishedDate": published,
                "updatedDate": updated,
                "arxivId": arxiv_id,
                "url": url,
                "pdfUrl": pdf_url,
                "source": "arXiv",
                "platformTags": [],
                "themeTags": [],
                "summaryShort": "",
                "summaryLong": "",
                "importanceScore": None,
            }
        )

    return entries


def sort_entries(entries: list[dict]) -> list[dict]:
    def sort_key(item: dict) -> str:
        return item.get("publishedDate", "")

    return sorted(entries, key=sort_key, reverse=True)


def save_entries(entries: list[dict], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as fp:
        json.dump(entries, fp, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    query = build_query()
    params = {
        "search_query": query,
        "start": 0,
        "max_results": MAX_RESULTS,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    }
    encoded = urllib.parse.urlencode(params)
    request_url = f"{API_URL}?{encoded}"

    print("Fetching recent quantum computing papers from arXiv...")
    feed = fetch_feed(request_url)
    papers = parse_entries(feed)
    papers = sort_entries(papers)

    repo_root = Path(__file__).resolve().parent.parent
    output_file = repo_root / "data" / "papers.json"

    save_entries(papers, output_file)

    print(f"Fetched {len(papers)} papers.")
    print(f"Saved {len(papers)} papers to {output_file}")
