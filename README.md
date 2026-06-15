# QuantumPath

**Track, classify, and understand quantum computing progress.**

QuantumPath is an open-source research intelligence platform designed to aggregate, organize, and analyze papers from arXiv across the quantum computing landscape. The platform automatically classifies papers by hardware platform and research theme, generates summaries, and assigns importance scores—helping researchers and students stay current with rapid developments in quantum computing.

## Motivation

Quantum computing is advancing across multiple hardware platforms (superconducting qubits, trapped ions, neutral atoms, photonic systems, and more) and theoretical domains simultaneously. Students, researchers, and engineers struggle to keep up with the influx of new papers and progress across these fragmented routes.

QuantumPath solves this by:
- **Aggregating** the latest quantum computing papers from arXiv daily
- **Organizing** papers by platform and research theme
- **Summarizing** key findings automatically
- **Scoring** research importance based on transparent rules
- **Enabling discovery** through a searchable, filterable interface

The result: a structured dashboard for tracking quantum computing progress.

## Features

✨ **Data Collection & Processing**
- Automated daily arXiv ingestion (configurable search terms)
- Rule-based classification into 8 hardware platforms
- Classification into 12 research themes
- Basic extractive summarization with "why it matters" context
- Importance scoring (1-5) with transparent reasoning

🎯 **Research Discovery**
- Dashboard homepage with platform overview
- Searchable paper list (title, abstract, authors, tags)
- Filterable by platform and theme
- Platform-specific route pages with paper timelines
- Rule-based importance badges for high-impact papers

⚙️ **Data Pipeline**
- One-command update pipeline: `python scripts/update_papers.py`
- GitHub Actions daily automation (06:00 UTC)
- Local JSON-based data storage for MVP
- Manual and automated workflow triggers

## Supported Platforms & Themes

### Quantum Computing Platforms
1. **Superconducting Qubits** - Circuit-based processors with microwave control
2. **Trapped Ions** - High-control ion traps with laser manipulation
3. **Neutral Atoms / Rydberg** - Atom arrays with Rydberg interactions
4. **Photonic Quantum Computing** - Photon-based quantum information
5. **Semiconductor Spin Qubits** - Spin qubits in quantum dots
6. **Topological Quantum Computing** - Topological protection approaches
7. **NV Centers / Defects** - Diamond and silicon defect centers
8. **General / Other** - Uncategorized or emerging platforms

### Research Themes
- Quantum Error Correction
- Fault-Tolerant Quantum Computing
- Quantum Algorithms
- Quantum Simulation
- Quantum Machine Learning
- Quantum Control
- Quantum Compilation
- Noise Mitigation
- Benchmarking
- Many-Body Physics
- Quantum Communication
- General Theory

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 + TypeScript + Tailwind CSS |
| **Data Ingestion** | Python 3.11, arXiv API, urllib |
| **Data Storage** | Local JSON files (MVP) |
| **Automation** | GitHub Actions (daily schedule) |
| **Hosting** | Vercel/GitHub Pages ready |

## Architecture

```
   arXiv API
     ↓
 fetch_arxiv.py
     ↓
 classify_papers.py
     ↓
 summarize_papers_basic.py
     ↓
 score_importance.py
     ↓
 data/papers.json
     ↓
 Next.js Frontend (pages, search, filters)
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or npm.cmd (Windows)

### Installation

```bash
# Install frontend dependencies
npm.cmd install

# Start development server
npm.cmd run dev
```

The application will be available at `http://localhost:3000`

**Windows PowerShell Note:** If `npm` is blocked, use `npm.cmd` instead.

### Building for Production

```bash
npm.cmd run build
npm.cmd run start
```

## Data Pipeline

### Manual Pipeline Execution

Run the complete pipeline in order:

```bash
# Option 1: One-command pipeline (recommended)
python scripts/update_papers.py

# Option 2: Individual steps
python scripts/fetch_arxiv.py          # Fetch from arXiv
python scripts/classify_papers.py      # Classify by platform/theme
python scripts/summarize_papers_basic.py  # Generate summaries
python scripts/score_importance.py     # Score importance (1-5)
```

**Windows Python Note:** If `python` doesn't work, try `py scripts/update_papers.py`

### Automated Updates

Paper data is updated automatically every day at **06:00 UTC** via GitHub Actions (`.github/workflows/update-papers.yml`).

#### Manual Trigger

To manually run the update workflow:

1. Navigate to **Actions** tab on GitHub
2. Select **Update Paper Data** workflow
3. Click **Run workflow** → Confirm

#### Timezone Reference
06:00 UTC = 
- 01:00 EST (Eastern)
- 22:00 PST (Pacific, previous day)
- 07:00 CET (Central European)

## Project Structure

```
QuantumPath/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Dashboard homepage
│   ├── papers/page.tsx          # Papers list with search/filters
│   ├── routes/page.tsx          # Route overview
│   ├── routes/[slug]/page.tsx   # Route detail pages
│   └── api/                     # API endpoints
├── components/                   # React components
│   ├── NavBar.tsx
│   ├── PaperCard.tsx            # Paper display card
│   ├── PapersList.tsx           # Filtered paper list
│   ├── PaperFilters.tsx         # Search & filter controls
│   └── RouteCard.tsx
├── types/                        # TypeScript types
│   ├── paper.ts
│   └── route.ts
├── data/                         # Local JSON data store
│   ├── papers.json              # Papers (auto-generated)
│   └── routes.json              # Platform routes (manual)
├── scripts/                      # Python data pipeline
│   ├── fetch_arxiv.py           # Fetch papers from arXiv
│   ├── classify_papers.py       # Platform/theme classification
│   ├── summarize_papers_basic.py # Extractive summarization
│   ├── score_importance.py      # Rule-based importance scoring
│   └── update_papers.py         # Master pipeline script
├── docs/                         # Documentation
├── .github/workflows/            # GitHub Actions
│   └── update-papers.yml        # Daily update workflow
├── package.json                  # Frontend dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
└── README.md                     # This file
```

## Features in Detail

### 🔍 Search & Discovery
- **Full-text search** across titles, abstracts, authors, and tags
- **Filter by platform** and research theme
- **Importance badges** (1-5 score) with reasoning
- Case-insensitive, trimmed query matching

### 📊 Dashboard
- Overview of papers by platform
- Most recent papers across all routes
- Quick statistics

### 🛣️ Route Exploration
- Platform overview pages
- Route-specific paper timelines (grouped by month)
- Top research themes for each route
- Related paper history

### 📈 Importance Scoring
Transparent rule-based scoring (1-5):
- **+1** for QEC/FTQC themes
- **+1** for key technical terms (logical qubits, surface codes, fault-tolerance, etc.)
- **+1** for platform-scale experimental work
- **+1** for large-scale architecture mentions
- Capped at 5, includes human-readable reasons

### ⚙️ Automation
- **Daily updates** via GitHub Actions (06:00 UTC)
- **One-command pipeline**: `python scripts/update_papers.py`
- **Manual triggers** via GitHub Actions UI
- **No database required** (JSON-based MVP)

## Development

### Frontend Commands

```bash
npm.cmd install     # Install dependencies
npm.cmd run dev     # Development server (http://localhost:3000)
npm.cmd run build   # Production build
npm.cmd run lint    # ESLint validation
```

### Python Environment

The Python scripts use standard library only (no external dependencies needed):
- `json`, `pathlib`, `subprocess`, `urllib`, `xml`

### Adding Custom Search Terms

Edit `scripts/fetch_arxiv.py` to customize arXiv search:
```python
SEARCH_TERMS = [
    "quantum computing",
    "your custom term here",
    # ...
]
```

## Important: Academic Disclaimer ⚠️

**Summaries, classifications, and importance scores are automatically generated** using rule-based heuristics and extractive summarization. They are **not** human-validated and should be treated as approximations.

Always:
- ✅ Verify findings against original papers
- ✅ Cross-reference with multiple sources
- ✅ Check dates and citations in source material
- ✅ Consult domain experts for critical decisions

This tool is designed to **accelerate discovery**, not replace human review.

## Future Roadmap

### Short Term (v0.2)
- [ ] LLM-based abstractive summarization (with opt-in API)
- [ ] PDF extraction and full-text indexing
- [ ] Citation graph visualization
- [ ] Paper recommendations based on reading history

### Medium Term (v0.3-v0.4)
- [ ] Semantic Scholar / OpenAlex metadata integration
- [ ] Vector search with embeddings
- [ ] Personalized research alerts
- [ ] Multi-language support (Chinese, Spanish)
- [ ] Export to BibTeX/Zotero

### Long Term (v1.0)
- [ ] Supabase/PostgreSQL backend migration
- [ ] Trend visualization and charting
- [ ] Collaborative collections and lists
- [ ] Research group workspaces
- [ ] Publication-style paper reports

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contribution
- Add support for additional paper sources (bioRxiv, PapersWithCode, etc.)
- Improve classification rules
- Enhance summarization quality
- Add visualization components
- Optimize search performance
- Improve mobile responsiveness

## Performance & Scalability

**Current (MVP)**
- ~100+ papers per search term
- Local JSON storage (fast for <10k papers)
- Response time: <100ms for filters/search
- Build time: ~10s, First Load JS: ~94kB

**Limitations**
- JSON storage scales to ~10-50k papers before optimization needed
- No full-text index (searches entire abstracts in memory)
- Single-user experience (no concurrency handling)

**Migration Path**
- PostgreSQL + Supabase for >50k papers
- Full-text search indexes
- Caching layer (Redis)
- Vector database for semantic search

## License

MIT License - see LICENSE file for details

## Contact & Attribution

**Author:** Andy W  
**Email:** [your email]  
**GitHub:** [your github]

**Special Thanks:**
- arXiv for the open API and research papers
- Next.js, TypeScript, and Tailwind CSS communities
- Open-source quantum computing research community

---

**Last Updated:** 2026-06-15  
**Status:** MVP - Active Development
