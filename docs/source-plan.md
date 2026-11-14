# SkillBridge AI — Revised Architecture and Implementation Plan

Revision: 14 November 2026. This revision replaces the original implementation plan and defines the authoritative specification for building SkillBridge AI.

> [!IMPORTANT]
> **Core Product Direction**: Help a student decide what to learn next, complete a practical task, and see what evidence supports their progress toward a target role. All grades, evidence eligibility, checkpoint statuses, and roadmap adaptations are computed deterministically on the backend, with Gemini providing explanations, task personalization, and bounded guidance.

---

## 1. Product Direction & Closed Learning Loop

Start with university students seeking entry-level software roles (**Entry-Level Full-Stack Developer** with 6 clearly defined competencies). The defining experience is a closed learning loop built around an explainable evidence trail (**"What changed, why did it change, and what should I do next?"**):

1. Choose a target role and available weekly study time.
2. Complete a short diagnostic (6–10 questions across 2–3 competencies); distinguish self-reported skills from assessed knowledge and leave unassessed skills explicitly marked as `Unassessed`.
3. Receive one prioritized weekly plan with prerequisite-aware explanations.
4. Complete learning activities and a small practical challenge (designing an API endpoint with validation, authorization, and error handling, evaluated against an explicit rubric).
5. Submit a server-graded checkpoint assessment (80% / 4-of-5 threshold).
6. Inspect the evidence trail, score changes, and a before/after proposed roadmap adjustment—and explicitly accept the revision to update the active plan.

---

## 2. Corrections to the Original Plan

| Original decision | Revised decision and reason |
|---|---|
| Add 6–12 skill points after completion/pass | Recompute evidence scores from eligible attempts. Completion records effort, not mastery. |
| Three questions establish a broad baseline | Use a short diagnostic for a narrow set of skills; leave everything else explicitly unassessed. |
| Five questions pass at 70% | Five equally weighted questions produce 20-point increments, so the effective threshold is 4/5, or 80%. Display the actual rule. |
| Student owns and writes the whole workspace | Backend owns grades, evidence, checkpoint status, and summaries. Ownership alone does not prevent forged scores. |
| Everything is stored in one document | Split growing histories into subcollections and keep a small dashboard summary. |
| Gemini computes readiness | Deterministic application code computes scores; Gemini explains and proposes content. |
| Public demo can call all AI endpoints | Use an isolated, short-lived demo session with a small server-enforced allowance and shared global limits. |
| Free tier guarantees continuous service | Check actual model access, quota, publishing eligibility, and service availability; provide honest curated fallback or unavailable states. |
| Any fallback returns accurate adaptive data | Curated fallback keeps specific flows usable; unknown answers and unavailable services remain explicitly labeled. |
| Marketing claims such as "+68% in six weeks" | Remove until supported by real measured outcomes. Label all seeded personas and charts as sample data. |
| Fixed production port 3000 | Bind to `0.0.0.0` using `process.env.PORT`, with `3000` only as a local default. |

---

## 3. Scope and Build Priorities

### P0 — Complete Core Loop
- **One Fully Authored Track**: Entry-Level Full-Stack Developer with 6 clearly defined competencies (`sql-data-modeling`, `api-design-validation`, `auth-security-boundaries`, `react-state-architecture`, `async-error-handling`, `testing-verification`).
- **Entry & Navigation**: Landing page (with honest positioning and sample labels), Google Sign-In via Firebase Auth, isolated 1-Click Judge Demo session, and responsive mobile drawer/bottom navigation.
- **Onboarding**: Target role selection, weekly study hours, 5-level labeled self-report (`Unfamiliar`, `Novice`, `Developing`, `Proficient`, `Confident`), and an 8-question diagnostic focused on 2–3 core competencies.
- **Focused Workspace Navigation**: `Overview`, `My Plan`, `Assessments`, `Evidence`, plus contextual `Mentor` & `Settings` drawers/views.
- **Dashboard (`Overview`)**: Lead with `"Continue your next task"`, display Role Assessment Progress (`Assessment score` + `Assessed coverage %`), Priority Gap, clickable score-to-evidence drilldowns, and separate Assessment History vs. Study Hours.
- **Weekly Roadmap (`My Plan`)**: Prerequisite-aware tasks with `"Why this task?"` explanations, estimated effort fit to ~80% of weekly hours, and explainable before/after roadmap revision comparison with explicit user acceptance.
- **Assessments & Practical Challenge (`Assessments`)**: Reviewed question bank for scored diagnostics/checkpoints (server-graded, answer keys never sent to client before submission) plus one complete Practical Challenge (API endpoint design with validation, authorization, and error handling) with explicit rubric evaluation.
- **Persistence & Resilience**: Server-authoritative state mutations, refresh recovery, labeled source badges (`Sample student`, `Curated demo`, `Live AI`), and distinct loading, saved, unsaved, quota-limited, and failed-save states.

### P1 — High-Value Extensions Included
- **Job Description Customization**: Paste a job description to extract quoted requirement evidence and weight the existing role template.
- **Contextual Mentor**: Bounded to the current task and recent evidence, with explicit AI data-use notice and honest unavailable state if live AI quota is exhausted.
- **Evidence Portfolio & Study Logs**: Exportable JSON/printable evidence portfolio and separate self-reported study hour logging.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Trust Boundary Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Browser Client (React 19 + TS)                        │
│                                                                              │
│  ┌──────────────────────────┐    ┌────────────────────────────────────────┐  │
│  │ Public & Auth Entry      │    │ Focused Student Workspace              │  │
│  │ • Landing Page (Honest)  │    │ • Overview ("Continue your next task") │  │
│  │ • Firebase Google Auth   │───▶│ • My Plan (Before/After Diff & Accept) │  │
│  │ • Isolated Demo Session  │    │ • Assessments (Quiz + Rubric Challenge)│  │
│  └──────────────────────────┘    │ • Evidence Trail & Contextual Mentor   │  │
│                                  └───────────────────┬────────────────────┘  │
└──────────────────────────────────────────────────────┼───────────────────────┘
                     Same-Origin REST API + Bearer ID Token / HttpOnly Demo Cookie
┌──────────────────────────────────────────────────────▼───────────────────────┐
│              Node.js + Express Backend (0.0.0.0 : process.env.PORT)          │
│                                                                              │
│  ┌───────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ Auth, Demo & Quota Middleware     │  │ Deterministic Domain Engines    │  │
│  │ • Verify Firebase ID Token        │  │ • Assessment Grader & Eligibility│ │
│  │ • Isolated Demo Session & Cookie  │  │ • Prerequisite Graph & Scheduler│  │
│  │ • Per-Session & Global AI Budget  │  │ • Roadmap Revision Diff Builder │  │
│  └─────────────────┬─────────────────┘  └────────────────┬────────────────┘  │
│                    ▼                                     ▼                   │
│  ┌───────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ Repository Layer                  │  │ Gemini Gateway (@google/genai)  │  │
│  │ • Firestore Subcollections        │  │ • Configurable GEMINI_MODEL     │  │
│  │ • Transactional Attempt Submit    │  │ • Structured Output & Circuit   │  │
│  │ • Isolated Demo Session Store     │  │   Breaker + Curated Fallbacks   │  │
│  └───────────────────────────────────┘  └─────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Transparent MVP Scoring & Evidence Policy

1. **Four Distinct Concepts in UI**:
   - **Self-reported familiarity**: 5-level onboarding input; never labeled verified.
   - **Assessment performance**: Server-computed score from eligible scored questions (`Score = 100 × correct / eligible questions` in a rolling window of up to 10 distinct question families). Requires `≥ 3` eligible distinct questions for a competency; below 3 displays `"Insufficient evidence"`.
   - **Practical evidence**: Submitted code/explanation evaluated against an explicit rubric (`Rubric criterion met / needs revision`), labeled with evaluator type (`Curated Rubric` or `AI Advisory Review`).
   - **Role coverage**: `assessed skill weights / all target skill weights`. Displayed side-by-side with assessment score (e.g., `"Assessment score 72/100 · Coverage 50%"`). Unassessed skills remain `Unassessed`, never `0%`.
2. **Idempotent Grading & Question Families**:
   - Repeated exposure to the same question family does not earn additional evidence.
   - Checkpoints require `4/5` (`80%`) to earn `"Quiz checkpoint passed"`.
   - Scores can increase or decrease based on new eligible evidence.

### Firestore Data Model (Split Subcollections)

| Path | Contents and Authority |
|---|---|
| `users/{uid}` | Profile, preferences, current goal ID; validated profile updates via API |
| `users/{uid}/goals/{goalId}` | Role template/version, weekly hours, target weights, active roadmap revision ID |
| `users/{uid}/skills/{skillId}` | Derived score, eligible question count, tier, last assessed timestamp; backend-only |
| `users/{uid}/assessments/{attemptId}` | Issued questions, version, state, private grading key (stripped before client response) |
| `users/{uid}/evidence/{eventId}` | Append-only assessment outcome or practical review with provenance |
| `users/{uid}/roadmaps/{revisionId}` | Immutable plan revision with parent revision ID and adaptation reasons |
| `users/{uid}/taskProgress/{taskId}` | Task completion and checkpoint status kept separate from immutable plan revisions |
| `users/{uid}/studyLogs/{logId}` | Self-reported study sessions (explicitly separated from mastery evidence) |
| `users/{uid}/mentorThreads/{threadId}/messages/{messageId}` | Bounded chat history |
| `users/{uid}/summaries/current` | Compact dashboard projection derived by backend |
| `demoSessions/{sessionId}/...` | Isolated sample student data, expiry, and live AI allowance counter |
| `usageBuckets/{bucketId}` | Server-maintained request allowance and quota tracking |

### API Contracts

- `POST /api/demo/session` — Issue short-lived server demo session with HttpOnly cookie, seeded sample student (*Alex Rivera — Entry-Level Full-Stack Candidate*), and 3 live AI generation credits.
- `GET /api/workspace` — Return sanitized dashboard summary, skills, active roadmap, task progress, and quota/source metadata for the authenticated user or active demo session.
- `PATCH /api/profile` — Update allowed profile fields and weekly study hours (triggers a deterministic roadmap revision proposal if capacity changes).
- `POST /api/onboarding/complete` — Save target role, weekly hours, and 5-level self-reports, and issue the initial diagnostic assessment.
- `POST /api/assessments` — Issue versioned diagnostic or checkpoint questions from the reviewed question bank (answer keys stripped).
- `POST /api/assessments/:id/submit` — Grade answers on the server idempotently, record an append-only `evidence` event, recompute competency score & coverage, and generate an explainable roadmap revision proposal if priorities shifted.
- `GET /api/assessments/:id/result` — Return graded attempt details, explanations, and evidence impact.
- `POST /api/challenges/:id/submit` — Evaluate practical challenge submission against the endpoint design rubric, record practical evidence, and optionally include labeled AI advisory feedback.
- `POST /api/roadmap/proposals` — Generate a prerequisite-aware roadmap revision proposal (with optional JD customization).
- `POST /api/roadmap/proposals/:id/accept` — Reject stale proposals and atomically set the new active roadmap revision while preserving `taskProgress`.
- `POST /api/tasks/:id/complete` — Toggle task effort completion without mutating assessment mastery scores.
- `POST /api/study-logs` — Record self-reported study hours.
- `POST /api/mentor/messages` — Context-bounded mentor response with quota check and honest fallback notice.
- `GET /api/evidence` & `GET /api/export` — Retrieve paginated evidence provenance or export the complete student evidence portfolio.
- `GET /api/health` — Lightweight service liveness check.
