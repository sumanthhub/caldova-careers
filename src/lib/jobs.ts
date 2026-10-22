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

/** Return jobs whose title matches query case-insensitively, or all jobs when query is empty. */
export function searchJobsByTitle(jobs: Job[], query: string): Job[] {
  const normalized = query.trim().toLowerCase();
  return jobs.filter((job) => !normalized || job.title.toLowerCase().includes(normalized));
}

/** Apply department, location, and optional title search filters together using AND semantics. */
export function filterJobs(
  jobs: Job[],
  department: string,
  location: string,
  searchQuery: string = '',
): Job[] {
  return searchJobsByTitle(
    filterJobsByLocation(filterJobsByDepartment(jobs, department), location),
    searchQuery,
  );
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
