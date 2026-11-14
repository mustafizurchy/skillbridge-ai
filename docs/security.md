# Security notes

## Implemented controls

- Firebase Admin token verification, with revoked-token checking; client user IDs are not accepted.
- Account-scoped repository keys on every protected API route; no public evidence or AI endpoint.
- Four-hour random demo cookies: HttpOnly, SameSite=Strict, Secure in production, path `/api`. Only hashes identify stored sessions. Export never includes raw cookies or API secrets.
- Exact configured Origin required for every mutation; JSON content-type required; demo mutations additionally require a session-derived CSRF token obtained through authenticated workspace access. No permissive CORS.
- Rate limits for API, demo creation and mentor. Atomic per-session/account and shared daily AI reservations in Firestore.
- Strict Zod request validation, 48 KB body limit, 2,000-character mentor input, bounded output and timeout, sanitized errors and correlation IDs.
- Private answer bank resides exclusively on the server. Issued questions omit keys; explanations appear only after submission. Submitted attempts are idempotent and question-family evidence is deduplicated.
- Deny-all direct Firestore browser rules; server uses Admin credentials and owns all mutations.
- Helmet headers and CSP; React text rendering (no injected HTML); no execution of submitted code; no model tools.
- Production rejects in-memory storage. Secret values are never printed, embedded in browser assets, or included in `.env.example`.

## Limitations and launch gates

HTTP rate-limit buckets are per-process; use an external distributed limiter/load-balancer policy before multi-instance public launch. AI spend is additionally bounded by the shared Firestore bucket across instances. Without trusted-proxy configuration, Cloud Run traffic can share an IP limiter bucket: conservative but unsuitable for high traffic. Configure an explicitly trusted proxy topology, not unrestricted `trust proxy`, during deployment review.

Demo expiration denies access but does not recursively delete Firestore subcollections. Configure scheduled Admin cleanup with a retention policy before a public launch. Numeric expiry is not a Firestore TTL field. Account deletion/export policy and operator contact must be finalized. Real-user AI allowance is intentionally thirty lifetime attempts for the hackathon; add an explicit refill policy rather than silently resetting it.

Prompt instructions are not an absolute prompt-injection defense. The important boundary is that AI has no authority to grade, execute code, fetch private records, or change state. Displayed advice can still be wrong. Static practical checks establish term coverage only, not technical correctness.

Question keys are in source for maintainability, so a public source repository permits answer lookup. Do not represent this as a proctored or high-stakes assessment. Expand and independently review the authored bank before research or certification claims.

Firestore rules and actual SDK credentials have not been exercised against an emulator/live project in this environment. The API authorization tests inject a verifier; they are not evidence that Google sign-in has been configured. The installed dependency audit reports zero known vulnerabilities after patched version updates; this does not replace ongoing security maintenance.
