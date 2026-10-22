# Caldova Careers Coding Standards

This document outlines the coding standards and conventions for the Caldova Careers codebase. These guidelines help ensure readability, maintainability, and accessibility across all contributions.

## Comments and Documentation

- **Focus on Intent and Constraints**: Write comments that explain *why* code exists or highlight non-obvious constraints, business logic, and security considerations. Avoid redundant comments that merely narrate what the code mechanically does.
- **TSDoc for Exported Functions**: Every exported function in `db/` and `src/lib/` must include a TSDoc block describing its purpose, `@param` tags describing expected inputs, and `@returns` tags describing output.
- **Component Props**: All `.astro` components that accept props must define an explicit `Props` interface and document each property with TSDoc comments.

## TypeScript and Data Layer

- **Explicit Typing**: Use explicit parameter and return type annotations on all exported functions.
- **Pure Helpers**: Write small, pure, side-effect-free helpers in `src/lib/` that operate on immutable `Job[]` arrays for straightforward unit testing with Vitest.
- **Database Encapsulation**: Keep database access encapsulated in `src/lib/` with injectable `db` parameters so integration tests can use in-memory databases (`createTestDatabase()`).
- **No Direct Content Collection Access in Helpers**: Helpers must not import Astro content collections directly; pages load collection entries and pass mapped arrays to helpers.

## Frontend Components and Accessibility

- **Native HTML First**: Prefer semantic HTML elements (`<button>`, `<a>`, `<select>`, `<input>`) with accessible labels connected via `for`/`id` or `aria-label`.
- **Visible Focus States**: Ensure all interactive controls have clearly visible focus indicators (e.g. `focus-visible:outline-2 focus-visible:outline-blue-500`).
- **Stable Test Attributes**: Include stable `data-testid` attributes on interactive and workflow-critical elements (e.g. `role-card`, `role-filters`, `apply-form`, `apply-submit`).

## Verification and Quality Checks

Before submitting a pull request, ensure all validation scripts pass:
- `npm run lint` — ESLint static analysis
- `npm run typecheck` — Astro and TypeScript type checks (`astro check`)
- `npm run test:unit` — Vitest unit and database integration tests
- `npm run test:e2e` — Playwright end-to-end tests
