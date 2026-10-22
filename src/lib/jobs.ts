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

export type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

/** Return jobs sorted according to the selected sort option (does not mutate input). */
export function sortJobs(jobs: Job[], sortOption: SortOption | string = 'newest'): Job[] {
  const sorted = [...jobs];
  switch (sortOption) {
    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime(),
      );
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'newest':
    default:
      return sorted.sort(
        (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
      );
  }
}

/** Return jobs sorted by posted date, newest first (does not mutate input). */
export function sortByNewest(jobs: Job[]): Job[] {
  return sortJobs(jobs, 'newest');
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
