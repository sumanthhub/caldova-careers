/**
 * Pure, side-effect-free helpers for working with job postings.
 *
 * These operate on plain `Job[]` arrays (already loaded from the content
 * collection by the calling page) so they can be unit tested without the Astro
 * content runtime or a database.
 */
import type { Job } from '../types/job';

/** Return a sorted, deduplicated list of departments from the given jobs array. */
export function getDepartments(jobs: Job[]): string[] {
  return [...new Set(jobs.map((job) => job.department))].sort();
}

/** Return jobs in the selected department, or all jobs when no department is selected. */
export function filterJobsByDepartment(jobs: Job[], department: string): Job[] {
  return jobs.filter((job) => !department || job.department === department);
}

/** Return roles for a department from a Job[] array. */
export function getJobsByDepartment(jobs: Job[], department: string): Job[] {
  return filterJobsByDepartment(jobs, department);
}

/** Convert a department name to a URL slug. */
export function departmentToSlug(department: string): string {
  return department
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
