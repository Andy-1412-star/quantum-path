#!/usr/bin/env python3
"""
QuantumPath Paper Update Pipeline

Runs the complete data pipeline in the correct order:
1. fetch_arxiv.py - Fetches papers from arXiv
2. classify_papers.py - Classifies papers by platform and theme
3. summarize_papers_basic.py - Generates paper summaries

Usage:
    python scripts/update_papers.py
    
    Or from project root:
    python scripts/update_papers.py
"""

import subprocess
import sys
from pathlib import Path

# Compute project root relative to this script
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

# Pipeline steps (relative to project root)
PIPELINE_STEPS = [
    ("Fetching papers from arXiv", "scripts/fetch_arxiv.py"),
    ("Classifying papers by platform and theme", "scripts/classify_papers.py"),
    ("Generating paper summaries", "scripts/summarize_papers_basic.py"),
    ("Scoring papers by importance", "scripts/score_importance.py"),
]


def print_header(step_number: int, step_name: str) -> None:
    """Print a clear section header for each pipeline step."""
    print()
    print("=" * 70)
    print(f"Step {step_number}: {step_name}")
    print("=" * 70)
    print()


def run_step(step_number: int, step_name: str, script_path: str) -> bool:
    """
    Run a single pipeline step.
    
    Returns True if successful, False if failed.
    """
    print_header(step_number, step_name)
    
    # Construct full path to the script
    full_script_path = PROJECT_ROOT / script_path
    
    if not full_script_path.exists():
        print(f"❌ ERROR: Script not found at {full_script_path}")
        return False
    
    try:
        # Run the script with the same Python interpreter
        result = subprocess.run(
            [sys.executable, str(full_script_path)],
            cwd=str(PROJECT_ROOT),
            check=True,
        )
        print()
        print(f"✓ Step {step_number} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print()
        print(f"❌ Step {step_number} failed with exit code {e.returncode}")
        print(f"   Script: {full_script_path}")
        print(f"   Working directory: {PROJECT_ROOT}")
        return False
    except Exception as e:
        print()
        print(f"❌ Step {step_number} encountered an error: {e}")
        return False


def main() -> int:
    """Run the complete pipeline."""
    print()
    print("╔" + "=" * 68 + "╗")
    print("║" + " QuantumPath Paper Update Pipeline ".center(68) + "║")
    print("╚" + "=" * 68 + "╝")
    
    # Run each step in order
    for step_number, (step_name, script_path) in enumerate(PIPELINE_STEPS, start=1):
        success = run_step(step_number, step_name, script_path)
        if not success:
            print()
            print("=" * 70)
            print(f"❌ Pipeline failed at step {step_number}")
            print("=" * 70)
            return 1
    
    # All steps completed successfully
    print()
    print("=" * 70)
    print("✓ Pipeline completed successfully!")
    print("=" * 70)
    print()
    print("📊 Data files updated:")
    print(f"   - {PROJECT_ROOT / 'data' / 'papers.json'}")
    print()
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
