# SkillBridge AI

**Don't just learn skills. Prove them. Improve them.**

An interactive React/Express application for an Entry-Level Full-Stack Developer learning track. Students assess narrow competencies, practice, verify learning, inspect evidence, and explicitly accept proposed plan revisions. It implements the revised 14 November 2026 specification supplied in `implementation_plan (1).md` in the parent workspace.

## Run locally

Requires Node.js 24 or newer and npm. From this directory:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Open **http://localhost:5173**. Use `localhost`, matching `APP_ORIGIN`, rather than the alternate IP printed by Vite. Click **Launch Judge Demo**. No credentials are needed for the deterministic demo. The local backend uses port 3000 and the frontend proxies same-origin `/api` requests.

Memory storage is development-only: it survives page reloads but not a server restart. The UI explicitly labels this. Use Firestore for durable records. If a Windows sandbox blocks the `tsx` launcher with `uv_os_get_passwd`, run the dev/test command with approved normal-user permissions. Do not modify the launcher or bypass the sandbox.

## What works

- Landing page, protected workspace, Google sign-in integration, four-step onboarding, and an isolated four-hour judge session.
- Six documented competencies and a 36-question authored bank. Eight-question diagnostics and five-question checkpoints are graded on the server.
- At least three distinct eligible families before a competency score is displayed; rolling window of ten families; repeats add no evidence. Pass threshold is 4/5 = 80%.
- Assessment score and weighted coverage remain separate. Self-report, practice completion, and study time never award competency points.
- Prerequisite-aware plans use at most 80% of weekly capacity. Revisions show before/after plans and require acceptance; stale proposals are rejected.
- Job-description customization quotes exact matching requirements and proposes weights for existing competencies. This is labeled deterministic keyword matching, not AI extraction.
- Secure API design challenge with explicit static coverage checks. These are not execution tests or independent certification.
- Evidence portfolio, JSON export, printable view, assessment charts, study logs, settings, light/dark themes, and mobile navigation.
- Server-only Gemini mentor with structured output validation, timeout, per-account/session limits, shared daily budget, and honest failure states.
- Firestore repository using subcollections and transactions; deny-all browser Firestore rules; production server and Docker packaging.

## Configuration

| Variable                    | Purpose                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `PORT`                      | Server port; defaults to 3000; binds to `0.0.0.0`                                     |
| `APP_ORIGIN`                | Exact public browser origin, no trailing slash; local default `http://localhost:5173` |
| `STORAGE`                   | `memory` locally or `firestore`; production rejects memory                            |
| `FIREBASE_PROJECT_ID`       | Firebase/Google Cloud project used by Admin SDK                                       |
| `VITE_FIREBASE_API_KEY`     | Public Firebase web app configuration, not an Admin secret                            |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase authorized auth domain                                                       |
| `VITE_FIREBASE_PROJECT_ID`  | Public web app project ID                                                             |
| `GEMINI_API_KEY`            | Server secret; never use a Vite-prefixed key                                          |
| `GEMINI_MODEL`              | Explicit model available to your project; no unverified default                       |
| `AI_GLOBAL_DAILY_LIMIT`     | Shared UTC-day AI request allowance; default 100                                      |

Firebase: register a web app, enable Google Sign-In, authorize your local and deployed domains, create Firestore, and configure Application Default Credentials for the server. In Cloud Run use a dedicated service identity with the required Firestore permissions. Never commit service-account JSON. Deploy the provided rules separately with the Firebase CLI after project approval. See [deployment](docs/deployment.md).

Gemini: choose a supported text model with JSON-schema output from the models available to your actual account. Configure its key and model on the server. Access, free-tier eligibility, billing and quotas must be checked in your account; none are assumed. AI is optional for grading and roadmap logic. A failed generation consumes its reserved allowance to prevent retry abuse. Demo sessions receive three requests, real accounts thirty total requests in this hackathon implementation; the shared global bucket resets daily. Resetting demo progress does not refill AI credits.

## Commands

| Command                    | Purpose                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| `npm run dev`              | Vite + Express with reload                                         |
| `npm run typecheck`        | Strict TypeScript checks                                           |
| `npm run lint`             | ESLint                                                             |
| `npm test`                 | Domain, API, and mocked Gemini tests                               |
| `npm run test:integration` | API and gateway tests                                              |
| `npm run test:e2e`         | Playwright on installed Microsoft Edge; starts the dev servers     |
| `npm run build`            | Build browser assets and bundled Node server                       |
| `npm start`                | Start the built server; set `NODE_ENV=production` to serve the SPA |
| `npm run format`           | Format source and documentation                                    |

Browser tests use the installed Edge channel. On other hosts, change the Playwright channel to an available Chromium browser and install it through Playwright. Tests use a separate fictional session and no real API credentials. Production requires `STORAGE=firestore` and `APP_ORIGIN`.

## Verification and limitations

See [HANDOFF](HANDOFF.md) for exact results and outstanding checks. Live Google authentication, Firestore restart durability/rules, live Gemini output, container builds, and AI Studio import/publishing require external setup and are **not claimed verified**. No service has been deployed.

This is a tested hackathon implementation, not an unrestricted production launch. The small reviewed-in-code question bank can be exhausted; additional independently reviewed families are needed for longer learning journeys. Static practical checks can be satisfied by mentioning terms and do not prove code correctness. The repository reads each user's histories to compute its projection; large-account pagination/projection optimization remains. Automated retention cleanup, account deletion UX, and a public operator contact remain before public release. Gemini task personalization and advisory project reviews remain future extensions; deterministic plan explanations and the contextual mentor are implemented.

Architecture, APIs, security, and demonstration: [architecture](docs/architecture.md), [API](docs/api.md), [security](docs/security.md), [judge walkthrough](docs/judge-demo.md).
