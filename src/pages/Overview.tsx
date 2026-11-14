import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Target,
  Clock3,
  FlaskConical,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useWorkspace } from "../app/context";
import { Badge, Heading } from "../components/ui";
export default function Overview() {
  const { view: w } = useWorkspace();
  if (!w) return null;
  const plan = w.roadmaps.find((r) => r.id === w.activeRoadmapId)!;
  const next = plan.tasks.find((t) => !w.taskProgress[t.id]);
  const completed = Object.values(w.taskProgress).filter(Boolean).length;
  const history = w.assessments.filter((a) => a.status === "submitted");
  return (
    <>
      <Heading
        eyebrow="YOUR LEARNING WORKSPACE"
        title={`Let’s build on what you know, ${w.profile.name.split(" ")[0] || "learner"}.`}
      >
        <Badge tone="indigo">Full-Stack Developer</Badge>
      </Heading>
      <p className="page-intro">
        A clear next step. A reason behind it. Evidence that moves with you.
      </p>
      <section className="overview-top">
        <article className="next-card">
          <div className="row">
            <Badge tone="light">YOUR NEXT BEST STEP</Badge>
            <span>{next?.minutes ?? 0} MIN · PRACTICE</span>
          </div>
          <h2>{next?.title ?? "Your planned practice is complete."}</h2>
          <p>
            {next?.objective ??
              "Keep verifying what you know with a new checkpoint."}
          </p>
          <Link
            className="button white"
            to={next ? "/app/plan" : "/app/assessments"}
          >
            Continue your next task <ArrowRight size={18} />
          </Link>
          <div className="next-reason">
            <Target size={17} />
            <span>
              {next?.why ??
                "Task completion records effort; assessments supply competency evidence."}
            </span>
          </div>
        </article>
        <article className="card progress-card">
          <div className="row">
            <h3>Role assessment progress</h3>
            <Target size={18} />
          </div>
          <div className="score-display">
            {w.summary.score ?? "—"}
            <span>/100</span>
          </div>
          <p>
            Assessment score{" "}
            <Badge tone="indigo">{w.summary.coverage}% coverage</Badge>
          </p>
          <div className="coverage-track">
            <i style={{ width: `${w.summary.coverage}%` }} />
          </div>
          <p className="muted small">
            {w.summary.skills.filter((s) => s.score !== null).length} of 6
            competencies have enough evidence.
            <br />
            Unassessed does not mean low ability.
          </p>
          <Link className="text-link" to="/app/evidence">
            Explore the evidence <ArrowUpRight size={16} />
          </Link>
        </article>
      </section>
      <div className="stats-row">
        <div>
          <span className="icon-tile">
            <FlaskConical size={20} />
          </span>
          <div>
            <strong>{history.length}</strong>
            <span>Assessments completed</span>
          </div>
        </div>
        <div>
          <span className="icon-tile mint">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <strong>
              {completed}
              <small> / 6</small>
            </strong>
            <span>Practice tasks completed · effort only</span>
          </div>
        </div>
        <div>
          <span className="icon-tile amber">
            <Clock3 size={20} />
          </span>
          <div>
            <strong>
              {w.studyLogs.reduce((n, l) => n + l.hours, 0)}
              <small> hrs</small>
            </strong>
            <span>Self-reported study time</span>
          </div>
        </div>
      </div>
      <section className="card skill-section">
        <div className="section-title">
          <div>
            <h2>Your skill landscape</h2>
            <p>
              Our role rubric targets 80/100 in each competency. Scores use
              distinct eligible question families.
            </p>
          </div>
          <Badge>
            {w.demo
              ? "Sample student + your session activity"
              : "Your assessed evidence"}
          </Badge>
        </div>
        <div className="skill-table">
          <div className="skill-row table-head">
            <span>COMPETENCY</span>
            <span>ASSESSED PERFORMANCE</span>
            <span>EVIDENCE</span>
            <span>NEXT ACTION</span>
          </div>
          {w.competencies.map((c) => {
            const s = w.summary.skills.find((s) => s.id === c.id)!;
            return (
              <div className="skill-row" key={c.id}>
                <div>
                  <strong>{c.name}</strong>
                  <small>
                    Self-report:{" "}
                    {
                      [
                        "Not provided",
                        "Unfamiliar",
                        "Novice",
                        "Developing",
                        "Proficient",
                        "Confident",
                      ][w.profile.selfReport[c.id] ?? 0]
                    }
                  </small>
                </div>
                <div>
                  {s.score === null ? (
                    <Badge>{s.state}</Badge>
                  ) : (
                    <>
                      <span className="score-value">
                        {s.score}
                        <small> / 100</small>
                      </span>
                      <div className="skill-track">
                        <i
                          className={s.score >= 80 ? "good" : ""}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
                <Link to={`/app/evidence?skill=${c.id}`}>
                  {s.count} families <ArrowUpRight size={13} />
                </Link>
                <Link
                  className="text-link"
                  to={`/app/assessments?skill=${c.id}`}
                >
                  {s.score === null
                    ? "Assess skill"
                    : s.score < 80
                      ? "Practice & verify"
                      : "Verify again"}{" "}
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
      <div className="two-columns">
        <section className="card">
          <div className="section-title">
            <h2>Assessment history</h2>
            <Badge>Attempt scores</Badge>
          </div>
          {history.length ? (
            <>
              <div className="chart">
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart
                    data={history
                      .slice(-8)
                      .map((a, i) => ({ name: `${i + 1}`, score: a.score }))}
                  >
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar
                      isAnimationActive={false}
                      dataKey="score"
                      fill="#6366f1"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="small muted">
                Attempts are separate from eligible competency evidence.
                Repeated families do not add evidence.
              </p>
            </>
          ) : (
            <p className="empty">
              Complete a diagnostic to start your history.
            </p>
          )}
        </section>
        <section className="card">
          <div className="section-title">
            <h2>Recent evidence</h2>
            <Link to="/app/evidence" className="text-link">
              View all <ArrowUpRight size={15} />
            </Link>
          </div>
          {w.evidence
            .slice(-3)
            .reverse()
            .map((e) => (
              <div className="activity" key={e.id}>
                <span className="activity-dot" />
                <div>
                  <strong>
                    {e.type === "assessment"
                      ? "Assessment recorded"
                      : "Practical design reviewed"}
                  </strong>
                  <p>
                    {e.source} · {new Date(e.at).toLocaleDateString()}
                  </p>
                  <small>
                    {e.outcomes
                      ? `${e.outcomes.filter((o) => o.eligible).length} eligible question families`
                      : "Static rubric coverage · not independently verified"}
                  </small>
                </div>
              </div>
            ))}
        </section>
      </div>
    </>
  );
}
