import { describe, it, expect } from 'vitest';
import {
    filterJobs,
    filterJobsByDepartment,
    filterJobsByLocation,
    getDepartments,
    getJobsByDepartment,
    departmentToSlug,
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

describe('getDepartments', () => {
  it('returns sorted deduplicated list of departments', () => {
    const jobs = [
      makeJob('a', '2027-01-01', 'Technology'),
      makeJob('b', '2027-01-02', 'Finance'),
      makeJob('c', '2027-01-03', 'Technology'),
    ];
    expect(getDepartments(jobs)).toEqual(['Finance', 'Technology']);
  });

  it('handles empty jobs array', () => {
    expect(getDepartments([])).toEqual([]);
  });
});

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

describe('getJobsByDepartment', () => {
  const jobs = [
    makeJob('frontend', '2027-01-01', 'Technology'),
    makeJob('finance', '2027-01-02', 'Finance'),
  ];

  it('returns jobs matching the department', () => {
    expect(getJobsByDepartment(jobs, 'Technology').map((j) => j.slug)).toEqual(['frontend']);
  });

  it('returns empty array when department has no jobs', () => {
    expect(getJobsByDepartment(jobs, 'Nonexistent')).toEqual([]);
  });
});

describe('departmentToSlug', () => {
  it('converts department names with ampersands and special characters to URL-friendly slugs', () => {
    expect(departmentToSlug('Research & Development')).toBe('research-and-development');
    expect(departmentToSlug('Contact Center & Sales Enablement')).toBe('contact-center-and-sales-enablement');
    expect(departmentToSlug('Technology')).toBe('technology');
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
