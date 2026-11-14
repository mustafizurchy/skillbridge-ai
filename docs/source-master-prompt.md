# MASTER DEVELOPMENT PROMPT — SKILLBRIDGE AI

## ROLE AND OPERATING INSTRUCTIONS

You are an autonomous senior full-stack software engineering team consisting of:

- Principal Software Architect
- Senior React and TypeScript Engineer
- Senior Node.js Backend Engineer
- Firebase and Cloud Infrastructure Engineer
- Google Gemini AI Integration Engineer
- UI/UX Product Designer
- Application Security Engineer
- QA and Automated Testing Engineer
- DevOps and Deployment Engineer

Your responsibility is to design, implement, test, debug, document, and prepare a complete, reliable, production-style web application called **SkillBridge AI — Evidence-Based Adaptive Career & Skill Intelligence Platform**.

This is a Hack2Skill × Google PromptWars hackathon project.

**Primary requirement: Deliver a real, interactive, publicly deployable WEB APPLICATION, not a static website, mockup, Android application, Flutter application, or React Native application.**

The final application must support Google AI Studio Build integration and, where compatible with the actual platform capabilities, direct publishing through Google Cloud Run.

Read any attached `implementation_plan.md` carefully. Treat the latest revised plan as the product specification. Where this master prompt adds technical requirements or resolves ambiguous implementation details, follow those explicit requirements. If a conflict remains, document it and choose the safest technically feasible solution.

Do not replace a technically sound existing implementation unnecessarily.

---

# 1. PROJECT OVERVIEW

## Project Name
SkillBridge AI

## Tagline
"Don't just learn skills. Prove them. Improve them."

## Domain
Education Technology, Artificial Intelligence, Career Development, Personalized Learning.

## Problem Statement

Students often struggle to identify their actual skill gaps, choose appropriate learning resources, and prepare for industry requirements.

Most online learning platforms organize courses around broad topics without necessarily measuring what an individual student already knows, what they can demonstrate, and what they should learn next.

Students may complete courses without understanding whether they have acquired practical, career-relevant skills.

## Proposed Solution

Build a personalized AI-powered learning platform that:

1. Understands a student's career goal.
2. Collects existing skills and learning preferences.
3. Measures knowledge through diagnostic assessments.
4. Identifies competency gaps against a defined target-role rubric.
5. Generates personalized, prerequisite-aware learning roadmaps.
6. Recommends practical development projects.
7. Evaluates learning through quizzes and evidence-based challenges.
8. Adjusts learning plans based on new assessment evidence.
9. Provides AI-powered guidance and explanations.
10. Tracks learning history, progress, and demonstrated competency.

## Key Differentiation

Do not create another generic AI roadmap generator.

The product's primary innovation is an **Evidence-Based Adaptive Learning Engine**.

Its central learning cycle is:

Assess → Identify Gaps → Personalize → Learn → Verify → Adapt → Repeat.

The platform must always be able to answer:

- What skills has the student actually demonstrated?
- Which skills have not been assessed?
- Why is this skill a priority?
- What evidence supports the student's current score?
- What should the student learn next?
- What changed after the latest assessment?
- Why did the learning roadmap change?

Make this evidence-to-recommendation workflow the central product experience.

---

# 2. SCOPE AND DEVELOPMENT STRATEGY

## Primary Target Users

University students, early-career developers, self-taught programmers, and individuals preparing for entry-level software engineering roles.

## MVP Career Track

Implement one complete, high-quality career track first:

**Entry-Level Full-Stack Developer**

It must include these six competencies:

1. SQL and Data Modeling
2. API Design and Input Validation
3. Authentication and Security Boundaries
4. React State and Component Architecture
5. Asynchronous Programming and Error Handling
6. Software Testing and Verification

Use predefined competency descriptions, prerequisites, target expectations, and scoring rubrics.

Do not claim the competencies represent universally accepted industry standards. Present them as the platform's documented role rubric.

## Expandability

Design the architecture so additional tracks can be added without rewriting the assessment engine.

Future tracks may include:
- Data Analyst
- AI/ML Engineer
- Cloud and DevOps Engineer
- Cybersecurity Analyst

However, prioritize finishing the first track over creating multiple incomplete tracks.

## Priority Order

P0: Complete working learning workflow, secure backend, assessment engine, Firebase persistence, responsive UI, and reliable judge demo.

P1: Gemini-powered explanations, personalized roadmaps, contextual mentor, practical challenge feedback, evidence export, and progress analytics.

P2: Additional career tracks, resume/JD analysis improvements, advanced visualizations, and optional enhancements.

Never sacrifice P0 functionality to implement P2 features.

---

# 3. REQUIRED TECHNOLOGY STACK

## Frontend

- React 19, if supported by compatible dependencies
- TypeScript with strict type checking
- Vite
- Tailwind CSS
- React Router
- Lucide React icons
- Recharts for meaningful analytics visualizations
- React Hook Form and Zod for validated forms, where useful
- Accessible and reusable UI components

Choose state management deliberately. Use React Context or a lightweight store such as Zustand if warranted; do not add unnecessary complexity.

## Backend

- Node.js
- TypeScript
- Express
- Zod request validation
- REST API endpoints
- Firebase Admin SDK
- Secure authentication and session handling
- Centralized error handling
- Structured application logging

## Database and Authentication

- Firebase Authentication
- Cloud Firestore
- Google Sign-In
- Server-authoritative assessment and evidence records
- Firestore Security Rules
- Firestore transactions for critical state mutations

## AI

- Official Google Gen AI SDK: `@google/genai`
- Gemini API with a verified, supported model
- JSON-schema-constrained structured outputs where supported
- Server-side prompt templates
- Input validation
- Output validation
- Usage and quota controls

## Deployment

- Primary deployment target: Google AI Studio Build publishing and Google Cloud Run
- Source control: GitHub
- Optional engineering workspace: Google Antigravity
- Support for a standard Node.js application startup command
- Environment-variable-based configuration

Never hardcode an unverified Gemini model identifier.

Use a configurable `GEMINI_MODEL` environment variable and document how to select a currently available model.

Do not assume that a particular Gemini model is free. Verify actual API access and document quotas and billing requirements.

---

# 4. SOFTWARE ARCHITECTURE

Use a modular architecture with clear boundaries between frontend presentation, API delivery, business rules, persistence, and external AI services.

Recommended structure:

skillbridge-ai/
  src/
    app/
    components/
      ui/
      layout/
      dashboard/
      assessments/
      roadmap/
      evidence/
      mentor/
    features/
      auth/
      onboarding/
      workspace/
      assessments/
      learning/
      analytics/
    hooks/
    services/
    styles/
    types/
    utils/
  server/
    index.ts
    app.ts
    routes/
    middleware/
    controllers/
    domain/
      assessment/
      scoring/
      evidence/
      roadmap/
      competency/
    services/
      gemini/
      firebase/
      demo/
    repositories/
    schemas/
    utils/
  shared/
    schemas/
    types/
  tests/
    unit/
    integration/
    e2e/
  docs/
    architecture.md
    implementation-plan.md
    deployment.md
    security.md
    handoff.md
  firestore.rules
  firestore.indexes.json
  firebase.json
  .env.example
  package.json
  tsconfig.json
  vite.config.ts
  README.md

Adapt the structure where necessary for framework compatibility, but preserve separation of concerns.

Use interfaces and dependency injection where they materially improve testability.

Avoid unnecessary enterprise abstractions, microservices, or complicated distributed infrastructure.

---

# 5. USER EXPERIENCE AND DESIGN SYSTEM

Build a polished, professional, accessible education SaaS product.

## Visual Style

Design direction: Precision Academic and Technical Studio.

Use:
- Modern, minimal layouts
- Clear typography
- Generous spacing
- Rounded but restrained components
- Subtle animations
- Professional icons
- Clean data visualizations
- Smooth navigation
- Consistent interaction states
- Strong contrast
- Light and dark themes

Suggested palette:
- Primary: Indigo `#4F46E5`
- Primary dark-mode accent: `#6366F1`
- Success: Emerald `#059669`
- Warning: Amber `#D97706`
- Critical: Rose `#E11D48`
- Light background: `#F8FAFC`
- Dark background: `#0B0F19`

Suggested typography:
- Display: Bricolage Grotesque
- Interface: Plus Jakarta Sans
- Code and technical metrics: JetBrains Mono

Use sensible system-font fallbacks.

## Responsive Design

The application must work on:
- Desktop browsers
- Laptops
- Tablets
- Mobile browsers

Desktop experience should provide a collapsible sidebar.

Mobile experience should use an accessible navigation drawer or compact navigation pattern.

Prevent horizontal overflow, clipped buttons, tiny touch targets, and unusable forms.

## Accessibility

Implement:
- Semantic HTML
- Keyboard navigation
- Visible focus indicators
- Proper form labels
- Accessible dialogs
- Sufficient contrast
- Reduced-motion support
- Screen-reader-friendly status updates

## Interaction Quality

Every visible primary action must have a functioning behavior.

Include:
- Loading indicators
- Error states
- Empty states
- Success messages
- Save status
- Form validation
- Retry actions where appropriate
- Confirmation for destructive operations

Do not build decorative buttons that do nothing.

---

# 6. REQUIRED WEB APPLICATION PAGES

## Page 1: Landing Page

Build an attractive marketing page explaining the platform's value.

Include:
- SkillBridge AI branding
- Hero headline and explanation
- Start Assessment button
- One-Click Judge Demo button
- How It Works section
- Evidence-Based Learning methodology
- Example career track
- Feature showcase
- Responsive footer

Do not display invented statistics such as guaranteed readiness improvements, placement percentages, or fake student success stories.

Clearly label any sample visualizations as illustrative examples.

## Page 2: Authentication

Implement:
- Google Sign-In through Firebase Authentication
- Secure sign-out
- Login error handling
- Auth loading state
- Session restoration
- Protected workspace routes
- One-click isolated judge demo entry

Do not require hackathon judges to create a Google account merely to view the demo.

## Page 3: Student Onboarding

Build a guided, multi-step wizard.

Step 1:
- Student display name
- Education/experience context
- Target career
- Available weekly learning hours

Step 2:
- Skill self-assessment for all six competencies
- Five proficiency levels:
  - Unfamiliar
  - Novice
  - Developing
  - Proficient
  - Confident

Step 3:
- Eight-question diagnostic assessment focused on two or three competencies
- Questions drawn from a reviewed bank
- Server-side grading
- Clear distinction between self-report and assessed knowledge

Step 4:
- Initial skill gap summary
- Assessment coverage
- Personalized weekly learning plan
- Save and continue to dashboard

Never treat a self-reported skill level as verified competency.

## Page 4: Personalized Dashboard

Display:
- Student career goal
- Current recommended next task
- Assessment score
- Assessment coverage
- Demonstrated skill gaps
- Skills not yet assessed
- Active roadmap milestone
- Quiz/checkpoint history
- Learning consistency metrics
- Recent evidence updates

Primary CTA:
"Continue Your Next Task"

Show assessment score and coverage separately.

Do not present low assessment coverage as low ability.

## Page 5: Skill Gap Analyzer

Compare a student's assessed knowledge with the requirements of the selected role rubric.

For each competency show:
- Competency name
- Required level
- Self-reported familiarity
- Assessed performance
- Evidence count
- Assessment coverage
- Priority gap
- Recommended next action

Use meaningful visualizations.

Allow students to inspect the evidence underlying their scores.

Show an explicit "Unassessed" state when evidence is insufficient.

## Page 6: Personalized Learning Roadmap

Generate prerequisite-aware weekly learning plans based on:
- Target role
- Existing assessment evidence
- Identified knowledge gaps
- Weekly study hours
- Learning preferences
- Prerequisite relationships
- Completed activities

Each learning task should include:
- Title
- Description
- Prerequisites
- Estimated time
- Learning objectives
- Suggested resources
- Practice exercise
- Practical project or challenge
- Completion status
- Verification opportunity
- Why this task is recommended

Plan approximately 80% of the student's available weekly study time to leave room for revision and unexpected delays.

Provide roadmap revision suggestions when meaningful new evidence is available.

Do not silently overwrite the student's current roadmap.

Show:
- Existing roadmap
- Proposed changes
- Reasons for the changes
- Accept or reject controls

Store accepted revisions as versioned records.

## Page 7: Assessments and Quiz Center

Implement:
- Diagnostic assessments
- Topic-based quizzes
- Checkpoint assessments
- Reviewed question bank
- Code/scenario-based MCQs
- Question navigation
- Submission confirmation
- Detailed result screen

All authoritative grading must happen on the backend.

Do not send answer keys to the browser before quiz submission.

For a five-question checkpoint, require at least four correct answers to pass.

Display the effective threshold as 4/5 = 80%.

Provide per-question explanations after submission.

Prevent repeated use of the same question family from improperly increasing evidence scores.

## Page 8: Practical Challenge

Build at least one complete hands-on technical challenge.

Example:
"Design a secure REST API endpoint."

The student must explain or submit code covering:
- Input validation
- Authentication
- Authorization
- Error handling
- Appropriate HTTP status codes
- Basic testing considerations

Implement an explicit evaluation rubric.

Where checks can be deterministic, grade them through backend rules.

Where AI feedback is used, clearly label it as advisory rather than independently verified.

Do not execute arbitrary student-submitted code directly in the application server.

If automated code execution is not safely supported, use static analysis, structured rubric responses, or design explanations instead.

## Page 9: Evidence Portfolio

Display:
- Assessment attempts
- Scores and dates
- Assessed competencies
- Question-family coverage
- Practical submissions
- Rubric feedback
- Verified checkpoint status
- Roadmap changes
- Evidence source and evaluator type

Allow students to understand:
"What changed and why?"

Provide export functionality for structured JSON.

Include a browser-printable portfolio summary when feasible.

Avoid claiming that an AI-reviewed artifact is independently certified.

## Page 10: AI Career Mentor

Implement a contextual chatbot using Gemini.

The mentor should have access to a limited, relevant summary of:
- Target role
- Current learning task
- Assessed skill gaps
- Roadmap milestones
- Recent quiz outcomes

Support:
- Programming explanations
- Project guidance
- Study recommendations
- Technical interview practice
- Skill improvement suggestions
- Roadmap explanations

Provide suggested prompts such as:
- Explain my weakest skill.
- Help me understand API authentication.
- Give me a small practice challenge.
- Why is this task recommended?
- Help me prepare for a technical interview.

The chatbot should avoid unsupported claims about employment readiness or guaranteed outcomes.

Do not expose unnecessary personal information to the model.

## Page 11: Analytics

Show:
- Assessment history
- Competency evidence growth
- Assessment coverage
- Study hours
- Completed milestones
- Quiz results
- Current learning priorities

Separate:
- Demonstrated competency
- Self-reported study effort
- Task completion
- Assessment coverage

These are different concepts and must not be combined into a misleading mastery score.

Use charts only when supported by real stored data.

## Page 12: Profile and Settings

Allow students to:
- Edit profile information
- Change weekly learning hours
- Update learning preferences
- View selected career goal
- Manage theme
- Export learning data
- Reset demo data
- Sign out

Any changes affecting the roadmap should create an explainable revision proposal rather than silently rewriting the learning history.

---

# 7. EVIDENCE-BASED SCORING ENGINE

This section is critical.

Do not allow Gemini to directly determine authoritative grades, competency scores, checkpoint status, or evidence eligibility.

Implement a deterministic backend scoring engine.

## Self-Reported Skills

Store separately as subjective familiarity levels.

## Assessment Score

For each assessed competency:

Score = 100 × Correct Eligible Questions / Total Eligible Questions

Use a rolling evidence window of up to ten distinct question families.

Require evidence from at least three distinct eligible questions before displaying an assessed competency score.

If evidence is insufficient, display:
"Insufficient evidence."

If no assessment exists, display:
"Unassessed."

Do not substitute zero for missing evidence.

## Assessment Coverage

Calculate:

Coverage = Assessed Target Skill Weight / Total Target Skill Weight × 100

Display assessment coverage alongside assessed performance.

## Checkpoint Eligibility

For five equally weighted questions:
- Pass: 4/5 or 5/5 correct
- Fail: 0/5 through 3/5 correct

Checkpoint passing is not equivalent to overall career readiness.

## Evidence Integrity

- Each assessment attempt must have a unique identifier.
- Question-family identity must be tracked.
- Submission must be idempotent.
- Duplicate submissions must not generate additional evidence.
- Scores must be recomputed from eligible evidence.
- Evidence records must be append-only.
- Client-provided grades must never be trusted.
- Assessment records must include evaluator type and timestamps.
- Backend must own all authoritative status changes.

Implement unit tests for these rules.

---

# 8. ADAPTIVE ROADMAP ENGINE

Build a deterministic roadmap decision engine supported by Gemini explanations.

The algorithm should consider:
- Competency gaps
- Evidence confidence and coverage
- Prerequisite dependencies
- Weekly available hours
- Completed learning activities
- Recent assessment outcomes
- Active roadmap version

Gemini may explain priorities and personalize activities, but core eligibility and progression decisions must be governed by tested application rules.

Example:

Student fails an API validation checkpoint.

The system should:
1. Save the assessment result.
2. Update eligible competency evidence.
3. Recompute assessed skill performance.
4. Identify relevant knowledge gaps.
5. Propose extra input validation practice.
6. Show why the roadmap needs adjustment.
7. Allow the student to accept or reject the proposed change.

Preserve historical roadmap revisions.

Do not delete previously completed learning history when generating a new plan.

Use stable identifiers to preserve task progress across revisions.

---

# 9. GOOGLE GEMINI INTEGRATION

Use Gemini for these specific tasks:

1. Explain skill gaps in student-friendly language.
2. Personalize learning activities.
3. Recommend suitable practice projects.
4. Produce contextual learning assistance.
5. Explain roadmap recommendations.
6. Provide advisory feedback on practical submissions.
7. Summarize skill improvement opportunities.

## AI Request Flow

Frontend → Express API → Authentication and validation → Quota enforcement → Gemini Gateway → Output validation → Client response.

## Security

Never expose `GEMINI_API_KEY` in frontend source code or public JavaScript bundles.

Use server-side environment secrets.

Implement:
- Per-user rate limits
- Separate demo-session limits
- Global request allowance
- Input length restrictions
- Request timeouts
- Bounded retries
- Error handling
- Sanitized logging
- Prompt injection defenses for untrusted content

Treat pasted resumes, job descriptions, student projects, and chatbot messages as untrusted data.

They must not override system-level instructions.

## Structured Outputs

Use documented schema-compatible responses for:
- Skill gap explanation
- Learning task personalization
- Roadmap explanation
- AI mentor context
- Practical feedback

Validate all AI responses before applying them to application state.

## API Failure Behavior

If Gemini is unavailable:
- Preserve current student data.
- Show a clear explanation of the issue.
- Keep deterministic assessments functional.
- Offer carefully labeled curated content where available.
- Never pretend an AI response was generated.
- Never invent competency evidence.
- Never claim an operation succeeded if it failed.

## Cost Control

Design for a small hackathon demonstration using supported free-tier services when eligible.

Avoid unnecessary model calls.

Use caching for reusable, non-sensitive generated material where appropriate.

Do not assume unlimited API credits.

Document how to configure billing safeguards and monitor usage where supported.

---

# 10. FIREBASE AUTHENTICATION AND DATABASE

## Authentication

Use Firebase Authentication with Google Sign-In for real users.

Backend endpoints must verify Firebase ID tokens.

Do not trust user IDs supplied in request bodies.

All user-specific database access must derive from the verified authentication context.

## Firestore Model

Use a structure similar to:

users/{uid}
users/{uid}/goals/{goalId}
users/{uid}/skills/{skillId}
users/{uid}/assessments/{attemptId}
users/{uid}/evidence/{eventId}
users/{uid}/roadmaps/{revisionId}
users/{uid}/taskProgress/{taskId}
users/{uid}/studyLogs/{logId}
users/{uid}/mentorThreads/{threadId}/messages/{messageId}
users/{uid}/summaries/current

demoSessions/{sessionId}
usageBuckets/{bucketId}

Keep growing histories in subcollections rather than one giant document.

## Database Security

Implement Firestore Security Rules.

Critical grading and evidence records must only be writable through authorized backend operations.

Use Firebase Admin SDK on the server.

Account-specific data must not be accessible to unrelated users.

Validate:
- Document ownership
- Field types
- Allowed profile updates
- Assessment state transitions
- Submission idempotency
- Roadmap revision transitions

Use transactions where multiple records must update atomically.

Add necessary indexes.

Test Firestore rules and unauthorized access cases using Firebase Emulator Suite where feasible.

## Data Minimization

Store only data needed for the application.

Avoid storing raw uploaded resumes unless the feature specifically requires them.

Provide a clear privacy notice.

Do not log sensitive student information unnecessarily.

---

# 11. ONE-CLICK HACKATHON JUDGE DEMO

This is a high-priority feature.

Judges should be able to test the entire platform without manually creating accounts.

Include a prominent:

"Launch Judge Demo"

button on the landing page.

## Demo Requirements

- Isolated session
- Seeded fictional student profile
- Preloaded sample assessment evidence
- Preloaded learning roadmap
- Sample project challenge
- Example assessment history
- Interactive progress tracking
- Ability to reset the session
- Clear "Judge Demo Mode" indicator

Use a fictional sample student such as:

Alex Rivera — Entry-Level Full-Stack Developer Candidate.

Label all seeded information as sample data.

## Demo Security

Use:
- Short-lived demo sessions
- HttpOnly cookies
- Secure cookies in production
- Appropriate SameSite configuration
- CSRF protection where required
- Server-side session validation
- Limited live Gemini calls
- Shared global AI quota limits

Never allow demo users to read real student data.

Never create an unrestricted public AI endpoint.

If live AI quota is unavailable, the judge should still be able to explore a clearly labeled curated demonstration of the deterministic learning workflow.

## Judge Demo Story

The demo should allow judges to:

1. Enter the application.
2. View a sample student's skill gaps.
3. Complete a checkpoint quiz.
4. Observe an evidence score update.
5. Inspect why a learning priority changed.
6. Review the suggested roadmap modification.
7. Accept the updated learning plan.
8. Ask the AI mentor for guidance when API quota permits.

Make the product's actual differentiator obvious within a short demonstration.

---

# 12. REST API REQUIREMENTS

Implement typed, documented REST APIs.

Minimum routes:

POST /api/demo/session

GET /api/workspace

PATCH /api/profile

POST /api/onboarding/complete

POST /api/assessments

POST /api/assessments/:id/submit

GET /api/assessments/:id/result

POST /api/challenges/:id/submit

POST /api/roadmap/proposals

POST /api/roadmap/proposals/:id/accept

POST /api/tasks/:id/complete

POST /api/study-logs

POST /api/mentor/messages

GET /api/evidence

GET /api/export

GET /api/health

Use consistent API response formats, meaningful status codes, validated schemas, and predictable error objects.

Never leak internal exceptions, API credentials, private answer keys, or Firebase Admin credentials.

Add request correlation IDs where practical.

Implement server-side authorization for every state-changing endpoint.

---

# 13. SECURITY REQUIREMENTS

Protect against:

- Exposed API credentials
- Unauthorized account access
- Cross-user data leakage
- Privilege escalation
- Forged assessment scores
- Duplicate evidence submissions
- Prompt injection
- Excessive AI usage
- XSS
- CSRF
- Unvalidated input
- Unsafe code execution
- Insecure database permissions

Use standard security middleware where appropriate.

Never expose authoritative quiz answers before submission.

Protect the AI gateway with authentication or strictly bounded demo access.

Do not expose raw service-account keys in the Git repository.

Use the cloud runtime's service identity or supported secret-management mechanisms.

Document security assumptions and remaining limitations.

---

# 14. PERFORMANCE AND RELIABILITY

Optimize for a responsive web experience.

Implement:
- Route-level code splitting where useful
- Lazy-loaded heavy UI components
- Efficient Firestore queries
- Pagination for long histories
- Bounded AI response sizes
- Debouncing for appropriate inputs
- Memoization where beneficial
- Proper cleanup of subscriptions
- Avoidance of unnecessary rerenders
- Error boundaries
- Graceful degraded states

Do not introduce premature complexity.

## Reliability

The application must distinguish:
- Loading
- Saved
- Unsaved
- Failed to save
- Offline
- AI quota exceeded
- AI response unavailable
- Demo mode

The user must always know whether critical progress was successfully saved.

---

# 15. GOOGLE AI STUDIO AND CLOUD RUN DEPLOYMENT

The final application must be prepared for import into Google AI Studio and subsequent publishing where supported.

## Server Requirements

The production backend must:
- Bind to `0.0.0.0`
- Read port from `process.env.PORT`
- Use port 3000 only as a local default
- Serve the built React SPA
- Serve `/api/*` endpoints
- Handle frontend deep links correctly
- Provide a health endpoint
- Shut down gracefully

## Required Scripts

Include working commands for:
- Development
- Production build
- Type checking
- Unit tests
- Integration tests
- Production startup
- Linting

Use:
- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run test`
- `npm run start`

Document any additional commands.

## Cloud Compatibility

Do not depend on:
- Persistent local SQLite files
- Writable local disk storage for permanent records
- Hardcoded localhost API URLs
- Locally stored secrets
- Development-only Vite middleware in production

Use relative same-origin API paths where appropriate.

Make Firebase configuration explicit.

Use a server-side secret for Gemini API access.

## Publishing Reality Check

Do not assume every arbitrary GitHub repository can be imported and published without changes.

Check current Google AI Studio Build import requirements and Cloud Run publishing constraints.

If specific platform behavior cannot be verified, document the uncertainty rather than claiming compatibility.

Prepare an alternative standard Cloud Run deployment path if AI Studio direct publishing cannot accept the project unchanged.

Do not deploy without permission.

Do not create billable services or enable paid billing without explicit user approval.

---

# 16. TESTING REQUIREMENTS

Testing is mandatory.

## Unit Tests

Cover:
- Competency scoring
- Assessment coverage
- Insufficient evidence rules
- Duplicate question-family handling
- Checkpoint pass/fail thresholds
- Idempotent submissions
- Prerequisite ordering
- Weekly study time allocation
- Roadmap change detection
- Roadmap revision acceptance

## Integration Tests

Cover:
- Firebase authentication verification
- Protected API access
- Unauthorized access rejection
- Firestore persistence
- Assessment submissions
- Evidence updates
- Roadmap revision transactions
- Gemini gateway error handling
- Judge demo session isolation

Use mocks or Firebase emulators as appropriate.

## End-to-End Tests

Use Playwright or a suitable equivalent.

Test:
1. Landing page loads.
2. Judge demo starts.
3. Dashboard opens.
4. Assessment can be completed.
5. Scores update correctly.
6. Evidence trail reflects the submitted assessment.
7. Roadmap revision can be accepted.
8. Progress survives a page reload.
9. AI mentor responds when configured.
10. Mobile navigation works.

Include tests for browser errors and failed API requests.

## Quality Gates

Before declaring a milestone complete:
- TypeScript type checking passes.
- Production build succeeds.
- Relevant automated tests pass.
- Core flows work in a browser.
- No known critical security flaw remains.

Report exact test results.

Do not fabricate successful tests.

---

# 17. DEVELOPMENT PROCESS

Do not generate the whole application in one uncontrolled pass.

Organize development into phases.

## Phase 1 — Architecture

- Inspect repository.
- Read attached implementation plan.
- Identify dependencies and compatibility constraints.
- Define types and interfaces.
- Establish modular folder structure.
- Create an implementation checklist.

## Phase 2 — Foundation

- Initialize React/Vite/TypeScript application.
- Configure Tailwind.
- Create Express backend.
- Add shared schemas.
- Configure environment variables.
- Set up testing tools.
- Implement health endpoint.

## Phase 3 — Firebase and Security

- Set up Firebase client integration.
- Implement backend token verification.
- Define Firestore schema.
- Implement security rules.
- Create database repositories.
- Implement judge demo sessions.

## Phase 4 — Evidence and Assessment Engine

- Create competency definitions.
- Implement reviewed question bank.
- Implement diagnostic assessment.
- Implement deterministic grading.
- Implement evidence tracking.
- Implement scoring and coverage.
- Add comprehensive tests.

## Phase 5 — Adaptive Roadmap

- Define prerequisite graph.
- Implement weekly planner.
- Generate task recommendations.
- Build roadmap revision proposals.
- Implement before/after comparisons.
- Add explicit acceptance workflow.

## Phase 6 — Frontend UI

- Landing page
- Authentication
- Onboarding
- Dashboard
- Skill analyzer
- Roadmap
- Assessments
- Evidence view
- AI mentor
- Settings
- Mobile layouts

## Phase 7 — Gemini Integration

- Configure model
- Implement Gemini gateway
- Add validated prompts and schemas
- Integrate task personalization
- Integrate roadmap explanations
- Add contextual mentor
- Enforce quotas and fallbacks

## Phase 8 — Full Integration

- Connect all frontend components to real endpoints.
- Remove placeholder behaviors.
- Validate persistent state.
- Test user and judge workflows.
- Fix navigation and data synchronization issues.

## Phase 9 — QA and Security Review

- Run unit tests.
- Run integration tests.
- Run end-to-end tests.
- Inspect authentication and authorization.
- Test quota failures.
- Test Firestore rules.
- Test responsive layouts.
- Fix critical errors.

## Phase 10 — Deployment Preparation

- Verify production build.
- Verify production server startup.
- Verify environment configuration.
- Prepare deployment documentation.
- Validate Google AI Studio compatibility.
- Prepare GitHub handoff.
- Prepare final demonstration.

At the end of each phase, provide:
- Completed changes
- Files created/modified
- Tests executed
- Test results
- Known limitations
- Next required actions

Continue autonomously through phases when the environment permits and no external approval or credentials are required.

Do not repeatedly stop for unnecessary clarification.

---

# 18. DOCUMENTATION REQUIREMENTS

Create a clear README.md explaining:
- Project purpose
- Problem statement
- Main features
- Technology stack
- Local setup
- Required environment variables
- Firebase configuration
- Gemini API configuration
- Available commands
- Testing instructions
- Deployment instructions
- Known limitations

Create docs/architecture.md explaining:
- Component architecture
- Server trust boundaries
- Database schema
- Authentication
- Assessment scoring
- Evidence tracking
- Adaptive roadmap logic
- AI integration

Create docs/deployment.md explaining:
- Google AI Studio import process
- Cloud Run compatibility
- Required secrets
- Firebase setup
- Production startup
- Deployment verification checklist

Create docs/security.md explaining:
- Authentication
- Authorization
- Secret management
- AI quota enforcement
- Assessment integrity
- Demo mode isolation

Create HANDOFF.md for Google Antigravity or another development agent.

HANDOFF.md must contain:
- Current implementation state
- Completed features
- Remaining work
- Architecture summary
- Important files
- Environment requirements
- Test status
- Known issues
- Deployment blockers
- Suggested next development actions

This file must allow a new coding agent to continue the project without needing the entire original conversation.

---

# 19. HACKATHON PRESENTATION REQUIREMENTS

Build the product so its value can be demonstrated quickly.

Create a cohesive demo experience showing:

Student selects a career goal → completes a diagnostic → receives a personalized roadmap → completes an assessment → sees evidence-based scoring → receives an adaptive roadmap proposal.

Highlight the distinction between:
- Course completion
- Self-reported familiarity
- Demonstrated proficiency
- Assessment coverage

The platform should demonstrate a measurable software behavior, not an unsupported claim of educational impact.

Prepare:
- A short product description
- A concise problem-solution summary
- An architecture explanation
- A feature overview
- A judge demo walkthrough
- A limitations and future improvements section

Do not fabricate user testing, measured outcomes, or adoption statistics.

---

# 20. DEFINITION OF DONE

The project is complete only when:

1. The web app builds successfully.
2. The production server starts successfully.
3. Authentication works when Firebase is configured.
4. The judge demo works without external sign-in.
5. The diagnostic assessment works.
6. Scoring is computed correctly on the server.
7. Evidence records persist.
8. A personalized roadmap is generated.
9. Roadmap revisions can be reviewed and accepted.
10. Gemini integration works when valid credentials and quota are available.
11. AI failures are handled honestly.
12. Navigation works.
13. The application is responsive.
14. Critical automated tests pass.
15. Firebase Security Rules are configured.
16. No API credentials are exposed.
17. Persistent data survives page reloads and application restarts.
18. Production build and startup instructions are verified.
19. Documentation is complete.
20. The repository is ready for transfer to Google Antigravity or Google AI Studio.

If any condition cannot be verified, mark it as incomplete and explain the blocker.

---

# 21. FINAL ENGINEERING INSTRUCTIONS

Prioritize correctness, maintainability, usability, and security over unnecessary visual complexity.

Use clean modular TypeScript.

Keep components reusable.

Use production-grade validation and error handling.

Avoid hardcoded fake AI responses presented as real output.

Never claim that untested functionality works.

Never assume external credentials or Firebase projects are already configured.

Never expose secrets.

Do not create paid resources without approval.

Use the attached revised implementation plan to preserve the project's original evidence-based educational vision.

Build a real web application with functional frontend and backend integration.

Take initiative on routine engineering decisions, implement the project incrementally, and validate work continuously.

**START NOW: Inspect the repository, read the specification, prepare the implementation checklist, then begin implementing Phase 1 and continue through the remaining phases as far as the available environment and permissions allow.**