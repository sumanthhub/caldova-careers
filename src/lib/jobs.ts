/**
 * Pure, side-effect-free helpers for working with job postings.
 *
 * These operate on plain `Job[]` arrays (already loaded from the content
 * collection by the calling page) so they can be unit tested without the Astro
 * content runtime or a database.
 */
import type { Job } from '../types/job';

/** Return jobs in the selected department, or all jobs when no department is selected. */
export function filterJobsByDepartment(jobs: Job[], department: string): Job[] {
  return jobs.filter((job) => !department || job.department === department);
}

/** Return jobs in the selected location, or all jobs when no location is selected. */
export function filterJobsByLocation(jobs: Job[], location: string): Job[] {
  return jobs.filter((job) => !location || job.location === location);
}

/** Apply the selected department and location filters together using AND semantics. */
export function filterJobs(jobs: Job[], department: string, location: string): Job[] {
  return filterJobsByLocation(filterJobsByDepartment(jobs, department), location);
}

/** Return jobs sorted by posted date, newest first (does not mutate input). */
export function sortByNewest(jobs: Job[]): Job[] {
  return [...jobs].sort(
    (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
  );
}

/**
 * Format an ISO-8601 date as a human-readable posted date,
 * e.g. "January 5, 2027". Falls back to the raw value if unparseable.
 */
export function formatPostedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export interface PaginationResult {
  items: Job[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const DEFAULT_PAGE_SIZE = 6;

/** Paginate an array of jobs with a 1-indexed page number and page size. */
export function paginateJobs(
  jobs: Job[],
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): PaginationResult {
  const safePageSize = Math.max(1, pageSize);
  const totalItems = jobs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * safePageSize;
  const items = jobs.slice(startIndex, startIndex + safePageSize);

  return {
    items,
    currentPage,
    totalPages,
    totalItems,
    pageSize: safePageSize,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
