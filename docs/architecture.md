# Architecture

Browser React 19 + TypeScript + Vite + Tailwind -> same-origin Express REST API -> deterministic domain engine -> repository. Firebase Auth verifies Google sign-in; Firebase Admin verifies ID tokens with revocation checking. Only the API can access Firestore. Optional Gemini calls happen on the server through the official `@google/genai` SDK.

## Modules

- `shared/types.ts`, `shared/catalog.ts`: public types and documented six-competency rubric. No answer keys.
- `server/domain/questions.ts`: 36 private questions, explanations, stable family IDs, and explicit public projection.
- `server/domain/engine.ts`: scoring, coverage, assessment transitions, prerequisite planning and version acceptance.
- `server/domain/job-description.ts`: bounded deterministic exact-quote matching and weight proposals.
- `server/repositories/store.ts`: testable in-memory store and transaction-backed Firestore implementation.
- `server/services/gemini.ts`: bounded context, JSON schema, output validation and safe provider errors.
- `server/app.ts`: identity, origin and CSRF protection, validation, limits, REST delivery, production static serving.
- `src/app`: session restoration, protected routes, async status, navigation and error boundary.
- `src/pages`: lazy-loaded product screens. Analyzer and analytics live in Overview; challenge lives in Assessments.

## Trust boundary and data model

The browser supplies answers and profile preferences, never authoritative scores or evidence. The authenticated UID comes only from verified tokens. Demo keys are SHA-256 hashes of cryptographically random 256-bit cookie tokens; expiry is checked server-side. Every assessment lookup is scoped to that workspace.

Firestore roots: `users/{uid}` or `demoSessions/{hashedToken}`. Roots contain a small profile, active revision pointer, weights, task progress map, expiry, allowance counter and version. Growing histories are separate `assessments`, `evidence`, `roadmaps`, `studyLogs`, and `messages` subcollections. `usageBuckets/{UTC-date}` holds the shared AI reservation counter. This adapts the suggested schema: there is one track and one bounded chat thread per workspace. Competency summaries are derived instead of duplicated in writable client documents.

Submission transactions read the current records, verify the issued attempt, grade once, append evidence, and propose a revision atomically. Concurrent repeated submission returns the original result. Only changed documents are written. Demo reset deletes previous session histories transactionally, retains quota and expiry, and seeds a fresh fictional workspace. Real user history has no reset route.

The current repository loads complete per-user histories for a coherent calculation. This is appropriate for the bounded demo, but projection/pagination must replace full-history reads for large accounts. Firestore transaction retry safety depends on domain callbacks remaining synchronous and free of external side effects. Gemini requests occur outside transactions.

## Evidence policy

1. An issued question family contributes evidence only once, including incorrect first answers. Later repeats may pass a checkpoint but add no evidence and do not replace first-exposure evidence.
2. For each competency, choose the most recent ten distinct eligible families. Below three families display insufficient evidence; zero families display unassessed. Otherwise score = rounded `100 * correct / eligible`.
3. Role assessment score is the weighted mean among competencies with sufficient evidence. Coverage is assessed competency weight / total role weight, rounded to a whole percent. Missing ability is never interpreted as zero.
4. A five-question checkpoint passes at four correct. Self-report, study logs, practical keyword coverage, and task completion have no path into score calculation.

The finite bank has eight SQL families, eight API families and five for each other competency. It intentionally refuses to invent more evidence after repeated exposure. Add new reviewed families and bank-version migration before long-term use.

## Planning

Prioritize weighted gaps (unassessed gets an explicit evidence-collection priority), then perform prerequisite traversal. Schedule six curated practice tasks with a 90-minute maximum per task into weeks capped at 80% of the student's hours. At low weekly availability the task is a smaller timeboxed practice session; completion is never mastery. Completion state is keyed by stable task ID outside immutable task snapshots.

The active revision stays unchanged while a proposal is pending. Accept validates its parent and a fingerprint of scores, capacity, preferences and weights; stale proposals fail with 409. Accepted snapshots remain in history; only their lifecycle status changes. Proposed job-description weights apply only on acceptance. Quotes are literal excerpts and capped at 500 characters; unrecognized requirements produce an honest validation error.

## AI

The model receives role, competency summary, next task and the user's current message. It does not receive name, email or full portfolio. Output is a bounded `{answer: string}` JSON object validated with Zod. There are no tools or model-controlled writes. A 15-second SDK timeout and a finite output-token cap bound calls; automatic retries are not added. Upstream failure returns 503 and never modifies scores. Reserved quota is not refunded. Task personalization and AI practical feedback are not yet implemented.
