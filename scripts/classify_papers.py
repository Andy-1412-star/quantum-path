#!/usr/bin/env python3
import json
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any

PLATFORM_RULES = [
    (
        "Superconducting Qubits",
        [
            "superconducting",
            "transmon",
            "josephson",
            "microwave resonator",
            "circuit qed",
            "superconducting qubit",
            "superconducting processor",
        ],
    ),
    (
        "Trapped Ions",
        [
            "trapped ion",
            "ion trap",
            "ions",
            "paul trap",
            "motional mode",
            "phonon mode",
            "ytterbium",
            "calcium ion",
        ],
    ),
    (
        "Neutral Atoms / Rydberg",
        [
            "neutral atom",
            "rydberg",
            "atom array",
            "optical tweezer",
            "tweezer array",
            "rydberg blockade",
            "rydberg atom",
        ],
    ),
    (
        "Photonic Quantum Computing",
        [
            "photonic",
            "photon",
            "linear optics",
            "optical quantum",
            "boson sampling",
            "integrated photonics",
            "photonic chip",
        ],
    ),
    (
        "Semiconductor Spin Qubits",
        [
            "spin qubit",
            "quantum dot",
            "silicon qubit",
            "semiconductor qubit",
            "electron spin",
            "hole spin",
        ],
    ),
    (
        "Topological Quantum Computing",
        [
            "topological qubit",
            "majorana",
            "anyon",
            "non-abelian",
            "topological quantum computation",
        ],
    ),
    (
        "NV Centers / Defects",
        [
            "nv center",
            "nitrogen-vacancy",
            "color center",
            "diamond defect",
            "silicon vacancy",
        ],
    ),
]

THEME_RULES = [
    (
        "Quantum Error Correction",
        [
            "error correction",
            "surface code",
            "stabilizer code",
            "logical qubit",
            "syndrome",
            "quantum code",
        ],
    ),
    (
        "Fault-Tolerant Quantum Computing",
        [
            "fault-tolerant",
            "fault tolerant",
            "logical gate",
            "magic state",
            "lattice surgery",
            "threshold",
        ],
    ),
    (
        "Quantum Algorithms",
        [
            "quantum algorithm",
            "variational algorithm",
            "vqe",
            "qaoa",
            "phase estimation",
            "quantum search",
            "shor",
            "grover",
        ],
    ),
    (
        "Quantum Simulation",
        [
            "quantum simulation",
            "analog simulation",
            "digital simulation",
            "hamiltonian simulation",
            "simulator",
        ],
    ),
    (
        "Quantum Machine Learning",
        [
            "quantum machine learning",
            "quantum neural",
            "quantum kernel",
            "quantum classifier",
        ],
    ),
    (
        "Quantum Control",
        [
            "control pulse",
            "optimal control",
            "pulse shaping",
            "calibration",
            "feedback control",
        ],
    ),
    (
        "Quantum Compilation",
        [
            "compilation",
            "compiler",
            "circuit optimization",
            "transpilation",
            "routing",
            "gate synthesis",
        ],
    ),
    (
        "Noise Mitigation",
        [
            "error mitigation",
            "noise mitigation",
            "zero-noise extrapolation",
            "randomized compiling",
            "dynamical decoupling",
        ],
    ),
    (
        "Benchmarking",
        [
            "benchmarking",
            "randomized benchmarking",
            "cross-entropy benchmarking",
            "fidelity",
            "verification",
        ],
    ),
    (
        "Many-Body Physics",
        [
            "many-body",
            "spin chain",
            "ising model",
            "phase transition",
            "entanglement entropy",
            "correlation function",
        ],
    ),
    (
        "Quantum Communication",
        [
            "quantum communication",
            "quantum network",
            "quantum internet",
            "teleportation",
            "entanglement distribution",
        ],
    ),
]

DEFAULT_PLATFORM_TAGS = ["General / Other"]
DEFAULT_THEME_TAGS = ["General Theory"]


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, ensure_ascii=False)


def normalize_text(title: str, abstract: str) -> str:
    return f"{title}\n{abstract}".lower()


def find_tags(text: str, rules: list[tuple[str, list[str]]]) -> list[str]:
    tags = []
    for tag, keywords in rules:
        for keyword in keywords:
            if keyword.lower() in text:
                tags.append(tag)
                break
    return tags


def unique_preserve_order(items: list[str]) -> list[str]:
    seen = set()
    unique = []
    for item in items:
        if item not in seen:
            seen.add(item)
            unique.append(item)
    return unique


def parse_date(date_string: str) -> datetime:
    if date_string.endswith("Z"):
        date_string = date_string[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(date_string)
    except ValueError:
        try:
            return datetime.strptime(date_string, "%Y-%m-%d")
        except ValueError:
            return datetime.min


def classify_papers(papers: list[dict]) -> list[dict]:
    classified = []
    platform_counter = Counter()
    theme_counter = Counter()

    for paper in papers:
        title = paper.get("title", "")
        abstract = paper.get("abstract", "")
        source_text = normalize_text(title, abstract)

        platform_tags = unique_preserve_order(find_tags(source_text, PLATFORM_RULES))
        theme_tags = unique_preserve_order(find_tags(source_text, THEME_RULES))

        if not platform_tags:
            platform_tags = DEFAULT_PLATFORM_TAGS.copy()
        if not theme_tags:
            theme_tags = DEFAULT_THEME_TAGS.copy()

        paper["platformTags"] = platform_tags
        paper["themeTags"] = theme_tags

        for tag in platform_tags:
            platform_counter[tag] += 1
        for tag in theme_tags:
            theme_counter[tag] += 1

        classified.append(paper)

    return classified, platform_counter, theme_counter


def sort_papers(papers: list[dict]) -> list[dict]:
    return sorted(papers, key=lambda item: parse_date(item.get("publishedDate", "")), reverse=True)


def print_counter(title: str, counter: Counter[str]) -> None:
    print(title)
    for tag, count in sorted(counter.items(), key=lambda pair: (-pair[1], pair[0])):
        print(f"  {tag}: {count}")


if __name__ == "__main__":
    repo_root = Path(__file__).resolve().parent.parent
    input_path = repo_root / "data" / "papers.json"
    output_path = input_path

    papers = load_json(input_path)
    print(f"Loaded {len(papers)} papers from {input_path}")

    classified_papers, platform_counts, theme_counts = classify_papers(papers)
    sorted_papers = sort_papers(classified_papers)
    save_json(output_path, sorted_papers)

    print(f"Classified {len(sorted_papers)} papers.")
    print_counter("Platform tag counts:", platform_counts)
    print_counter("Theme tag counts:", theme_counts)
    print(f"Saved classified papers to {output_path}")
