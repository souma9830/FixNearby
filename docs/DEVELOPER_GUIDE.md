# FixNearby Developer Guide 🛠️

Welcome! This guide consolidates all local development instructions, folder layouts, and coding rules for FixNearby.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)
- npm or yarn

### Configuration Setup
1. Copy `.env.example` in the server root to `.env` and fill in:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fixnearby
   JWT_SECRET=your_jwt_secret
   ```
2. Navigate to `server` and run `npm install`.
3. Start the dev server: `npm run dev`.

### Client Setup
1. Navigate to `client` and run `npm install`.
2. Start Vite: `npm run dev`.

## Project Directory Map
- `/client`: Frontend codebase (Vite, React, Tailwind CSS)
  - `/src/components`: Shared React UI widgets
  - `/src/pages`: Top-level route pages
- `/server`: Node/Express backend codebase
  - `/controllers`: HTTP controller handlers
  - `/models`: Database schema models
  - `/routes`: Server router endpoints

## Testing Pipeline
The project runs two test suites:
- **Legacy tests** (`npm test` in `server/`): Core CRUD validation for bookings, auth, messaging, etc.
- **New integration tests** (`npm run test:new` in `server/`): Health check, booking expiry, reminders, favorites, audit logs, rate limiting, review responses, validation schemas, and password policy.
Both suites must pass before merging to `master`.

## CI/CD Quality Gate Workflows
Pull requests against `master` automatically trigger:
1. **Automated Quality Gate** (`.github/workflows/quality-gate.yml`) — Backend sanity testing and frontend production build verification.
2. **Documentation Integrity** (`.github/workflows/documentation-check.yml`) — Validates link integrity across docs directory.
3. **Structured PR Checklists** — Managed via `.github/PULL_REQUEST_TEMPLATE/feature_pr.md`.

## Coding Rules
- Do not commit secrets/credentials.
- Follow conventional commits for branches and commits.
- Ensure linting and tests pass before raising a PR.
- All new features must include corresponding verification tests in `server/tests/`.
