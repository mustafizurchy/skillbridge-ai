# Verification record

Executed locally on 14 November 2026. No live cloud credentials were used.

| Check | Final result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS: 4 files, 25 tests |
| `npm run test:e2e` | PASS: 3 Edge browser tests, 20.4 seconds |
| `npm run build` | PASS: Vite client and bundled Node server |
| `npm run format` | PASS |
| Patched dependency installation audit | Zero known vulnerabilities reported |
| `npm start` in production mode | Listening on `0.0.0.0:4310` |
| `/api/health` | HTTP 200 with JSON status `ok` |
| `/` and `/app/plan` | HTTP 200 with built SPA document |
| Client asset marker scan | No server key variable, private answer explanation, Admin credential function, or test secret |
| Visual review | Desktop overview screenshot inspected in Edge |

The production smoke test used Firestore configuration with a dummy project identifier and exercised only liveness/static routing, with no database read/write. It proves startup and deep links, not configured database access. The process was stopped afterward.

Domain coverage: evidence minimums, rolling windows, duplicate families, score decreases, weighted coverage, checkpoint thresholds, effort separation, prerequisite ordering, weekly capacity, stale proposals, explicit acceptance and quoted job requirements.

API coverage: protected access, token-verifier injection, forged origins, CSRF, account/demo isolation, concurrent idempotent submission, grade forgery rejection, quota preservation, AI unavailable responses, practical evidence, export, logout-cookie replay and malformed JSON. Gateway tests mock the SDK to verify structured output handling, omitted profile identity and safe provider failures.

Browser coverage: full judge checkpoint/evidence/revision/reload flow with no uncaught page errors; mobile navigation and no horizontal overflow at 390px; failed-save feedback preserving old values; job weights applying only after acceptance; practical submission without score changes.

Resolved during QA: a seeded-score test expectation, a test-helper type, intentional-unused-argument lint settings, dependency audit findings, a browser selector collision, demo logout revocation and default Gemini retries. The Windows sandbox blocked `tsx` OS user-info access; browser checks passed using the approved unsandboxed test command.

External checks not executed: live Firebase/Firestore/Gemini, Firestore emulator (Java absent), Docker container, AI Studio import, Cloud Run deployment. Memory-mode refresh persistence is distinct from durable restart persistence.
