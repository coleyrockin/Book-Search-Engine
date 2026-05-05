# Book Search Engine

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-API-E10098?style=flat&logo=graphql&logoColor=white)
![Apollo](https://img.shields.io/badge/Apollo-Client%20%2F%20Server-311C87?style=flat&logo=apollographql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000?style=flat&logo=express&logoColor=white)

A full-stack Google Books search app built with React, Apollo GraphQL, Express, and MongoDB. Users can search Google Books, create an account, save favorite titles, and manage their saved library.

## What Changed

- Modernized the client from Create React App to Vite.
- Upgraded the runtime stack to React 19, Apollo Client 4, Apollo Server 5, Express 5, Mongoose 9, and JSON Web Token 9.
- Removed the stale REST API surface so the server exposes the GraphQL API cleanly.
- Hardened auth, JWT verification, password hashing, request size limits, security headers, and dependency audit posture.
- Improved book result normalization, duplicate-save prevention, mutation cache updates, and localStorage resilience.

## Tech Stack

| Category | Technologies |
| --- | --- |
| Frontend | React 19, Vite 8, React Router 7, React Bootstrap 2, Bootstrap 5 |
| Backend | Node.js 20+, Express 5, Apollo Server 5 |
| API | GraphQL |
| Database | MongoDB, Mongoose 9 |
| Auth | JWT, bcryptjs |
| External API | Google Books API |

## Getting Started

```bash
npm install
cp .env.example .env
npm run develop
```

The client runs on `http://localhost:3000` and proxies GraphQL requests to `http://localhost:3001/graphql`.

## Scripts

```bash
npm run develop     # Run client and server together
npm run build       # Build the Vite client
npm run start       # Run the production server
npm run seed        # Seed a demo user and saved books when MongoDB is running
npm test            # Run server and client unit tests
npm run verify      # Run build, tests, and production audit
npm run audit:prod  # Audit root, server, and client production dependencies
```

## Security Baseline

- Production dependency audit: `0 vulnerabilities`
- Server headers: Helmet, CSP, frame blocking, nosniff, no-referrer, and permissions policy
- API controls: explicit CORS allowlist, bounded JSON request bodies, and GraphQL rate limiting
- Auth controls: JWT algorithm pinning, short token expiration, stronger password hashing, and sessionStorage token persistence
- Data controls: Mongoose filter sanitization, schema length limits, HTTPS-only external URL normalization, and duplicate book prevention

See `security_best_practices_report.md` and `ROADMAP.md` for the audit and next build plan.

## Environment

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/googlebooks
JWT_SECRET=change_me_to_a_long_random_value
JWT_EXPIRATION=2h
CLIENT_ORIGIN=http://localhost:3000
PORT=3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

## Project Structure

```text
Book-Search-Engine/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   ├── index.html
│   └── vite.config.js
├── server/
│   ├── config/
│   ├── models/
│   ├── schemas/
│   ├── utils/
│   └── server.js
└── package.json
```
