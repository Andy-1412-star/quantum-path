import type { Paper } from '@/types/paper';
import type { RouteDefinition } from '@/types/route';
import Link from 'next/link';

type RouteCardProps = {
  route: RouteDefinition;
  papers: Paper[];
};

export default function RouteCard({ route, papers }: RouteCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 transition hover:-translate-y-0.5 hover:shadow-md sm:p-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-slate-900">{route.name}</h3>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {papers.length} papers
            </span>
          </div>
          <p className="text-slate-600 leading-7">{route.description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Key bottlenecks</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {route.keyBottlenecks.map((item) => (
                <span key={item} className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Related themes</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {route.relatedThemes.map((theme) => (
                <span key={theme} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">Recent papers</p>
          <div className="space-y-3">
            {papers.slice(0, 3).map((paper) => (
              <div key={paper.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-slate-900">{paper.title}</p>
                  <p className="text-xs text-slate-500">{new Date(paper.publishedDate).toLocaleDateString('en-US')} · {paper.source || 'arXiv'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          href={`/routes/${route.slug}`}
          className="inline-flex w-fit items-center justify-center rounded-full border border-brand-200 bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
        >
          View route details
        </Link>
      </div>
    </article>
  );
}
