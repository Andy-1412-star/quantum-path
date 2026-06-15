import type { Paper } from '@/types/paper';
import { readFileSync } from 'fs';
import { join } from 'path';
import PapersList from '@/components/PapersList';

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
      importanceReasons: Array.isArray(item.importanceReasons)
        ? (item.importanceReasons as unknown[]).filter((reason): reason is string => typeof reason === 'string')
        : undefined,
    }))
    .filter((paper) => paper.id && paper.title && paper.publishedDate);

  return validated.sort((a, b) => {
    const aDate = new Date(a.publishedDate).getTime() || 0;
    const bDate = new Date(b.publishedDate).getTime() || 0;
    return bDate - aDate;
  });
}

const papers = normalizePapers(
  loadJsonFile(join(process.cwd(), 'data', 'papers.json'))
);

export default function PapersPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-xl shadow-slate-200/50">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Research collection</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Latest Quantum Computing Papers</h1>
          <p className="text-slate-600 leading-7">Showing {papers.length} papers collected from arXiv.</p>
        </div>
      </div>

      {papers.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-10 text-center text-slate-600 shadow-sm">
          <p className="text-lg font-semibold">No papers found yet.</p>
          <p className="mt-2 text-slate-500">Run the ingestion script to populate local paper data.</p>
        </div>
      ) : (
        <PapersList papers={papers} />
      )}
    </section>
  );
}
