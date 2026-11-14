import { useWorkspace } from "../app/context";
import { api } from "../services/api";
import { Heading, Badge, Resource } from "../components/ui";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock3 } from "lucide-react";
export default function Plan() {
  const { view: w, run, busy } = useWorkspace();
  if (!w) return null;
  const active = w.roadmaps.find((r) => r.id === w.activeRoadmapId)!;
  const proposal = w.roadmaps.find((r) => r.status === "proposed");
  return (
    <>
      <Heading
        eyebrow="A PLAN THAT ADAPTS WITH YOU"
        title="Make room for your next step."
      >
        <button
          className="button secondary"
          disabled={busy}
          onClick={() =>
            run(
              () => api("/roadmap/proposals", "POST", {}),
              "Plan reviewed. Any meaningful changes appear below.",
            )
          }
        >
          Review my plan
        </button>
      </Heading>
      <p className="page-intro">
        {w.profile.weeklyHours} hours available each week ·{" "}
        {Math.round(w.profile.weeklyHours * 60 * 0.8)} minutes planned at most ·
        20% left for revision.
      </p>
      {proposal && (
        <section className="proposal card">
          <Badge tone="indigo">A revision is ready for your review</Badge>
          <h2>Your evidence changed. Your plan can, too.</h2>
          {proposal.reasons.map((r) => (
            <p key={r}>{r}</p>
          ))}
          <div>
            {proposal.requirementQuotes?.map((q) => (
              <blockquote key={q.skill}>
                <strong>
                  {w.competencies.find((c) => c.id === q.skill)?.name} ·
                  proposed weight 2
                </strong>
                <p>“{q.quote}”</p>
              </blockquote>
            ))}
          </div>
          <div className="two-columns">
            <div>
              <h3>Current plan</h3>
              {active.tasks.map((t) => (
                <p key={t.id}>
                  Week {t.week} · {t.title}
                </p>
              ))}
            </div>
            <div>
              <h3>Proposed plan</h3>
              {proposal.tasks.map((t) => (
                <p key={t.id}>
                  Week {t.week} · {t.title}
                  <small className="block">{t.why}</small>
                </p>
              ))}
            </div>
          </div>
          <div className="actions">
            <button
              className="button primary"
              disabled={busy}
              onClick={() =>
                run(
                  () =>
                    api(`/roadmap/proposals/${proposal.id}/accept`, "POST", {}),
                  "Revision accepted. Your task progress is preserved.",
                )
              }
            >
              Accept updated plan <Check size={16} />
            </button>
            <button
              className="button ghost"
              disabled={busy}
              onClick={() =>
                run(
                  () =>
                    api(`/roadmap/proposals/${proposal.id}/reject`, "POST", {}),
                  "Current plan kept.",
                )
              }
            >
              Keep current plan
            </button>
          </div>
        </section>
      )}
      <section className="card">
        <details>
          <summary>Customize this role with a job description</summary>
          <p>
            Paste requirements to identify exact quoted keyword matches across
            our six competencies. Matching skills receive weight 2; other skills
            keep weight 1. Review before accepting. No AI call is made.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              void run(
                () =>
                  api("/roadmap/proposals", "POST", {
                    jobDescription: data.get("jobDescription"),
                  }),
                "Customization proposal ready for review.",
              );
            }}
          >
            <label>
              Job description
              <textarea
                name="jobDescription"
                required
                minLength={20}
                maxLength={12000}
                rows={5}
              />
            </label>
            <button className="button secondary" disabled={busy}>
              Preview requirement weighting
            </button>
          </form>
        </details>
      </section>
      <div className="plan-meta">
        <Badge>
          Active revision{" "}
          {w.roadmaps.filter((r) => r.status === "accepted").length + 1}
        </Badge>
        <span>Learning preferences: {w.profile.preferences}</span>
      </div>
      {[...new Set(active.tasks.map((t) => t.week))].map((week) => (
        <section key={week} className="week">
          <div className="week-title">
            <span>{String(week).padStart(2, "0")}</span>
            <div>
              <h2>Week {week}</h2>
              <p>
                {active.tasks
                  .filter((t) => t.week === week)
                  .reduce((n, t) => n + t.minutes, 0)}{" "}
                minutes of focused practice
              </p>
            </div>
          </div>
          {active.tasks
            .filter((t) => t.week === week)
            .map((t) => (
              <article className="card task-card" key={t.id}>
                <div className="row">
                  <Badge tone={w.taskProgress[t.id] ? "green" : "indigo"}>
                    {w.taskProgress[t.id]
                      ? "Practice completed"
                      : "Guided practice"}
                  </Badge>
                  <span className="muted small">
                    <Clock3 size={14} /> {t.minutes} min
                  </span>
                </div>
                <h3>{t.title}</h3>
                <p>{t.objective}</p>
                <details>
                  <summary>Why this task?</summary>
                  <p>{t.why}</p>
                  <p>
                    Prerequisites:{" "}
                    {t.prerequisites.length
                      ? t.prerequisites
                          .map(
                            (id) =>
                              w.competencies.find((c) => c.id === id)?.short,
                          )
                          .join(", ")
                      : "None"}
                    . Ordering supports learning; scheduling does not certify
                    mastery.
                  </p>
                </details>
                <div className="practice">
                  <strong>Put it into practice</strong>
                  <p>{t.practice}</p>
                  <Resource href={t.resource} />
                </div>
                <div className="actions">
                  <button
                    className={`button ${w.taskProgress[t.id] ? "secondary" : "primary"}`}
                    disabled={busy}
                    onClick={() =>
                      run(
                        () =>
                          api(`/tasks/${t.id}/complete`, "POST", {
                            complete: !w.taskProgress[t.id],
                          }),
                        "Practice status saved. Assessment scores are unchanged.",
                      )
                    }
                  >
                    {w.taskProgress[t.id]
                      ? "Mark as unfinished"
                      : "Mark practice complete"}
                  </button>
                  <Link
                    className="text-link"
                    to={`/app/assessments?skill=${t.skill}`}
                  >
                    Verify with a checkpoint <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
        </section>
      ))}
    </>
  );
}
