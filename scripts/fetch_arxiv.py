#!/usr/bin/env python3
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path
from time import sleep

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
API_URL = "https://export.arxiv.org/api/query"
OAI_URL = "https://oaipmh.arxiv.org/oai"
OAI_LOOKBACK_DAYS = 14
OAI_REQUEST_DELAY_SECONDS = 3
REQUEST_TIMEOUT_SECONDS = 30
REQUEST_HEADERS = {
    "User-Agent": "QuantumPath/1.0 (https://github.com/Andy-1412-star/quantum-path)",
}

ATOM_NS = "http://www.w3.org/2005/Atom"
ARXIV_NS = "http://arxiv.org/schemas/atom"
OAI_NS = "http://www.openarchives.org/OAI/2.0/"
OAI_ARXIV_NS = "http://arxiv.org/OAI/arXiv/"


def build_query() -> str:
    term_queries = [f'all:"{term}"' for term in SEARCH_TERMS]
    combined_terms = " OR ".join(term_queries)
    return f'cat:quant-ph AND ({combined_terms})'


def fetch_feed(url: str) -> bytes | None:
    request = urllib.request.Request(url, headers=REQUEST_HEADERS)
    try:
        with urllib.request.urlopen(
            request, timeout=REQUEST_TIMEOUT_SECONDS
        ) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        print(f"Request failed: HTTP {exc.code} - {exc.reason}")
        return None
    except urllib.error.URLError as exc:
        print(f"Request failed: {exc.reason}")
        return None


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


def parse_oai_date(date_text: str) -> str:
    if not date_text:
        return ""
    try:
        return datetime.fromisoformat(date_text).replace(tzinfo=timezone.utc).isoformat()
    except ValueError:
        return date_text


def parse_oai_authors(metadata: ET.Element, ns: dict[str, str]) -> list[str]:
    authors = []
    authors_element = metadata.find("arxiv:authors", ns)
    if authors_element is None:
        return authors

    for author in authors_element.findall("arxiv:author", ns):
        forenames = extract_text(author.find("arxiv:forenames", ns))
        keyname = extract_text(author.find("arxiv:keyname", ns))
        suffix = extract_text(author.find("arxiv:suffix", ns))
        name = " ".join(part for part in (forenames, keyname, suffix) if part)
        if name:
            authors.append(name)

    return authors


def matches_search_terms(title: str, abstract: str) -> bool:
    searchable_text = f"{title} {abstract}".lower()
    return any(term.lower() in searchable_text for term in SEARCH_TERMS)


def parse_oai_entries(feed_xml: bytes) -> list[dict]:
    try:
        root = ET.fromstring(feed_xml)
    except ET.ParseError as exc:
        print(f"Failed to parse OAI XML response: {exc}")
        return []

    ns = {"oai": OAI_NS, "arxiv": OAI_ARXIV_NS}
    entries = []

    for record in root.findall(".//oai:record", ns):
        metadata = record.find("oai:metadata/arxiv:arXiv", ns)
        if metadata is None:
            continue

        arxiv_id = extract_text(metadata.find("arxiv:id", ns))
        title = extract_text(metadata.find("arxiv:title", ns))
        abstract = extract_text(metadata.find("arxiv:abstract", ns))
        if not arxiv_id or not matches_search_terms(title, abstract):
            continue

        published = parse_oai_date(extract_text(metadata.find("arxiv:created", ns)))
        updated_text = extract_text(metadata.find("arxiv:updated", ns))
        updated = parse_oai_date(updated_text) if updated_text else published

        entries.append(
            {
                "id": arxiv_id,
                "title": title,
                "abstract": abstract,
                "authors": parse_oai_authors(metadata, ns),
                "publishedDate": published,
                "updatedDate": updated,
                "arxivId": arxiv_id,
                "url": f"https://arxiv.org/abs/{arxiv_id}",
                "pdfUrl": f"https://arxiv.org/pdf/{arxiv_id}.pdf",
                "source": "arXiv",
                "platformTags": [],
                "themeTags": [],
                "summaryShort": "",
                "summaryLong": "",
                "importanceScore": None,
            }
        )

    return entries


def fetch_oai_entries() -> list[dict]:
    print("Falling back to arXiv's OAI metadata service...")
    entries_by_id = {}
    today = datetime.now(timezone.utc).date()

    for days_ago in range(OAI_LOOKBACK_DAYS):
        if days_ago:
            sleep(OAI_REQUEST_DELAY_SECONDS)

        day = today - timedelta(days=days_ago)
        params = {
            "verb": "ListRecords",
            "from": day.isoformat(),
            "until": day.isoformat(),
            "set": "physics:quant-ph",
            "metadataPrefix": "arXiv",
        }
        request_url = f"{OAI_URL}?{urllib.parse.urlencode(params)}"
        print(f"Fetching OAI records for {day.isoformat()}...")
        feed = fetch_feed(request_url)
        if feed is None:
            continue

        for entry in parse_oai_entries(feed):
            entries_by_id[entry["id"]] = entry

        if len(entries_by_id) >= MAX_RESULTS:
            break

    entries = sort_entries(list(entries_by_id.values()))
    return entries[:MAX_RESULTS]


def has_existing_data(output_path: Path) -> bool:
    try:
        with output_path.open("r", encoding="utf-8") as fp:
            data = json.load(fp)
        return isinstance(data, list) and bool(data)
    except (OSError, json.JSONDecodeError):
        return False


def sort_entries(entries: list[dict]) -> list[dict]:
    def sort_key(item: dict) -> str:
        return item.get("publishedDate", "")

    return sorted(entries, key=sort_key, reverse=True)


def save_entries(entries: list[dict], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as fp:
        json.dump(entries, fp, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    repo_root = Path(__file__).resolve().parent.parent
    output_file = repo_root / "data" / "papers.json"

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
    papers = parse_entries(feed) if feed is not None else []
    if not papers:
        papers = fetch_oai_entries()

    if len(papers) < MAX_RESULTS:
        print(f"Only fetched {len(papers)} papers; expected {MAX_RESULTS}.")
        if has_existing_data(output_file):
            print("Keeping the existing paper data until arXiv is available again.")
            sys.exit(0)
        print("No existing paper data is available to preserve.")
        sys.exit(1)

    papers = sort_entries(papers)

    save_entries(papers, output_file)

    print(f"Fetched {len(papers)} papers.")
    print(f"Saved {len(papers)} papers to {output_file}")

