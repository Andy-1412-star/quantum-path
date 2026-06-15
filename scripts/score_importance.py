#!/usr/bin/env python3
"""
QuantumPath Importance Scorer

Assigns importance scores (1-5) to papers based on rule-based signals.
Each paper starts at score 1 and gains points for:
- QEC/FTQC themes
- Key technical terms
- Platform-scale experimental work
- Large-scale architecture mentions

Usage:
    python scripts/score_importance.py
"""

import json
from pathlib import Path
from typing import Any

INPUT_PATH = Path(__file__).resolve().parent.parent / 'data' / 'papers.json'
OUTPUT_PATH = Path(__file__).resolve().parent.parent / 'data' / 'papers.json'

# Scoring rules
QEC_THEMES = {
    'Quantum Error Correction',
    'Fault-Tolerant Quantum Computing',
}

# Key technical terms that indicate importance
KEY_TECHNICAL_TERMS = [
    'logical qubit',
    'fault-tolerant',
    'fault tolerant',
    'error correction',
    'surface code',
    'quantum advantage',
    'quantum supremacy',
    'scalable',
    'high fidelity',
    'benchmark',
    'experimental demonstration',
    'demonstration',
    'record',
]

# Platform-scale experimental terms
PLATFORM_EXPERIMENTAL_TERMS = [
    'superconducting processor',
    'trapped-ion processor',
    'ion-trap processor',
    'rydberg atom array',
    'neutral atom array',
    'photonic chip',
    'quantum dot array',
    'spin qubit device',
]

# Scale-related terms
SCALE_TERMS = [
    'hundreds of qubits',
    'thousands of qubits',
    'large-scale',
    'scalable architecture',
    'modular architecture',
    'logical processor',
]


def normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    if not text or not isinstance(text, str):
        return ''
    return text.lower().strip()


def contains_any_term(text: str, terms: list[str]) -> bool:
    """Check if text contains any of the terms (case-insensitive)."""
    normalized = normalize_text(text)
    for term in terms:
        if normalize_text(term) in normalized:
            return True
    return False


def score_paper(paper: dict[str, Any]) -> tuple[int, list[str]]:
    """
    Score a paper and return (score, reasons).
    
    Returns:
        Tuple of (importance_score, importance_reasons)
    """
    score = 1
    reasons: list[str] = []

    # Check for QEC/FTQC themes
    themes = paper.get('themeTags', [])
    if isinstance(themes, list):
        if any(theme in QEC_THEMES for theme in themes):
            score += 1
            reasons.append('Related to quantum error correction or fault-tolerant quantum computing.')

    # Check title and abstract for key terms
    title = paper.get('title', '')
    abstract = paper.get('abstract', '')
    search_text = f"{title} {abstract}"

    if contains_any_term(search_text, KEY_TECHNICAL_TERMS):
        score += 1
        reasons.append('Mentions logical qubits, surface codes, or fault tolerance.')

    # Check for platform-scale experimental terms
    if contains_any_term(search_text, PLATFORM_EXPERIMENTAL_TERMS):
        score += 1
        reasons.append('Describes an experimental platform or processor.')

    # Check for scale-related terms
    if contains_any_term(search_text, SCALE_TERMS):
        score += 1
        reasons.append('Addresses scaling or large-scale quantum computing architecture.')

    # Cap at 5
    score = min(score, 5)

    # If no extra signals found, keep score at 1 with default reason
    if len(reasons) == 0:
        reasons = ['No strong importance signals detected by the rule-based scorer.']

    return score, reasons


def main() -> int:
    """Load papers, score them, and save results."""
    print()
    print('=' * 70)
    print('QuantumPath Importance Scorer')
    print('=' * 70)
    print()

    # Load papers
    try:
        with open(INPUT_PATH, 'r', encoding='utf-8') as f:
            papers = json.load(f)
    except FileNotFoundError:
        print(f'❌ ERROR: Input file not found at {INPUT_PATH}')
        return 1
    except json.JSONDecodeError as e:
        print(f'❌ ERROR: Failed to parse JSON: {e}')
        return 1

    if not isinstance(papers, list):
        print('❌ ERROR: Expected papers to be a list')
        return 1

    print(f'✓ Loaded {len(papers)} papers')
    print()

    # Score each paper - ALWAYS assign values
    scored_count = 0
    for paper in papers:
        if isinstance(paper, dict):
            score, reasons = score_paper(paper)
            # ALWAYS assign these values (overwrites null)
            paper['importanceScore'] = score
            paper['importanceReasons'] = reasons
            scored_count += 1

    print(f'✓ Scored {scored_count} papers')
    print()

    # Sort by publishedDate (newest first)
    try:
        papers.sort(
            key=lambda p: p.get('publishedDate', ''),
            reverse=True
        )
        print('✓ Sorted papers by date (newest first)')
        print()
    except Exception as e:
        print(f'⚠ Warning: Could not sort papers by date: {e}')
        print()

    # Count papers by score
    score_counts = {}
    for paper in papers:
        score = paper.get('importanceScore', 1)
        if isinstance(score, int):
            score_counts[score] = score_counts.get(score, 0) + 1

    print('Papers by importance score:')
    for score in sorted(score_counts.keys()):
        count = score_counts[score]
        print(f'  Score {score}: {count} papers')
    print()

    # Save results
    try:
        with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
            json.dump(papers, f, indent=2, ensure_ascii=False)
        print(f'✓ Saved {len(papers)} scored papers')
        print(f'  Output: {OUTPUT_PATH}')
        print()
        return 0
    except Exception as e:
        print(f'❌ ERROR: Failed to save results: {e}')
        return 1


if __name__ == '__main__':
    import sys
    sys.exit(main())
