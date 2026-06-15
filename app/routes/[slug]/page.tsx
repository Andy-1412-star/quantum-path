'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Paper } from '@/types/paper';
import type { RouteDefinition } from '@/types/route';

type TimelineGroup = {
  month: string;
  monthYear: string;
  papers: Paper[];
};

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

function formatMonthYear(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown month';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
}

function getMonthKey(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function groupPapersByMonth(papers: Paper[]): TimelineGroup[] {
  const grouped = new Map<string, Paper[]>();

  papers.forEach((paper) => {
    const key = getMonthKey(paper.publishedDate);
    if (!key) return;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(paper);
  });

  const sorted = Array.from(grouped.entries())
    .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
    .map(([key, paperList]) => ({
      month: key,
      monthYear: formatMonthYear(paperList[0].publishedDate),
      papers: paperList
    }));

  return sorted;
}

function getMostCommonTags(papers: Paper[], tagCount: number = 5): string[] {
  const tagMap = new Map<string, number>();

  papers.forEach((paper) => {
    const themeTags = Array.isArray(paper.themeTags) ? paper.themeTags : [];
    themeTags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, tagCount)
    .map(([tag]) => tag);
}

export default function RouteDetailPage({ params }: { params: { slug: string } }) {
  const [route, setRoute] = useState<RouteDefinition | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [relatedPapers, setRelatedPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const routesRes = await fetch('/api/routes');
        const routesData = await routesRes.json();
        const allRoutes = Array.isArray(routesData) ? routesData : [];

        const foundRoute = allRoutes.find((r: any) => r.slug === params.slug);
        if (!foundRoute) {
          setError('not-found');
          setLoading(false);
          return;
        }

        setRoute(foundRoute);

        const papersRes = await fetch('/api/papers');
        const papersData = await papersRes.json();
        const allPapers = Array.isArray(papersData) ? papersData : [];

        setPapers(allPapers);

        const related = allPapers
          .filter((paper: any) => {
            const platformTags = Array.isArray(paper.platformTags) ? paper.platformTags : [];
            return platformTags.includes(foundRoute.name);
          })
          .sort(
            (a: any, b: any) =>
              new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
          );

        setRelatedPapers(related);
        setLoading(false);
      } catch (err) {
        console.error('Error loading route data:', err);
        setError('load-error');
        setLoading(false);
      }
    }

    loadData();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-6 py-12 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-slate-600">Loading route...</div>
        </div>
      </div>
    );
  }

  if (error === 'not-found' || !route) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-6 py-12 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6">
            <Link
              href="/routes"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition"
            >
              ← Back to all routes
            </Link>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-slate-600">Route not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-6 py-12 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6">
            <Link
              href="/routes"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition"
            >
              ← Back to all routes
            </Link>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-slate-600">Error loading route data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const commonThemes = getMostCommonTags(relatedPapers);
  const timelineGroups = groupPapersByMonth(relatedPapers);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-6 py-12 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="space-y-8">
          {/* Back Link */}
          <Link
            href="/routes"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition"
          >
            ← Back to all routes
          </Link>

          {/* Route Header */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900">{route.name}</h1>
                </div>
                <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                  {relatedPapers.length} papers
                </span>
              </div>
              <p className="text-lg leading-8 text-slate-600">{route.description}</p>
            </div>

            {/* Bottlenecks */}
            {route.keyBottlenecks.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Key Bottlenecks
                </p>
                <div className="flex flex-wrap gap-3">
                  {route.keyBottlenecks.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Themes */}
            {route.relatedThemes.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Related Themes
                </p>
                <div className="flex flex-wrap gap-3">
                  {route.relatedThemes.map((theme) => (
                    <span
                      key={theme}
                      className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Most Common Tags */}
            {commonThemes.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Top Research Themes
                </p>
                <div className="flex flex-wrap gap-3">
                  {commonThemes.map((theme) => (
                    <span
                      key={theme}
                      className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Papers Section */}
          {relatedPapers.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-slate-600">
                No papers currently match this route. Run the ingestion and classification pipeline to update
                the dataset.
              </p>
            </div>
          ) : (
            <>
              {/* Timeline Section */}
              <div className="space-y-8">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Research Timeline</h2>

                <div className="space-y-6">
                  {timelineGroups.map((group) => (
                    <div key={group.month} className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">{group.monthYear}</h3>
                      <div className="space-y-3 border-l-2 border-slate-200 pl-6">
                        {group.papers.map((paper) => (
                          <div
                            key={paper.id}
                            className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-slate-200 hover:shadow-sm"
                          >
                            <div className="space-y-2">
                              <div>
                                {paper.url ? (
                                  <a
                                    href={paper.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base font-semibold text-brand-600 hover:text-brand-700 transition"
                                  >
                                    {paper.title}
                                  </a>
                                ) : (
                                  <h4 className="text-base font-semibold text-slate-900">{paper.title}</h4>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span>{paper.source || 'arXiv'}</span>
                                <span>•</span>
                                <span>{formatDate(paper.publishedDate)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Papers Section */}
              <div className="space-y-8">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recent Papers</h2>

                <div className="grid gap-6 md:grid-cols-1">
                  {relatedPapers.slice(0, 5).map((paper) => (
                    <article
                      key={paper.id}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-8"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="space-y-3">
                          <h3 className="text-xl font-semibold tracking-tight text-slate-900">{paper.title}</h3>
                          <p className="text-sm leading-6 text-slate-600">
                            {Array.isArray(paper.authors) && paper.authors.length > 0
                              ? paper.authors.join(', ')
                              : 'Unknown authors'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span>Published {formatDate(paper.publishedDate)}</span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                            {paper.source || 'arXiv'}
                          </span>
                        </div>

                        {paper.summaryShort ? (
                          <div className="rounded-3xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                              Summary
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">{paper.summaryShort}</p>
                          </div>
                        ) : null}

                        {/* Tags */}
                        {(Array.isArray(paper.platformTags) && paper.platformTags.length > 0) ||
                        (Array.isArray(paper.themeTags) && paper.themeTags.length > 0) ? (
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(paper.platformTags) &&
                              paper.platformTags.map((tag) => (
                                <span
                                  key={`platform-${tag}`}
                                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            {Array.isArray(paper.themeTags) &&
                              paper.themeTags.map((tag) => (
                                <span
                                  key={`theme-${tag}`}
                                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                        ) : null}

                        {/* Links */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          {paper.url && (
                            <a
                              href={paper.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition"
                            >
                              View on arXiv →
                            </a>
                          )}
                          {paper.pdfUrl && (
                            <a
                              href={paper.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                            >
                              PDF →
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
