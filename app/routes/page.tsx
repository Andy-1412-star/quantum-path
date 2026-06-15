import type { Paper } from '@/types/paper';
import type { RouteDefinition } from '@/types/route';
import RouteCard from '@/components/RouteCard';
import { readFileSync } from 'fs';
import { join } from 'path';

function loadJsonFile(filePath: string): unknown {
  try {
    const text = readFileSync(filePath, 'utf8');
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to load JSON:', error);
    return null;
  }
}

function normalizeRoutes(raw: unknown): RouteDefinition[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter((item): item is RouteDefinition => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      name: typeof (item as any).name === 'string' ? (item as any).name : '',
      slug: typeof (item as any).slug === 'string' ? (item as any).slug : '',
      description: typeof (item as any).description === 'string' ? (item as any).description : '',
      keyBottlenecks: Array.isArray((item as any).keyBottlenecks)
        ? ((item as any).keyBottlenecks as unknown[]).filter((tag): tag is string => typeof tag === 'string')
        : [],
      relatedThemes: Array.isArray((item as any).relatedThemes)
        ? ((item as any).relatedThemes as unknown[]).filter((tag): tag is string => typeof tag === 'string')
        : [],
    }))
    .filter((route) => route.name && route.slug);
}

function normalizePapers(raw: unknown): Paper[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter((item): item is Paper => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      id: typeof (item as any).id === 'string' ? (item as any).id : '',
      title: typeof (item as any).title === 'string' ? (item as any).title : 'Untitled paper',
      abstract: typeof (item as any).abstract === 'string' ? (item as any).abstract : '',
      authors: Array.isArray((item as any).authors)
        ? ((item as any).authors as unknown[]).filter((author): author is string => typeof author === 'string')
        : [],
      publishedDate: typeof (item as any).publishedDate === 'string' ? (item as any).publishedDate : '',
      updatedDate: typeof (item as any).updatedDate === 'string' ? (item as any).updatedDate : '',
      arxivId: typeof (item as any).arxivId === 'string' ? (item as any).arxivId : '',
      url: typeof (item as any).url === 'string' ? (item as any).url : '',
      pdfUrl: typeof (item as any).pdfUrl === 'string' ? (item as any).pdfUrl : '',
      source: typeof (item as any).source === 'string' ? (item as any).source : 'arXiv',
      platformTags: Array.isArray((item as any).platformTags)
        ? ((item as any).platformTags as unknown[]).filter((tag): tag is string => typeof tag === 'string')
        : [],
      themeTags: Array.isArray((item as any).themeTags)
        ? ((item as any).themeTags as unknown[]).filter((tag): tag is string => typeof tag === 'string')
        : [],
      summaryShort: typeof (item as any).summaryShort === 'string' ? (item as any).summaryShort : '',
      summaryLong: typeof (item as any).summaryLong === 'string' ? (item as any).summaryLong : '',
      importanceScore: typeof (item as any).importanceScore === 'number' ? (item as any).importanceScore : null,
    }))
    .filter((paper) => paper.id && paper.title && paper.publishedDate);
}

function getRoutePapers(route: RouteDefinition, papers: Paper[]) {
  return papers
    .filter((paper) => Array.isArray(paper.platformTags) && paper.platformTags.includes(route.name))
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
}

const routes = normalizeRoutes(loadJsonFile(join(process.cwd(), 'data', 'routes.json')));
const papers = normalizePapers(loadJsonFile(join(process.cwd(), 'data', 'papers.json')));

export default function RoutesPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-10">
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-xl shadow-slate-200/50">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Route overview</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Quantum Computing Routes</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-700">
            Route-based tracking helps organize quantum computing research by platform and shows where recent papers are contributing across hardware routes.
          </p>
        </div>
      </div>

      {routes.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-10 text-center text-slate-600 shadow-sm">
          <p className="text-lg font-semibold">No route definitions available yet.</p>
          <p className="mt-2">Add `data/routes.json` to enable the route overview.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {routes.map((route) => {
            const routePapers = getRoutePapers(route, papers);
            return <RouteCard key={route.slug} route={route} papers={routePapers} />;
          })}
        </div>
      )}
    </section>
  );
}
