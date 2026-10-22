/**
 * Pure, side-effect-free helpers for working with job postings.
 *
 * These operate on plain `Job[]` arrays (already loaded from the content
 * collection by the calling page) so they can be unit tested without the Astro
 * content runtime or a database.
 */
import type { Job } from '../types/job';

/**
 * Return jobs in the selected department, or all jobs when no department is selected.
 *
 * @param jobs - The list of jobs to filter.
 * @param department - Target department name, or an empty string to keep all jobs.
 * @returns Array of jobs matching the department criteria.
 */
export function filterJobsByDepartment(jobs: Job[], department: string): Job[] {
  return jobs.filter((job) => !department || job.department === department);
}

/**
 * Return jobs in the selected location, or all jobs when no location is selected.
 *
 * @param jobs - The list of jobs to filter.
 * @param location - Target location name, or an empty string to keep all jobs.
 * @returns Array of jobs matching the location criteria.
 */
export function filterJobsByLocation(jobs: Job[], location: string): Job[] {
  return jobs.filter((job) => !location || job.location === location);
}

/**
 * Apply the selected department and location filters together using AND semantics.
 *
 * @param jobs - The list of jobs to filter.
 * @param department - Target department name, or empty string for all departments.
 * @param location - Target location name, or empty string for all locations.
 * @returns Array of jobs matching both filters.
 */
export function filterJobs(jobs: Job[], department: string, location: string): Job[] {
  return filterJobsByLocation(filterJobsByDepartment(jobs, department), location);
}

/**
 * Return jobs sorted by posted date, newest first (does not mutate input).
 *
 * @param jobs - The list of jobs to sort.
 * @returns A new array of jobs sorted by posted date descending.
 */
export function sortByNewest(jobs: Job[]): Job[] {
  return [...jobs].sort(
    (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
  );
}

/**
 * Format an ISO-8601 date as a human-readable posted date,
 * e.g. "January 5, 2027". Falls back to the raw value if unparseable.
 *
 * @param iso - An ISO-8601 date string.
 * @returns Formatted human-readable date string in UTC.
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

