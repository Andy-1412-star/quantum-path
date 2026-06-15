import type { Paper } from '@/types/paper';
import Link from 'next/link';
import { readFileSync } from 'fs';
import { join } from 'path';

function loadJsonFile(filePath: string): unknown {
  try {
    const text = readFileSync(filePath, 'utf8');
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to load papers JSON:', error);
    return null;
  }
}

function normalizePapers(raw: unknown): Paper[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const validated = raw
    .filter((item): item is Partial<Paper> => !!item && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : '',
      title: typeof item.title === 'string' ? item.title : 'Untitled paper',
      abstract: typeof item.abstract === 'string' ? item.abstract : '',
      authors: Array.isArray(item.authors) ? item.authors.filter((author) => typeof author === 'string') : [],
      publishedDate: typeof item.publishedDate === 'string' ? item.publishedDate : '',
      updatedDate: typeof item.updatedDate === 'string' ? item.updatedDate : '',
      arxivId: typeof item.arxivId === 'string' ? item.arxivId : '',
      url: typeof item.url === 'string' ? item.url : '',
      pdfUrl: typeof item.pdfUrl === 'string' ? item.pdfUrl : '',
      source: typeof item.source === 'string' ? item.source : 'arXiv',
      platformTags: Array.isArray(item.platformTags) ? item.platformTags.filter((tag) => typeof tag === 'string') : [],
      themeTags: Array.isArray(item.themeTags) ? item.themeTags.filter((tag) => typeof tag === 'string') : [],
      summaryShort: typeof item.summaryShort === 'string' ? item.summaryShort : '',
      summaryLong: typeof item.summaryLong === 'string' ? item.summaryLong : '',
      importanceScore: typeof item.importanceScore === 'number' ? item.importanceScore : null,
    }))
    .filter((paper) => paper.id && paper.title && paper.publishedDate);

  return validated.sort((a, b) => {
    const aDate = new Date(a.publishedDate).getTime() || 0;
    const bDate = new Date(b.publishedDate).getTime() || 0;
    return bDate - aDate;
  });
}

function countTags(papers: Paper[], key: 'platformTags' | 'themeTags') {
  const counts = new Map<string, number>();
  papers.forEach((paper) => {
    const tags = Array.isArray(paper[key]) ? paper[key] : [];
    tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function paperPublishedInLastWeek(paper: Paper) {
  const date = new Date(paper.publishedDate);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return date >= oneWeekAgo;
}

const papers = normalizePapers(loadJsonFile(join(process.cwd(), 'data', 'papers.json')));
const totalPapers = papers.length;
const papersThisWeek = papers.filter(paperPublishedInLastWeek).length;
const platformCounts = countTags(papers, 'platformTags');
const themeCounts = countTags(papers, 'themeTags');
const mostActivePlatform = platformCounts[0]?.[0] ?? 'N/A';
const mostActiveTheme = themeCounts[0]?.[0] ?? 'N/A';
const latestPapers = papers.slice(0, 5);

export default function HomePage() {
  if (papers.length === 0) {
    return (
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-xl shadow-slate-200/50">
        <div className="space-y-6 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">QuantumPath</h1>
          <p className="text-lg leading-8 text-slate-600">
            No papers have been ingested yet. Run the arXiv ingestion pipeline to populate the dashboard.
          </p>
          <Link href="/papers" className="inline-flex rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-700">
            Go to Papers
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-10">
      <section className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-xl shadow-slate-200/50">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Quantum computing research</p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">QuantumPath</h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-700">
                QuantumPath automatically collects recent quantum computing papers, classifies them by hardware platform and research theme, and presents them as a structured research map.
              </p>
            </div>
            <Link href="/papers" className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-700">
              Explore Papers
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total papers</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{totalPapers}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Papers this week</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{papersThisWeek}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Most active platform</p>
              <p className="mt-4 text-xl font-semibold text-slate-900">{mostActivePlatform}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Most active theme</p>
              <p className="mt-4 text-xl font-semibold text-slate-900">{mostActiveTheme}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Platform overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Platform distribution</h2>
            </div>
            <p className="text-sm text-slate-600">Sorted by paper count</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {platformCounts.map(([tag, count]) => (
              <div key={tag} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{tag}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Theme overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Theme distribution</h2>
            </div>
            <p className="text-sm text-slate-600">Sorted by paper count</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {themeCounts.map(([tag, count]) => (
              <div key={tag} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{tag}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Latest papers</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Most recent research</h2>
          </div>
          <p className="text-sm text-slate-600">Showing the 5 newest papers</p>
        </div>

        <div className="space-y-4">
          {latestPapers.map((paper) => (
            <div key={paper.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-slate-900">{paper.title}</h3>
                  <p className="text-sm text-slate-600">{formatDate(paper.publishedDate)} · {paper.source || 'arXiv'}</p>
                </div>
                <a
                  href={paper.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                >
                  View on arXiv
                </a>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {paper.platformTags.map((tag) => (
                  <span key={`platform-${paper.id}-${tag}`} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                    {tag}
                  </span>
                ))}
                {paper.themeTags.map((tag) => (
                  <span key={`theme-${paper.id}-${tag}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
