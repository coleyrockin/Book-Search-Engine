# Security Best Practices Report

## Executive Summary

The application is now in a substantially better security posture than the original MERN starter state. Production dependency audits are clean, the legacy REST surface was removed, the server uses current Apollo/Express/Mongoose/JWT dependencies, and the app now has security headers, CSP, bounded request parsing, rate limiting, safer URL handling, stronger schema validation, password hashing, and cleaner error handling.

Residual risk is now mostly architectural: browser-readable JWTs are still used, MongoDB availability is environment-dependent, and test coverage should expand from security utilities into resolver and UI workflow coverage.

## Resolved Critical / High Findings

### SEC-001: Vulnerable legacy dependencies

- Severity: Critical
- Location: `client/package.json`, `server/package.json`, lockfiles
- Evidence: Previous audits flagged critical/high issues from `react-scripts`, Apollo Server 3, old Mongoose, old JWT, old bcrypt, and old Express transitive dependencies.
- Impact: Known dependency vulnerabilities can become remote code execution, denial of service, auth bypass, or prototype pollution depending on the package.
- Fix: Upgraded to Vite, React 19, Apollo Client 4, Apollo Server 5, Express 5, Mongoose 9, JSON Web Token 9, and bcryptjs.
- Verification: `npm run audit:prod` reports `0 vulnerabilities`.

### SEC-002: Missing production security headers and CSP

- Severity: High
- Location: `server/server.js:34-86`
- Evidence: Helmet and a strict app CSP are now configured with `script-src 'self'`, object blocking, frame blocking, no-referrer, nosniff, and clickjacking protection.
- Impact: Without these controls, XSS and clickjacking vulnerabilities have a larger blast radius.
- Fix: Added Helmet, CSP, frame protections, nosniff, referrer policy, permissions policy, and x-powered-by removal.
- Mitigation: Keep CSP tight as new external services are added.

### SEC-003: No brute-force or abuse throttling on GraphQL

- Severity: High
- Location: `server/server.js:56-62`, `server/server.js:91-99`
- Evidence: `/graphql` now has `express-rate-limit` applied before the Apollo middleware.
- Impact: Login and mutation endpoints could be abused for credential stuffing, scraping, or denial of service.
- Fix: Added configurable rate limiting with `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`.
- Mitigation: Add account-aware login throttling if this becomes public production software.

### SEC-004: Unsafe URL trust boundary from Google Books / saved data

- Severity: High
- Location: `client/src/utils/url.js:1-14`, `client/src/pages/SearchBooks.jsx:30-31`, `client/src/pages/SavedBooks.jsx:99-118`, `server/schemas/resolvers.js:28-54`
- Evidence: External image and link values are normalized through HTTPS-only URL parsing before rendering or saving.
- Impact: Rendering untrusted URL schemes can lead to script-bearing navigation or data exfiltration patterns.
- Fix: Added URL normalization on both client and server.
- Mitigation: If more external providers are added, add host allowlists per provider.

## Resolved Medium Findings

### SEC-005: Broad / stale REST attack surface

- Severity: Medium
- Location: removed `server/routes/*`, removed `server/controllers/user-controller.js`, trimmed `client/src/utils/API.js`
- Evidence: The app is GraphQL-only, but legacy REST routes and client helpers remained.
- Impact: Dead routes confuse reviews and can drift into unmaintained vulnerable code.
- Fix: Removed server REST routes/controllers and stale REST client helpers.

### SEC-006: Weak input constraints

- Severity: Medium
- Location: `server/schemas/resolvers.js:23-71`, `server/models/User.js:8-30`, `server/models/Book.js:5-44`
- Evidence: User and book input is now normalized, length-bounded, and validated before persistence.
- Impact: Unbounded strings and arrays can create storage abuse and denial-of-service risk.
- Fix: Added resolver-level normalization plus Mongoose length and array validators.

### SEC-007: Importing the server started external side effects

- Severity: Medium
- Location: `server/server.js:88-138`, `server/config/connection.js:11-14`
- Evidence: Server startup is now behind `require.main === module`; tests can import the app without opening a MongoDB connection.
- Impact: Test tooling and security checks were brittle and could fail just by importing the module.
- Fix: Exported `app`, `server`, and `startApolloServer`; connection occurs only during startup.

## Remaining Risks / Roadmap Items

### RISK-001: Browser-readable JWTs remain

- Severity: Medium
- Location: `client/src/utils/auth.js`
- Evidence: Tokens are now saved to `sessionStorage`, with a temporary `localStorage` fallback for existing sessions.
- Impact: Any XSS can still read bearer tokens while a session is active.
- Recommended next fix: Move auth to HTTPOnly, SameSite cookies and add a CSRF strategy for state-changing GraphQL operations.

### RISK-002: Limited automated test suite

- Severity: Medium
- Location: project-wide
- Evidence: Build, audit, schema-load, server module-load, auth roundtrip checks, auth unit tests, URL safety tests, and localStorage tests pass.
- Impact: Security and auth regressions can slip in unnoticed.
- Recommended next fix: Add API resolver tests and client interaction tests for search, save, delete, and unauthenticated redirects.

### RISK-003: Production deployment controls are not visible

- Severity: Low
- Location: infrastructure outside this repo
- Evidence: TLS, process management, runtime secrets, DB backups, and edge headers are not represented here.
- Impact: App code can be secure while deployment remains weak.
- Recommended next fix: Add deployment docs/checks for TLS, `NODE_ENV=production`, `JWT_SECRET`, `MONGODB_URI`, and log handling.
