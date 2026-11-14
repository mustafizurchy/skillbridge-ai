# Implementation checklist

Source of truth: [revised plan](source-plan.md), dated 14 November 2026, and [master prompt](source-master-prompt.md). Both supplied specifications are preserved for handoff. Focused navigation contains analyzer/analytics in Overview, the challenge in Assessments, and profile in Settings. No deployment or billable resources without approval.

| Phase | Changes and files | Validation / limitations |
| --- | --- | --- |
| 1 Architecture | Shared types/catalog, domain/repository/UI boundaries | Type checking passes; rubric documented |
| 2 Foundation | package/config files, server entry/app, Vite/Tailwind | Build, lint, health and startup pass |
| 3 Firebase/security | store adapters, token/CSRF middleware, Firebase client, rules | API isolation tests pass; live auth/rules/durability unverified |
| 4 Evidence | private question bank, grading/scoring engine, assessment UI | Domain/API tests pass; independent external question review remains |
| 5 Roadmap | prerequisite scheduler, proposals, acceptance, quoted job weighting | Ordering, capacity, stale acceptance and browser revision tests pass |
| 6 Frontend | src/pages and app shell, responsive styles and themes | Desktop reviewed; mobile navigation/overflow and failed-save tests pass |
| 7 Gemini | gateway, mentor route/view, quotas and schema validation | Mocked gateway tests pass; live model access unverified; dedicated task/project AI extensions incomplete |
| 8 Integration | same-origin API, session restore, export, evidence and revisions | Three browser workflows pass |
| 9 QA/security | unit/integration/e2e tests, dependency updates, bundle scan | 25 automated tests plus 3 browser tests pass; audit reports zero vulnerabilities |
| 10 Deployment prep | Dockerfile, production server, README/HANDOFF and docs | Built server deep links pass; container/import/deployment unverified |

Remaining acceptance gates: live Firebase and Firestore restart/concurrency/rules checks; live Gemini access/quota; dedicated Gemini task personalization and practical advisory reviews; container and AI Studio import; approved deployment; public-launch retention/deletion cleanup and distributed limiting. These gates prevent declaring the entire master specification complete. See [verification](verification.md) and [HANDOFF](../HANDOFF.md).
