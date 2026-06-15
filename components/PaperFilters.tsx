"use client";

type PaperFiltersProps = {
  platformOptions: string[];
  themeOptions: string[];
  selectedPlatform: string;
  selectedTheme: string;
  searchQuery: string;
  onPlatformChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
  onResetAll: () => void;
};

export default function PaperFilters({
  platformOptions,
  themeOptions,
  selectedPlatform,
  selectedTheme,
  searchQuery,
  onPlatformChange,
  onThemeChange,
  onSearchChange,
  onResetFilters,
  onResetAll,
}: PaperFiltersProps) {
  const hasActiveSearch = searchQuery.trim().length > 0;
  const hasActiveFilters = selectedPlatform !== 'All Platforms' || selectedTheme !== 'All Themes';

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/50">
        <label htmlFor="searchInput" className="block text-sm font-medium text-slate-700">
          Search papers
        </label>
        <div className="mt-3 flex items-center gap-3">
          <input
            id="searchInput"
            type="text"
            placeholder="Search by title, abstract, authors, tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 placeholder-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          {hasActiveSearch && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              title="Clear search"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/50">
        <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
          <div>
            <label htmlFor="platformFilter" className="block text-sm font-medium text-slate-700">
              Platform
            </label>
            <select
              id="platformFilter"
              value={selectedPlatform}
              onChange={(event) => onPlatformChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              <option>All Platforms</option>
              {platformOptions.map((platform) => (
                <option key={platform}>{platform}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="themeFilter" className="block text-sm font-medium text-slate-700">
              Theme
            </label>
            <select
              id="themeFilter"
              value={selectedTheme}
              onChange={(event) => onThemeChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              <option>All Themes</option>
              {themeOptions.map((theme) => (
                <option key={theme}>{theme}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            {hasActiveSearch || hasActiveFilters ? (
              <>
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  title="Reset filters"
                >
                  Reset filters
                </button>
                {(hasActiveSearch || hasActiveFilters) && (
                  <button
                    type="button"
                    onClick={onResetAll}
                    className="inline-flex items-center justify-center rounded-2xl border border-brand-200 bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                    title="Reset all filters and search"
                  >
                    Reset all
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                title="Reset filters"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
