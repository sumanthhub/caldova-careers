import { describe, it, expect } from 'vitest';
import {
    filterJobs,
    filterJobsByDepartment,
    filterJobsByLocation,
    paginateJobs,
    sortByNewest,
    formatPostedDate,
} from './jobs';
import type { Job } from '../types/job';

/** Create a minimal job fixture with optional department and location overrides. */
function makeJob(
  slug: string,
  postedDate: string,
  department = 'Technology',
  location = 'Remote',
): Job {
  return {
    slug,
    title: `Role ${slug}`,
    department,
    location,
    type: 'Full-time',
    remote: true,
    postedDate,
    summary: 'A role.',
  };
}

describe('filterJobsByDepartment', () => {
  const jobs = [
    makeJob('frontend', '2027-01-01'),
    makeJob('finance', '2027-01-02', 'Finance'),
  ];

  it('returns jobs in the selected department', () => {
    expect(filterJobsByDepartment(jobs, 'Finance').map((job) => job.slug)).toEqual([
      'finance',
    ]);
  });

  it('returns every job when no department is selected', () => {
    expect(filterJobsByDepartment(jobs, '').map((job) => job.slug)).toEqual([
      'frontend',
      'finance',
    ]);
  });
});

describe('filterJobsByLocation', () => {
  const jobs = [
    makeJob('remote', '2027-01-01'),
    makeJob('woodinville', '2027-01-02', 'Finance', 'Woodinville, WA, USA'),
  ];

  it('returns jobs in the selected location', () => {
    expect(filterJobsByLocation(jobs, 'Woodinville, WA, USA').map((job) => job.slug)).toEqual([
      'woodinville',
    ]);
  });

  it('returns every job when no location is selected', () => {
    expect(filterJobsByLocation(jobs, '').map((job) => job.slug)).toEqual([
      'remote',
      'woodinville',
    ]);
  });
});

describe('filterJobs', () => {
  const jobs = [
    makeJob('finance-woodinville', '2027-01-01', 'Finance', 'Woodinville, WA, USA'),
    makeJob('finance-helsinki', '2027-01-02', 'Finance', 'Helsinki, Finland'),
    makeJob('technology-woodinville', '2027-01-03', 'Technology', 'Woodinville, WA, USA'),
  ];

  it('combines department and location filters with AND semantics', () => {
    expect(
      filterJobs(jobs, 'Finance', 'Woodinville, WA, USA').map((job) => job.slug),
    ).toEqual(['finance-woodinville']);
  });

  it('returns all jobs when both filters are reset', () => {
    expect(filterJobs(jobs, '', '').map((job) => job.slug)).toEqual([
      'finance-woodinville',
      'finance-helsinki',
      'technology-woodinville',
    ]);
  });

  it('returns no jobs when no postings match', () => {
    expect(filterJobs(jobs, 'Finance', 'London, United Kingdom')).toEqual([]);
  });
});

describe('sortByNewest', () => {
  it('orders jobs by posted date, newest first', () => {
    const jobs = [
      makeJob('a', '2027-01-01'),
      makeJob('b', '2027-03-15'),
      makeJob('c', '2027-02-10'),
    ];
    expect(sortByNewest(jobs).map((j) => j.slug)).toEqual(['b', 'c', 'a']);
  });

  it('does not mutate the input array', () => {
    const jobs = [makeJob('a', '2027-01-01'), makeJob('b', '2027-03-15')];
    const original = jobs.map((j) => j.slug);
    sortByNewest(jobs);
    expect(jobs.map((j) => j.slug)).toEqual(original);
  });
});

describe('formatPostedDate', () => {
  it('formats an ISO date as a readable string', () => {
    expect(formatPostedDate('2027-01-05')).toBe('January 5, 2027');
  });

  it('returns the raw value when the date is unparseable', () => {
    expect(formatPostedDate('not-a-date')).toBe('not-a-date');
  });
});

describe('paginateJobs', () => {
  const jobs = [
    makeJob('1', '2027-01-01'),
    makeJob('2', '2027-01-02'),
    makeJob('3', '2027-01-03'),
    makeJob('4', '2027-01-04'),
    makeJob('5', '2027-01-05'),
  ];

  it('paginates items according to page and pageSize', () => {
    const page1 = paginateJobs(jobs, 1, 2);
    expect(page1.items.map((j) => j.slug)).toEqual(['1', '2']);
    expect(page1.currentPage).toBe(1);
    expect(page1.totalPages).toBe(3);
    expect(page1.hasNextPage).toBe(true);
    expect(page1.hasPrevPage).toBe(false);

    const page2 = paginateJobs(jobs, 2, 2);
    expect(page2.items.map((j) => j.slug)).toEqual(['3', '4']);
    expect(page2.hasNextPage).toBe(true);
    expect(page2.hasPrevPage).toBe(true);

    const page3 = paginateJobs(jobs, 3, 2);
    expect(page3.items.map((j) => j.slug)).toEqual(['5']);
    expect(page3.hasNextPage).toBe(false);
    expect(page3.hasPrevPage).toBe(true);
  });

  it('handles single-page lists', () => {
    const res = paginateJobs(jobs, 1, 10);
    expect(res.items.length).toBe(5);
    expect(res.totalPages).toBe(1);
    expect(res.hasNextPage).toBe(false);
    expect(res.hasPrevPage).toBe(false);
  });

  it('handles empty job lists gracefully', () => {
    const res = paginateJobs([], 1, 5);
    expect(res.items).toEqual([]);
    expect(res.currentPage).toBe(1);
    expect(res.totalPages).toBe(1);
    expect(res.totalItems).toBe(0);
    expect(res.hasNextPage).toBe(false);
    expect(res.hasPrevPage).toBe(false);
  });

  it('clamps out-of-range page numbers', () => {
    const resLow = paginateJobs(jobs, 0, 2);
    expect(resLow.currentPage).toBe(1);

    const resHigh = paginateJobs(jobs, 999, 2);
    expect(resHigh.currentPage).toBe(3);
  });
});
