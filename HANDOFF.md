# SkillBridge AI handoff

## Current state

The project is implemented locally in this directory against the supplied master prompt and revised `implementation_plan (1).md` dated 14 November 2026. Source repository: https://github.com/mustafizurchy/skillbridge-ai (private). No deployment, paid service, or credentials were created. Preserve the original specification files in the parent workspace.

Implemented: React/Vite/TypeScript/Tailwind UI; focused responsive navigation; isolated judge demo; Firebase Google Auth integration; onboarding; server-issued/graded diagnostics and checkpoints; distinct-family evidence scoring and coverage; prerequisite-aware plans; explicit stale-safe version acceptance/rejection; deterministic quoted job-description weighting; static secure-endpoint rubric; portfolio export/print; study logs; settings/themes; contextual Gemini mentor with quota reservations; Firestore repository/rules; Node production server; Dockerfile; tests and documentation.

## Verification

Final validation passed 25 domain/API/mocked-Gemini tests, all 3 Playwright Edge flows, strict TypeScript, lint, and production build. The built server started and returned HTTP 200 for health, root and SPA deep links. Exact results and limits are recorded in `docs/verification.md`. Dependency installation with patched Firebase Admin, Vitest, grpc-js and minimatch reported zero vulnerabilities.

Live Firebase authentication, actual Firestore durability/concurrency/rules, live Gemini generation, Docker execution, Google AI Studio import, and Cloud Run publishing are not verified. No Java installation was available for Firebase Emulator Suite. API auth tests use an injected verifier and AI tests use a mocked provider; do not describe them as live service tests.

## Important files and invariants

- `server/domain/engine.ts`: only authoritative score and plan logic. First exposure to a family counts once, minimum 3 families, latest 10-family window, checkpoint 4/5.
- `server/domain/questions.ts`: private 36-question bank. Keep keys out of public question projection and client imports.
- `server/repositories/store.ts`: workspace-scoped memory and Firestore adapters. Mutations are synchronous domain callbacks within transactions; external calls must stay outside them.
- `server/app.ts`: verified identity, origin, CSRF, validation, rate limits, endpoints and production SPA serving.
- `server/services/gemini.ts`: environment-selected model; advisory JSON output; no authority to grade or mutate progress.
- `src/pages`: working product screens. Overview contains analyzer/analytics; Assessments contains practical challenge.
- `docs/api.md`, `docs/architecture.md`, `docs/security.md`, `docs/deployment.md`, `docs/judge-demo.md`: contracts, boundaries and operations.

## Setup and permission constraints

Run `npm ci`, copy `.env.example` to `.env`, then `npm run dev`. Browse `http://localhost:5173`, matching `APP_ORIGIN`. Memory mode needs no secrets, but loses data on restart and is disallowed in production. Production uses Firebase project ID and Application Default Credentials/service identity. Public Firebase web configuration must be available at Vite build time. Gemini key is server-only and `GEMINI_MODEL` has no default.

Windows sandbox prevented `tsx` from reading OS user info. Browser tests passed with the explicitly approved unsandboxed npm test command. Use the proper approval flow if this environment restriction recurs. Do not patch around it.

## Remaining work before full definition of done

1. Configure an approved Firebase project and run Google sign-in, revocation, emulator rules, concurrent transaction, cross-user access and server-restart durability checks.
2. Configure a valid Gemini key/model and verify access, model schema support, live failures and quota behavior. No free-tier or billing assumption is safe.
3. Run the container, import into the user's AI Studio account and validate startup/environment compatibility; deploy only after explicit approval.
4. Replace full-history workspace reads with bounded projections for larger histories. HTTP rate limits are in-process; configure trusted proxy/distributed limits for multi-instance hosting.
5. Add recursive expiry cleanup, user deletion UX, operator contact and a retention policy before public launch.
6. Add independently reviewed question families. The finite bank intentionally cannot manufacture evidence from repeated families. Static practical term checks are limited and must stay clearly labeled.
7. Gemini task personalization, dedicated AI roadmap explanations and advisory practical feedback remain extensions. Existing deterministic explanations and mentor are real, but do not claim every requested AI feature is implemented.

No educational outcome, certification, hiring probability, adoption metric or external test success is asserted.
