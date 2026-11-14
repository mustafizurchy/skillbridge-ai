import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useWorkspace } from "../app/context";
import { api } from "../services/api";
import type { Attempt, SkillId } from "../../shared/types";
import { Heading, Badge } from "../components/ui";
export function Quiz({
  attempt,
  onDone,
}: {
  attempt: Attempt;
  onDone: () => void;
}) {
  const { run, busy } = useWorkspace();
  const [answers, setAnswers] = useState<Record<number, number>>({}),
    [index, setIndex] = useState(0),
    [result, setResult] = useState<Attempt | null>(
      attempt.status === "submitted" ? attempt : null,
    ),
    [confirm, setConfirm] = useState(false);
  const q = attempt.questions[index];
  if (result)
    return (
      <section className="card quiz-result">
        <Badge tone={result.passed ? "green" : "indigo"}>
          {result.kind === "checkpoint"
            ? result.passed
              ? "Quiz checkpoint passed"
              : "Keep practicing"
            : "Diagnostic complete"}
        </Badge>
        <h2>{result.score}/100</h2>
        <p>
          {result.kind === "checkpoint" ? "Pass threshold: 4/5 = 80%. " : ""}
          {result.outcomes?.filter((o) => o.eligible).length} new eligible
          families. Repeated families do not increase evidence.
        </p>
        {result.outcomes?.map((o, i) => (
          <div className="result-item" key={o.questionId}>
            <Badge tone={o.correct ? "green" : "amber"}>
              {o.correct ? "Correct" : "Review"} ·{" "}
              {o.eligible ? "Eligible evidence" : "Previously seen family"}
            </Badge>
            <h3>
              {i + 1}. {result.questions[i].prompt}
            </h3>
            <p>Your answer: {result.questions[i].options[o.answer]}</p>
            <p>
              Correct answer: {result.questions[i].options[o.correctAnswer]}
            </p>
            <p className="muted">{o.explanation}</p>
          </div>
        ))}
        <div className="actions">
          <Link className="button primary" to="/app/plan">
            Review my roadmap
          </Link>
          <button className="button secondary" onClick={onDone}>
            Back to assessments
          </button>
        </div>
      </section>
    );
  return (
    <section className="card quiz">
      <div className="row">
        <Badge tone="indigo">
          {attempt.kind === "diagnostic" ? "Diagnostic" : "Checkpoint"}
        </Badge>
        <span>
          Question {index + 1} of {attempt.questions.length}
        </span>
      </div>
      <div className="question-nav">
        {attempt.questions.map((_, i) => (
          <button
            key={i}
            aria-label={`Question ${i + 1}${answers[i] !== undefined ? ", answered" : ""}`}
            aria-current={index === i ? "step" : undefined}
            className={
              index === i
                ? "current"
                : answers[i] !== undefined
                  ? "answered"
                  : ""
            }
            onClick={() => setIndex(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <fieldset>
        <legend>{q.prompt}</legend>
        {q.options.map((option, i) => (
          <label
            className={`answer ${answers[index] === i ? "selected" : ""}`}
            key={option}
          >
            <input
              type="radio"
              name={q.id}
              checked={answers[index] === i}
              onChange={() => setAnswers({ ...answers, [index]: i })}
            />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
      <div className="actions">
        <button
          className="button secondary"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          Previous
        </button>
        {index < attempt.questions.length - 1 ? (
          <button
            className="button primary"
            onClick={() => setIndex(index + 1)}
          >
            Next question
          </button>
        ) : (
          <button
            className="button primary"
            disabled={
              Object.keys(answers).length !== attempt.questions.length || busy
            }
            onClick={() => setConfirm(true)}
          >
            Review submission
          </button>
        )}
      </div>
      {confirm && (
        <div className="confirm-box" role="alert">
          <p>
            Submit all {attempt.questions.length} answers for server grading?
            Submitted answers cannot be changed.
          </p>
          <div className="actions">
            <button
              className="button primary"
              disabled={busy}
              onClick={async () => {
                const r = await run(
                  () =>
                    api<Attempt>(`/assessments/${attempt.id}/submit`, "POST", {
                      answers: attempt.questions.map((_, i) => answers[i]),
                    }),
                  "Assessment graded and evidence saved.",
                );
                if (r) setResult(r);
              }}
            >
              Submit assessment
            </button>
            <button className="button ghost" onClick={() => setConfirm(false)}>
              Keep reviewing
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
function Challenge() {
  const { run, busy } = useWorkspace();
  const [saved, setSaved] = useState(false);
  return (
    <section className="card">
      <Badge tone="indigo">Practical challenge · secure-api</Badge>
      <h2>Design a secure REST API endpoint.</h2>
      <p>
        Design POST /projects/:id/tasks for an authenticated project member.
        Explain the following boundaries. Each response needs at least 20
        characters.
      </p>
      <div className="notice">
        Evaluator: Curated Rubric. Static keyword coverage checks only. These
        checks do not establish code correctness or affect your assessment
        score. No submitted code is executed.
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = Object.fromEntries(new FormData(form));
          const result = await run(
            () => api("/challenges/secure-api/submit", "POST", data),
            "Design review saved to Evidence.",
          );
          if (result) setSaved(true);
        }}
      >
        {[
          [
            "validation",
            "Input validation",
            "Describe schema validation, allowed fields and type/length/range checks.",
          ],
          [
            "authentication",
            "Authentication",
            "Describe token or session verification before processing.",
          ],
          [
            "authorization",
            "Authorization",
            "Explain server-side ownership, role or permission enforcement.",
          ],
          [
            "errors",
            "HTTP errors",
            "Describe 400/422 for invalid input and 401/403 for identity/access failures.",
          ],
          [
            "testing",
            "Testing",
            "Explain tests or assertions for invalid input and unauthorized or other-user access.",
          ],
        ].map(([id, title, hint]) => (
          <label key={id}>
            {title}
            <small>{hint}</small>
            <textarea
              name={id}
              minLength={20}
              maxLength={2000}
              required
              rows={3}
            />
          </label>
        ))}
        <button className="button primary" disabled={busy}>
          Submit design for rubric review
        </button>
        {saved && (
          <p>
            Review saved.{" "}
            <Link to="/app/evidence">Inspect rubric results in Evidence →</Link>
          </p>
        )}
      </form>
    </section>
  );
}
export default function Assessments() {
  const { view: w, run, busy } = useWorkspace();
  const [params] = useSearchParams();
  const [skill, setSkill] = useState<SkillId>(
    (params.get("skill") as SkillId) || "api-design-validation",
  );
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  if (!w) return null;
  const pending = w.assessments.find((a) => a.status === "issued");
  async function start(kind: "checkpoint" | "diagnostic") {
    const a = await run(
      () => api<Attempt>("/assessments", "POST", { kind, skill }),
      "Assessment ready. Answers are graded only on submission.",
    );
    if (a) setAttempt(a);
  }
  return (
    <>
      <Heading
        eyebrow="TURN PRACTICE INTO EVIDENCE"
        title="Show what you know."
      />
      <p className="page-intro">
        Server-graded questions. Explainable results. No extra credit for
        repeating the same question family.
      </p>
      {attempt ? (
        <Quiz
          key={attempt.id}
          attempt={attempt}
          onDone={() => setAttempt(null)}
        />
      ) : (
        <>
          <div className="two-columns">
            <section className="card">
              <Badge tone="indigo">Checkpoint · 5 questions</Badge>
              <h2>Verify a competency</h2>
              <p>
                Pass with 4 of 5 correct answers (80%). Your eligible evidence
                may raise or lower your assessed score.
              </p>
              <label>
                Choose a competency
                <select
                  value={skill}
                  onChange={(e) => setSkill(e.target.value as SkillId)}
                >
                  {w.competencies.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button primary"
                disabled={busy}
                onClick={() => start("checkpoint")}
              >
                Start checkpoint
              </button>
            </section>
            <section className="card">
              <Badge>Diagnostic · 8 questions</Badge>
              <h2>Find your starting point</h2>
              <p>
                A focused assessment covering SQL, APIs, and security. Other
                skills remain unassessed until you collect evidence.
              </p>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => start("diagnostic")}
              >
                Start diagnostic
              </button>
              {pending && (
                <button
                  className="button ghost block"
                  onClick={() => setAttempt(pending)}
                >
                  Resume unfinished {pending.kind}
                </button>
              )}
            </section>
          </div>
          <section className="card">
            <h2>Assessment history</h2>
            {w.assessments
              .filter((a) => a.status === "submitted")
              .reverse()
              .map((a) => (
                <div className="history-row" key={a.id}>
                  <div>
                    <strong>
                      {a.kind === "diagnostic"
                        ? "Initial diagnostic"
                        : "Competency checkpoint"}
                    </strong>
                    <small>{new Date(a.submittedAt!).toLocaleString()}</small>
                  </div>
                  <Badge>{a.score}/100</Badge>
                  <button className="text-link" onClick={() => setAttempt(a)}>
                    View result →
                  </button>
                </div>
              ))}
          </section>
          <Challenge />
        </>
      )}
    </>
  );
}
