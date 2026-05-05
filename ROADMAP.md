# Development Roadmap

## Phase 1: Stabilize and Secure Baseline

Status: complete

- Replace Create React App with Vite.
- Upgrade React, Apollo, Express, Mongoose, JWT, and build tooling.
- Remove stale REST routes/controllers.
- Add production security headers, CSP, CORS controls, rate limiting, request size limits, and safer error handling.
- Normalize Google Books data and prevent unsafe external URL schemes.
- Clear production dependency audits.

## Phase 2: Reliability and Test Coverage

Status: in progress

- Add resolver tests for `me`, `login`, `addUser`, `saveBook`, and `removeBook`.
- Added auth utility tests for missing, malformed, valid, and rejected-algorithm tokens.
- Added client utility tests for safe external URLs and saved book id storage.
- Add resolver tests for authenticated GraphQL flows with mocked models.
- Add client interaction tests for search, save, delete, and unauthenticated redirects.
- Added a GitHub Actions workflow for install, build, audit, and tests.
- Added seed data and a local MongoDB setup path for repeatable development.

## Phase 3: Authentication Hardening

Status: planned

- Move from browser-readable bearer tokens to HTTPOnly, SameSite cookies.
- Add CSRF protection for cookie-authenticated GraphQL mutations.
- Add account-aware login throttling and lockout/backoff rules.
- Add password strength feedback and server-side duplicate-account error handling.
- Remove the temporary legacy `localStorage` token fallback after migration.

## Phase 4: Product Polish

Status: planned

- Add empty states, skeleton states, and optimistic UI for save/delete.
- Add sorting/filtering on saved books.
- Add pagination or infinite scrolling for Google Books results.
- Add profile/account controls.
- Improve metadata and deploy-ready production docs.
