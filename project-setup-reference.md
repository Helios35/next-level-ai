# Project Setup Reference
*Hand this to your agent at the start of every project. Before any feature code is written.*

---

## Your Role

You are setting up a production-grade project from scratch. Your job is to build the foundation correctly before touching any feature work. Follow every section in this document. Do not skip steps. Do not begin feature development until setup is complete and confirmed.

---

## 1. Repository & Version Control

### Create the repo
- Initialize a Git repository
- Create a `README.md` with the project name and a one-line description

### Set up `.gitignore` immediately — before anything else is committed
Your `.gitignore` must include at minimum:
- Environment files: `.env`, `.env.local`, `.env.staging`, `.env.production`
- Dependency folders: `node_modules/`, vendor directories
- Build output: `dist/`, `build/`, `.next/`, `.output/`
- System files: `.DS_Store`, `Thumbs.db`
- Editor files: `.vscode/`, `.idea/`
- Log files: `*.log`

**Rule:** If a file contains secrets, credentials, or machine-specific config — it goes in `.gitignore`. No exceptions.

### First commit
- Commit only the repo structure and `.gitignore`
- Commit message: `chore: initial project setup`
- Nothing else goes in this commit

### Branching rules
- `main` — production-ready code only. Never work directly on this branch.
- `staging` — integration branch. Code here gets tested before going to main.
- `dev` or feature branches — where all active work happens.

**Rule:** Create a new branch for every feature. Name it clearly: `feature/user-auth`, `fix/login-bug`, `chore/add-tests`.

### Commit hygiene
- Commit in small, focused chunks — one logical change per commit
- Write descriptive commit messages: what changed and why
- Never commit all changes at once in one giant commit
- Never commit broken code

---

## 2. Environment Setup

### Create environment files
Create the following files in the project root:
- `.env` — local development values
- `.env.example` — a copy of `.env` with all keys listed but **values left blank**

`.env` goes in `.gitignore`. `.env.example` gets committed — it tells other developers what variables are needed without exposing values.

### Environment variable rules
- All secrets, API keys, database URLs, and config values go in `.env` — never hardcoded in the codebase
- Each environment (local, staging, production) has its own `.env` with its own values
- The code only references the variable name — it never cares where the value comes from

### `.env.example` format
```
# Database
DATABASE_URL=

# Authentication
AUTH_SECRET=
AUTH_EXPIRY=

# Third-party services
SERVICE_API_KEY=
SERVICE_BASE_URL=
```

**Rule:** Every time a new environment variable is added, update `.env.example` immediately.

---

## 3. Project Structure

Organize the project using this directory structure. Adapt folder names to the framework being used, but preserve the separation of concerns.

```
project-root/
├── frontend/                  # All UI code
│   └── src/
│       ├── components/        # Reusable UI pieces used in 2+ places
│       ├── pages/             # One file per screen/route
│       ├── hooks/             # Reusable stateful logic
│       ├── utils/             # Pure helper functions, no UI dependencies
│       └── styles/            # Global styles only
│
├── backend/                   # All server and API code
│   └── src/
│       ├── routes/            # API endpoint definitions
│       ├── controllers/       # Business logic handlers
│       ├── models/            # Data structure definitions
│       ├── middleware/        # Auth, logging, error handling
│       └── utils/             # Pure helper functions
│
├── shared/                    # Code used by both frontend and backend
│   ├── types/                 # Shared data type definitions
│   ├── constants/             # Shared constant values
│   └── utils/                 # Shared utility functions
│
├── tests/                     # All test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env
├── .env.example
├── .gitignore
└── README.md
```

### Placement rules
- A component used in one place → lives with that feature
- A component used in 2+ places → moves to `shared/` or `components/`
- Business logic never lives in the UI layer
- Database access never lives in the UI layer or routes — only in controllers/models
- If you're unsure where something goes, ask: *how widely is this used?* That determines its folder level.

---

## 4. Code Quality — Non-Negotiables

Set these up before writing any logic code.

### Linter
- Install and configure a linter for the language being used
- The linter must run and pass before any code is committed
- Fix all linter errors — do not suppress them without a documented reason

### Formatter
- Install and configure an auto-formatter
- Configure it to run on save or pre-commit
- Formatting must be consistent across every file in the project

### Naming conventions — enforce these throughout
| Thing | Convention |
|-------|------------|
| Variables and functions | `camelCase` |
| Classes and components | `PascalCase` |
| Files | `kebab-case` or match the convention of the framework |
| Constants | `UPPER_SNAKE_CASE` |
| Database tables | `snake_case` |

### Function and variable naming rules
- Names must describe what the thing does or contains — not how it works
- A function named `getUserSubscriptionStatus()` is correct. A function named `doThing()` is not.
- If you need a comment to explain what the code does, the name is wrong — rename it

### Single responsibility rule
- Every function does one thing
- Every file has one clear purpose
- If something does "this AND that" — split it into two things

### Comments
- Comments explain **why** a decision was made — not what the code does
- Good comment: `// Using POST here instead of PUT because the client can't send partial updates`
- Bad comment: `// Loop through users` (the code already says that)

---

## 5. Testing Setup

Set up the testing framework before writing any feature code. Tests get written alongside features — not after.

### Install the testing framework
- Choose and install a testing library appropriate for the stack
- Configure it to run with a single command: `npm test` or equivalent
- Add the test command to the project's `README.md`

### Test file structure
- Unit tests live next to the code they test, or in `tests/unit/`
- Integration tests live in `tests/integration/`
- End-to-end tests live in `tests/e2e/`
- Test files are named to match what they test: `userController.test.js`

### The three test types — write all three

**Unit tests** — one function, in isolation
- Given a specific input, verify the output is exactly what's expected
- Fast to run, easy to debug
- Write one for every non-trivial function

**Integration tests** — multiple pieces working together
- Verify that two or more connected components produce the correct combined result
- Example: function + database working correctly together
- Use a test database — never run integration tests against real data

**End-to-end tests** — full user flow, front to back
- Simulate a real user performing a real action
- Verify the entire chain produces the correct outcome
- Slower to run, but catches things unit tests miss

### How to write a test scenario
Every test follows this structure:

1. **Arrange** — set up the starting condition
2. **Act** — trigger the thing being tested
3. **Assert** — verify the result matches what's expected

Write scenarios in plain english first, then implement them:
- *Given a user with an expired subscription, when we check their status, then it should return inactive*
- *Given an empty database, when a record is created, then the database should contain exactly one record*
- *Given a logged-out user, when they try to access a protected route, then they should be redirected to login*

**Rule:** Every new feature ships with tests. No feature is complete without them.

---

## 6. CI/CD Pipeline

Set up automation before any feature work begins. This is a one-time setup that runs forever.

### What to configure

**CI — Continuous Integration**
- Trigger: every push to any branch
- Action: run the full test suite automatically
- Result: pass or fail — no code moves forward on a failure

**CD — Continuous Deployment**
- Staging: deploy automatically when CI passes on the `staging` branch
- Production: deploy only after manual approval, after CI passes on `main`

### Minimum pipeline configuration
```
On every push:
  → Run linter
  → Run full test suite
  → Report pass/fail

On push to staging branch (if CI passes):
  → Deploy to staging environment automatically

On push to main branch (if CI passes):
  → Wait for manual approval
  → Deploy to production
```

### Rule
Code never reaches staging or production without passing CI first. No exceptions. No manual overrides.

---

## 7. README

The `README.md` must be completed before setup is considered done.

### Required sections
```markdown
# Project Name

One sentence description of what this project does.

## Prerequisites
What needs to be installed before running this project.

## Setup
Step-by-step instructions to get the project running locally.

## Environment Variables
List of all required variables. Point to `.env.example`.

## Running Tests
Command to run the test suite.

## Branch Strategy
Explain the branching model being used.

## Deployment
How code gets to staging and production.
```

---

## 8. Setup Checklist

Do not begin feature development until every item here is checked off.

```
REPOSITORY
[ ] Repo initialized
[ ] .gitignore created and complete
[ ] First commit is structure only — no feature code

ENVIRONMENT
[ ] .env created locally
[ ] .env.example committed with all keys, no values
[ ] All secrets confirmed out of version control

PROJECT STRUCTURE
[ ] Directory structure matches the structure defined in Section 3
[ ] No business logic in the UI layer
[ ] No database access outside the data layer

CODE QUALITY
[ ] Linter installed and passing
[ ] Formatter installed and configured
[ ] Naming conventions documented and in use

TESTING
[ ] Testing framework installed
[ ] Test command works: `npm test` or equivalent
[ ] At least one placeholder test exists to confirm setup

CI/CD
[ ] CI runs on every push
[ ] CD configured for staging (automatic) and production (manual approval)

DOCUMENTATION
[ ] README complete with all required sections

BRANCHES
[ ] main branch exists
[ ] staging branch exists
[ ] Active work happening on a feature branch — not on main
```

---

*Setup is complete when every box is checked. Only then does feature development begin.*
