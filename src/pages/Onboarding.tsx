import { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "../app/context";
import { api } from "../services/api";
import type { Attempt, SkillId } from "../../shared/types";
import { competencies } from "../../shared/catalog";
import { Heading } from "../components/ui";
import { Quiz } from "./Assessments";
export default function Onboarding() {
  const { view: w, run, busy } = useWorkspace();
  const [step, setStep] = useState(1),
    [attempt, setAttempt] = useState<Attempt | null>(null);
  const [values, setValues] = useState({
    name: w?.profile.name ?? "",
    context: w?.profile.context ?? "",
    weeklyHours: w?.profile.weeklyHours ?? 6,
    preferences: "Practical projects",
    selfReport: Object.fromEntries(
      competencies.map((c) => [c.id, 1]),
    ) as Record<SkillId, number>,
  });
  return (
    <div className="onboarding">
      <Link to="/" className="brand">
        SkillBridge <span className="ai">AI</span>
      </Link>
      <Heading
        eyebrow={`YOUR STARTING POINT · STEP ${step} OF 4`}
        title={
          step === 1
            ? "Build a plan around your week."
            : step === 2
              ? "What feels familiar?"
              : step === 3
                ? "Let’s collect your first evidence."
                : "Your learning loop starts here."
        }
      />
      {step <= 2 && (
        <form
          className="card"
          onSubmit={async (e) => {
            e.preventDefault();
            if (step === 1) {
              setStep(2);
              return;
            }
            const a = await run(
              () => api<Attempt>("/onboarding/complete", "POST", values),
              "Profile saved. Diagnostic ready.",
            );
            if (a) {
              setAttempt(a);
              setStep(3);
            }
          }}
        >
          {step === 1 ? (
            <>
              <label>
                Display name
                <input
                  required
                  maxLength={80}
                  value={values.name}
                  onChange={(e) =>
                    setValues({ ...values, name: e.target.value })
                  }
                />
              </label>
              <label>
                Education or experience
                <input
                  maxLength={200}
                  value={values.context}
                  onChange={(e) =>
                    setValues({ ...values, context: e.target.value })
                  }
                />
              </label>
              <label>
                Target career
                <select>
                  <option>Entry-Level Full-Stack Developer</option>
                </select>
              </label>
              <label>
                Weekly learning hours
                <input
                  type="number"
                  min="1"
                  max="40"
                  required
                  value={values.weeklyHours}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      weeklyHours: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                Learning preferences
                <select
                  value={values.preferences}
                  onChange={(e) =>
                    setValues({ ...values, preferences: e.target.value })
                  }
                >
                  <option>Practical projects</option>
                  <option>Reading and exercises</option>
                  <option>Short focused sessions</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <p>
                These answers describe familiarity, not verified competency. The
                diagnostic measures a narrow set of skills.
              </p>
              {competencies.map((c) => (
                <label key={c.id}>
                  {c.name}
                  <select
                    value={values.selfReport[c.id]}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        selfReport: {
                          ...values.selfReport,
                          [c.id]: Number(e.target.value),
                        },
                      })
                    }
                  >
                    {[
                      "Unfamiliar",
                      "Novice",
                      "Developing",
                      "Proficient",
                      "Confident",
                    ].map((name, i) => (
                      <option value={i + 1} key={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </>
          )}
          <div className="actions">
            {step === 2 && (
              <button
                type="button"
                className="button secondary"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            )}
            <button className="button primary" disabled={busy}>
              {step === 1 ? "Continue" : "Begin 8-question diagnostic"}
            </button>
          </div>
        </form>
      )}
      {step === 3 && attempt && (
        <Quiz attempt={attempt} onDone={() => setStep(4)} />
      )}{" "}
      {step === 4 && (
        <section className="card">
          <h2>
            Assessment score {w?.summary.score ?? "—"}/100 · Coverage{" "}
            {w?.summary.coverage}%
          </h2>
          <p>
            Skills without enough eligible evidence remain unassessed or marked
            as insufficient evidence.
          </p>
          <p>
            Your initial plan is ready. Review any proposed adjustments based on
            your diagnostic.
          </p>
          <Link className="button primary" to="/app/plan">
            Review my learning plan
          </Link>
        </section>
      )}
    </div>
  );
}
