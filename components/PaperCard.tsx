import type { Paper } from '@/types/paper';

const MAX_ABSTRACT_LENGTH = 400;

function formatAbstract(abstract: string) {
  if (!abstract) {
    return 'No abstract available.';
  }

  if (abstract.length <= MAX_ABSTRACT_LENGTH) {
    return abstract;
  }

  return `${abstract.slice(0, MAX_ABSTRACT_LENGTH).trim()}...`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function PaperCard({ paper }: { paper: Paper }) {
  const authors = Array.isArray(paper.authors) && paper.authors.length > 0 ? paper.authors.join(', ') : 'Unknown authors';
  const platformTags = Array.isArray(paper.platformTags) ? paper.platformTags : [];
  const themeTags = Array.isArray(paper.themeTags) ? paper.themeTags : [];

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-8">
      <div className="flex flex-col gap-4">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{paper.title || 'Untitled paper'}</h2>
          <p className="text-sm leading-6 text-slate-600">{authors}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>Published {formatDate(paper.publishedDate)}</span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{paper.source || 'arXiv'}</span>
          {typeof paper.importanceScore === 'number' && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-700">
              Importance: {paper.importanceScore} / 5
            </span>
          )}
        </div>

        {Array.isArray(paper.importanceReasons) && paper.importanceReasons.length > 0 && (
          <div className="rounded-3xl bg-amber-50/50 p-4 text-slate-700">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">Importance factors</p>
            <ul className="mt-2 space-y-1">
              {paper.importanceReasons.map((reason, index) => (
                <li key={index} className="text-sm leading-6 text-slate-700">
                  <span className="text-amber-600 font-semibold">•</span> {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {paper.summaryShort ? (
          <div className="rounded-3xl bg-slate-50 p-4 text-slate-700">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Summary</p>
            <p className="mt-2 text-sm leading-7">{paper.summaryShort}</p>
          </div>
        ) : null}

        <div className="rounded-3xl bg-slate-50 p-4 text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Abstract</p>
          <p className="mt-2 text-sm leading-7">{formatAbstract(paper.abstract)}</p>
        </div>

        {paper.summaryLong ? (
          <div className="rounded-3xl bg-slate-50 p-4 text-slate-700">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Research context</p>
            <p className="mt-2 text-sm leading-7 whitespace-pre-line">{paper.summaryLong}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {platformTags.map((tag) => (
            <span key={`platform-${tag}`} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {tag}
            </span>
          ))}
          {themeTags.map((tag) => (
            <span key={`theme-${tag}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-3">
          <a
            href={paper.url || '#'}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View on arXiv
          </a>
          <a
            href={paper.pdfUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            Download PDF
          </a>
        </div>
      </div>
    </article>
  );
}
