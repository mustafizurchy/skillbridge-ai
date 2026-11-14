# Judge walkthrough

SkillBridge AI helps students decide what to learn next using explainable evidence, rather than treating course completion as mastery. Its loop is assess → identify gaps → practice → verify → review an adaptive plan.

1. Run locally and select **Launch Judge Demo**. Alex Rivera is a fictional student; all seeded evidence carries **Sample student** provenance.
2. Overview initially shows assessed SQL and API performance, partial security evidence, and three unassessed skills. Assessment score and coverage are separate.
3. Open **Assessments**, choose API Design & Input Validation, and start a checkpoint. The five unused API families are graded server-side. Four correct passes; the evidence score also considers the eligible seeded questions.
4. Submit, then inspect question explanations and eligibility. A perfect first API checkpoint produces 75/100 API evidence performance (six correct among eight families), even though this attempt scored 100/100. This distinction is intentional.
5. Open **Evidence** to inspect the new Server graded event. It is distinct from the fictional diagnostic.
6. Open **My Plan**, compare the current and proposed versions, and accept the proposal. Reload: the active version persists while the server remains running (or durably with Firestore).
7. Mark a practice task complete and log study time in Settings. Neither action changes competency scores.
8. Submit the secure endpoint design challenge and inspect the labeled static rubric. No code execution or certification is implied.
9. Optionally paste a job description into My Plan. Review literal requirement quotes and proposed role weights before acceptance.
10. Open AI Mentor. Without credentials it honestly shows unavailable, while the deterministic workflow remains functional. When configured, the demo has three bounded AI attempts and advice never changes grades.

The bank is deliberately finite and repeat-resistant. Repeating seen families can pass a checkpoint but cannot inflate evidence. This is a measurable software behavior, not a claim of proven educational impact. Future work includes a larger independently reviewed bank, richer practical verification, Gemini task personalization, more career tracks, retention/deletion workflows, and large-account projection optimization.
