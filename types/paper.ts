export type Paper = {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publishedDate: string;
  updatedDate: string;
  arxivId: string;
  url: string;
  pdfUrl: string;
  source: string;
  platformTags: string[];
  themeTags: string[];
  summaryShort: string;
  summaryLong: string;
  importanceScore: number | null;
  importanceReasons?: string[];
};
