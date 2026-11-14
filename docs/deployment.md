# Deployment preparation

The source repository is https://github.com/mustafizurchy/skillbridge-ai (private). No cloud project, billable resource, deployment, or application publication has been created. Obtain approval before performing these steps against external services.

## Verified platform documentation (14 November 2026)

Google documents full-stack React/Node web apps, server-side secrets, and **Add files → Import from GitHub** in [AI Studio Build](https://aistudio.google.com/docs/aistudio-build-mode). Its [publishing documentation](https://aistudio.google.com/docs/aistudio-deploying) describes managed Cloud Run publishing with account-dependent Starter Tier or paid-project requirements. These capabilities do not prove this repository imports unchanged. Import and hosted authentication must be tested in the user's actual account.

The [official Google Gen AI SDK](https://googleapis.github.io/js-genai/index.html) documents server SDK usage; [structured outputs](https://aistudio.google.com/docs/structured-output) describe JSON-schema responses. Model availability, schema support, quota and billing must be confirmed for the selected `GEMINI_MODEL`. No default model is hardcoded.

## Local production build

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
$env:NODE_ENV = 'production'
$env:STORAGE = 'firestore'
$env:APP_ORIGIN = 'http://localhost:3000'
$env:FIREBASE_PROJECT_ID = 'your-approved-project'
npm start
```

Set Firebase web configuration **before building**; `VITE_*` values are build-time public configuration. Provide Application Default Credentials to the backend using a supported local login or runtime identity. Do not store permanent records on the container filesystem.

The Express process binds `0.0.0.0` and reads `PORT`; built SPA assets and deep links are served by the same process. `/api/health` is liveness only, not proof of Firestore or AI readiness. SIGTERM closes the server with a ten-second shutdown bound.

## Standard Cloud Run path

1. Select an approved Google Cloud/Firebase project. Confirm service availability, region, billing requirements, authorized domains and quotas. Do not enable paid services automatically.
2. Register Firebase web configuration and enable Google Sign-In. Create Firestore and deploy `firestore.rules`/`firestore.indexes.json` using the approved project. Rules intentionally deny browser access: this application uses the authenticated API.
3. Use a dedicated Cloud Run service account with only required data access. Store Gemini credentials in Secret Manager and grant only that service account access. No downloaded Admin key is needed on Cloud Run.
4. Build the provided Dockerfile. Pass the three `VITE_FIREBASE_*` build arguments from public web-app configuration. Example: `docker build --build-arg VITE_FIREBASE_PROJECT_ID=... --build-arg VITE_FIREBASE_API_KEY=... --build-arg VITE_FIREBASE_AUTH_DOMAIN=... -t skillbridge-ai .` No Gemini secret belongs in the image build.
5. Deploy that image to Cloud Run only after approval, setting `STORAGE=firestore`, `FIREBASE_PROJECT_ID`, `APP_ORIGIN` to the exact HTTPS service/domain origin, `GEMINI_MODEL`, and a secret reference for `GEMINI_API_KEY`. Cloud Run supplies `PORT`. Set a conservative maximum instance count and external rate-limiting policy.
6. Add the deployed host to Firebase Auth authorized domains. Confirm Google popup sign-in and restoration in the actual hosted origin. Inspect CSP failures if the provider requires additional documented endpoints; do not broadly disable CSP.
7. Set Cloud Billing budgets/alerts, monitor provider quotas and usage, and keep the application's global AI limit conservative. Budget alerts alone are not hard spending caps.

## AI Studio handoff

Transfer this project directory as the repository root, excluding `.env`, caches, node_modules and generated reports. Import from GitHub if the user's Build interface supports it. Retain `npm run build` and `npm start`, server-side secrets, the Firebase identity flow and the same-origin API contract. Inspect preview port/start commands and exact `APP_ORIGIN` before testing. Deploying a frontend-only export will not provide the required learning engine.

The runtime may need environment/startup adjustments; these remain unverified. If direct Build import cannot accommodate this app, use the standard Docker/Cloud Run path above. Starter Tier eligibility is account-specific and must not be assumed to include all needed services.

## Acceptance checks before public use

- Live Firebase Google sign-in, logout, revocation, authorized domains and cross-account isolation.
- Firestore emulator rules tests and real database transaction concurrency; restart the server and verify persisted evidence.
- Gemini live success, unavailable model, quota exhaustion and timeout; no key in built assets.
- HTTPS Secure demo cookies and CSRF rejection; correct external rate limiting under Cloud Run proxy topology.
- Production health, SPA deep links, assets and protected APIs; responsive browser judge flow.
- Configure expired-session recursive cleanup, retention, operator contact and deletion handling.

Container execution and actual cloud deployment remain unverified in this workspace.
