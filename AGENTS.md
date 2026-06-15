# QuantumPath Agent Guidance

## Project Overview
QuantumPath is a quantum computing research intelligence platform that collects arXiv papers, classifies them by platform and theme, summarizes them, scores importance, and displays the results in a Next.js frontend.

## Coding Style
- Keep code simple and beginner-friendly.
- Prefer small reusable components.
- Prefer pure helper functions when possible.
- Avoid over-engineering.
- Do not introduce a database unless explicitly requested.
- Do not introduce external dependencies unless clearly justified.

## Frontend Guidelines
- Use Next.js App Router.
- Use TypeScript.
- Use Tailwind CSS.
- Keep the UI clean, academic, and responsive.
- `PaperCard` should remain presentational.
- `PapersList` should handle client-side search/filter state.
- Server pages should load local JSON data safely.

## Data Guidelines
- Do not fabricate real papers or real news.
- Preserve existing fields in `data/papers.json`.
- If adding sample data, clearly mark it as sample data.
- Always keep paper objects compatible with `types/paper.ts`.
- Generated summaries and scores must be transparent and not overclaim.

## Python Script Guidelines
- Use standard libraries where possible.
- Keep scripts runnable from the project root.
- Use robust `pathlib`-based paths.
- Add clear console logs.
- Stop the pipeline if a required step fails.
- Preserve existing paper fields unless intentionally updating them.

## Pipeline Order
1. `scripts/fetch_arxiv.py`
2. `scripts/classify_papers.py`
3. `scripts/summarize_papers_basic.py`
4. `scripts/score_importance.py`

## Testing / Checking
After code changes, run:
- `npm.cmd run build`
- `npm.cmd run lint`

For data pipeline changes, also run:
- `python scripts/update_papers.py`

## Security
- Never commit API keys.
- Use environment variables for future API integrations.
- Do not add secrets to data files or `README.md`.

## Review Checklist
- Does the app build?
- Does lint pass?
- Does `/papers` still load?
- Does `/routes` still load?
- Does `data/papers.json` remain valid JSON?
- Are generated summaries and scores clearly automatic?
