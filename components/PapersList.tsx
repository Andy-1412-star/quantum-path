"use client";

import { useMemo, useState } from 'react';
import type { Paper } from '@/types/paper';
import PaperCard from '@/components/PaperCard';
import PaperFilters from '@/components/PaperFilters';

type PapersListProps = {
  papers: Paper[];
};

function getUniqueSortedTags(papers: Paper[], key: 'platformTags' | 'themeTags') {
  const tags = new Set<string>();
  papers.forEach((paper) => {
    const values = Array.isArray(paper[key]) ? paper[key] : [];
    values.forEach((tag) => {
      if (tag) {
        tags.add(tag);
      }
    });
  });
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

function matchesSearchQuery(paper: Paper, query: string): boolean {
  if (!query) {
    return true;
  }

  const lowerQuery = query.toLowerCase().trim();

  const searchableFields = [
    paper.title,
    paper.abstract,
    paper.summaryShort,
    paper.summaryLong,
    paper.source,
    paper.arxivId,
    ...((Array.isArray(paper.authors) ? paper.authors : []) as string[]),
    ...((Array.isArray(paper.platformTags) ? paper.platformTags : []) as string[]),
    ...((Array.isArray(paper.themeTags) ? paper.themeTags : []) as string[]),
  ];

  return searchableFields.some((field) => {
    if (!field || typeof field !== 'string') {
      return false;
    }
    return field.toLowerCase().includes(lowerQuery);
  });
}

export default function PapersList({ papers }: PapersListProps) {
  const platformOptions = useMemo(() => getUniqueSortedTags(papers, 'platformTags'), [papers]);
  const themeOptions = useMemo(() => getUniqueSortedTags(papers, 'themeTags'), [papers]);
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedTheme, setSelectedTheme] = useState('All Themes');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const platformMatch =
        selectedPlatform === 'All Platforms' || (Array.isArray(paper.platformTags) && paper.platformTags.includes(selectedPlatform));
      const themeMatch =
        selectedTheme === 'All Themes' || (Array.isArray(paper.themeTags) && paper.themeTags.includes(selectedTheme));
      const searchMatch = matchesSearchQuery(paper, searchQuery);
      return platformMatch && themeMatch && searchMatch;
    });
  }, [papers, selectedPlatform, selectedTheme, searchQuery]);

  return (
    <section className="space-y-8">
      <PaperFilters
        platformOptions={platformOptions}
        themeOptions={themeOptions}
        selectedPlatform={selectedPlatform}
        selectedTheme={selectedTheme}
        searchQuery={searchQuery}
        onPlatformChange={setSelectedPlatform}
        onThemeChange={setSelectedTheme}
        onSearchChange={setSearchQuery}
        onResetFilters={() => {
          setSelectedPlatform('All Platforms');
          setSelectedTheme('All Themes');
        }}
        onResetAll={() => {
          setSelectedPlatform('All Platforms');
          setSelectedTheme('All Themes');
          setSearchQuery('');
        }}
      />

      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/50">
        <p className="text-sm text-slate-500">
          Showing {filteredPapers.length} of {papers.length} papers
          {searchQuery ? ` matching "${searchQuery}"` : ''}
          .
        </p>
      </div>

      {filteredPapers.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-10 text-center text-slate-600 shadow-sm">
          <p className="text-lg font-semibold">No papers match the current search and filters.</p>
          <p className="mt-2 text-slate-500">Try adjusting your search query or filter selections.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPapers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      )}
    </section>
  );
}
