# NextLevel

A real estate deal disposition and buyer-matching platform built for Strata.

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
# Clone the repo
git clone <repo-url>
cd next-level-ai

# Install frontend dependencies
cd frontend
npm install

# Copy environment variables
cp .env.example .env
# Fill in values in .env

# Start the dev server
npm run dev
```

## Environment Variables

See `.env.example` for all required variables.

## Running Tests

```bash
cd frontend
npm test
```

## Branch Strategy

- `main` — production-ready code only. Never work directly on this branch.
- `staging` — integration branch. Code here gets tested before going to main.
- `dev` / feature branches — where all active work happens.

Feature branches follow: `feature/<name>`, `fix/<name>`, `chore/<name>`.

## Deployment

- **Staging:** Automatic deploy when CI passes on the `staging` branch.
- **Production:** Manual approval required after CI passes on `main`.
