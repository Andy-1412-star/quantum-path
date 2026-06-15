#!/usr/bin/env python3
import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any

OUTPUT_PATH = Path(__file__).resolve().parent.parent / 'data' / 'papers.json'
SENTENCE_END_RE = re.compile(r'(?<=[.!?])\s+')

PLATFORM_STATEMENTS = {
    'Neutral Atoms / Rydberg': 'The work is relevant to atom-array quantum computing and quantum simulation.',
    'Superconducting Qubits': 'The work is relevant to circuit-based quantum processors.',
    'Trapped Ions': 'The work is relevant to high-control trapped-ion quantum computing platforms.',
    'Photonic Quantum Computing': 'The work is relevant to optical quantum information processing.',
    'Semiconductor Spin Qubits': 'The work is relevant to scalable solid-state qubit platforms.',
    'Topological Quantum Computing': 'The work is relevant to fault-tolerant approaches based on topology.',
}

THEME_STATEMENTS = {
    'Quantum Error Correction': 'It is relevant to reliable logical qubits and improved quantum reliability.',
    'Quantum Simulation': 'It is relevant to simulating quantum many-body systems.',
    'Quantum Algorithms': 'It is relevant to computational applications of quantum devices.',
    'Many-Body Physics': 'It is relevant to understanding correlations and collective quantum behavior.',
}

GENERAL_STATEMENT = 'The work is relevant to broader quantum computing research and helps contextualize progress in the field.'


def load_json(path: Path) -> Any:
    with path.open('r', encoding='utf-8') as handle:
        return json.load(handle)


def save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('w', encoding='utf-8') as handle:
        json.dump(data, handle, indent=2, ensure_ascii=False)


def extract_first_sentence(text: str) -> str:
    text = ' '.join(text.split())
    if not text:
        return ''

    sentences = SENTENCE_END_RE.split(text)
    return sentences[0].strip() if sentences else text


def clean_summary(text: str, limit: int = 220) -> str:
    text = ' '.join(text.split())
    if len(text) <= limit:
        return text
    return text[:limit].rstrip().rstrip('.,;:') + '...'


def build_summary_short(abstract: str) -> str:
    sentence = extract_first_sentence(abstract)
    return clean_summary(sentence, limit=220)


def build_summary_long(abstract: str, platform_tags: list[str], theme_tags: list[str]) -> str:
    what_it_does = build_summary_short(abstract)
    if not what_it_does:
        what_it_does = 'This paper presents quantum research described in the abstract.'

    why_sentences = []
    seen = set()

    for tag in platform_tags:
        statement = PLATFORM_STATEMENTS.get(tag)
        if statement and statement not in seen:
            why_sentences.append(statement)
            seen.add(statement)

    for tag in theme_tags:
        statement = THEME_STATEMENTS.get(tag)
        if statement and statement not in seen:
            why_sentences.append(statement)
            seen.add(statement)

    if not why_sentences:
        why_sentences.append(GENERAL_STATEMENT)

    return f"What it does: {what_it_does}\n\nWhy it matters: {' '.join(why_sentences)}"


def parse_date(date_string: str) -> datetime:
    if date_string.endswith('Z'):
        date_string = date_string[:-1] + '+00:00'
    try:
        return datetime.fromisoformat(date_string)
    except ValueError:
        try:
            return datetime.strptime(date_string, '%Y-%m-%d')
        except ValueError:
            return datetime.min


def sort_papers(papers: list[dict]) -> list[dict]:
    return sorted(papers, key=lambda item: parse_date(item.get('publishedDate', '')), reverse=True)


def summarize_papers(papers: list[dict], force: bool) -> tuple[int, int, int]:
    summary_generated = 0
    summary_skipped = 0
    for paper in papers:
        abstract = str(paper.get('abstract', '') or '')
        if not abstract:
            paper['summaryShort'] = paper.get('summaryShort', '') or ''
            paper['summaryLong'] = paper.get('summaryLong', '') or ''
            summary_skipped += 1
            continue

        existing_short = bool(paper.get('summaryShort'))
        existing_long = bool(paper.get('summaryLong'))
        generated = False

        if force or not existing_short:
            paper['summaryShort'] = build_summary_short(abstract)
            generated = True

        if force or not existing_long:
            platform_tags = paper.get('platformTags') if isinstance(paper.get('platformTags'), list) else []
            theme_tags = paper.get('themeTags') if isinstance(paper.get('themeTags'), list) else []
            paper['summaryLong'] = build_summary_long(abstract, platform_tags, theme_tags)
            generated = True

        if generated:
            summary_generated += 1
        else:
            summary_skipped += 1

    return summary_generated, summary_skipped, len(papers)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate basic paper summaries from data/papers.json')
    parser.add_argument('--force', action='store_true', help='Regenerate all summaries')
    args = parser.parse_args()

    papers = load_json(OUTPUT_PATH)
    print(f'Loaded {len(papers)} papers from {OUTPUT_PATH}')

    generated, skipped, total = summarize_papers(papers, args.force)
    sorted_papers = sort_papers(papers)
    save_json(OUTPUT_PATH, sorted_papers)

    print(f'Summaries generated: {generated}')
    print(f'Summaries skipped: {skipped}')
    print(f'Total papers: {total}')
    print(f'Saved summaries to {OUTPUT_PATH}')
