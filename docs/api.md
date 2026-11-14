# REST API

All successful responses are `{ok:true,data:...}`. Domain/validation errors return `{ok:false,error:{code,message,requestId}}`. Status codes include 400 validation, 401 identity/session, 403 origin/CSRF/access, 404 scoped lookup, 409 stale revision, 429 quota and 503 AI unavailable. Generic HTTP rate-limiter responses may be plain text; the client safely handles non-JSON failure responses.

Authenticated real users send `Authorization: Bearer <Firebase-ID-token>`. Demo users use the HttpOnly cookie plus `X-CSRF-Token` returned by `GET /api/workspace`. All POST/PATCH requests require the exact `APP_ORIGIN` in `Origin` and `Content-Type: application/json`. The browser sets Origin automatically.

| Route                                    | Request / result                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `GET /api/health`                        | Public liveness, no database/AI call                                                                               |
| `POST /api/demo/session`                 | `{}`; creates isolated fictional workspace and cookie                                                              |
| `GET /api/workspace`                     | Profile, score/coverage, history, active/proposed plans, session metadata and CSRF                                 |
| `PATCH /api/profile`                     | Allowlisted name, context, weeklyHours (1–40), preferences, selfReport (1–5); capacity/preferences propose changes |
| `POST /api/onboarding/complete`          | Complete profile; returns issued 8-question diagnostic                                                             |
| `POST /api/assessments`                  | `{kind:'diagnostic'                                                                                                | 'checkpoint',skill?:SkillId}`; reuses unfinished matching attempt |
| `POST /api/assessments/:id/submit`       | `{answers:number[]}`; zero-based options, complete array required; idempotent result                               |
| `GET /api/assessments/:id/result`        | Submitted attempt, explanations, eligibility and score                                                             |
| `POST /api/challenges/secure-api/submit` | validation, authentication, authorization, errors, testing strings (20–2000 chars each); static rubric record      |
| `POST /api/roadmap/proposals`            | `{}` for evidence-based refresh, or `{jobDescription:string}` (20–12000 chars) for quoted requirement weights      |
| `POST /api/roadmap/proposals/:id/accept` | `{}`; transactional acceptance, 409 for stale proposal                                                             |
| `POST /api/roadmap/proposals/:id/reject` | `{}`; keep current plan                                                                                            |
| `POST /api/tasks/:id/complete`           | `{complete:boolean}`; effort only                                                                                  |
| `POST /api/study-logs`                   | `{hours:number,note:string}`; positive hours up to 24, note up to 300 chars                                        |
| `POST /api/mentor/messages`              | `{message:string}`; 1–2000 chars, bounded live AI or explicit failure                                              |
| `GET /api/evidence?offset=0`             | Up to 20 evidence events and next offset                                                                           |
| `GET /api/export`                        | Complete JSON portfolio with Content-Disposition attachment                                                        |
| `POST /api/demo/reset`                   | `{}`; demo only, quota and expiry preserved                                                                        |
| `POST /api/session/logout`               | `{}`; clears demo cookie; frontend also signs out Firebase                                                         |

Scores and answer keys are not accepted as input. Every attempt, proposal and task belongs to the verified current workspace. Unsupported fields are rejected for assessment, profile and other strict-schema payloads.
