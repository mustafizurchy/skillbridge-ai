import { useSearchParams } from "react-router-dom";
import { useWorkspace } from "../app/context";
import { api } from "../services/api";
import { Heading, Badge, Empty } from "../components/ui";
export async function downloadEvidence() {
  const data = await api("/export");
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "skillbridge-evidence.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Evidence() {
  const { view: w, run, busy } = useWorkspace();
  const [params, setParams] = useSearchParams();
  if (!w) return null;
  const skill = params.get("skill");
  const events = w.evidence.filter(
    (e) => !skill || e.outcomes?.some((o) => o.skill === skill),
  );
  return (
    <>
      <Heading
        eyebrow="EVERY SCORE HAS A STORY"
        title="Your evidence portfolio."
      >
        <div className="actions">
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => run(downloadEvidence, "Export downloaded.")}
          >
            Export JSON
          </button>
          <button className="button ghost" onClick={() => window.print()}>
            Print summary
          </button>
        </div>
      </Heading>
      <p className="page-intro">
        What changed, why it changed, and what supports your progress.{" "}
        {w.demo ? "Contains clearly labeled fictional sample evidence." : ""}
      </p>
      <label>
        Filter by competency
        <select
          value={skill ?? ""}
          onChange={(e) =>
            setParams(e.target.value ? { skill: e.target.value } : {})
          }
        >
          <option value="">All evidence</option>
          {w.competencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {!events.length && (
        <Empty>
          No evidence for this competency yet. Complete an assessment to begin.
        </Empty>
      )}
      {events
        .slice()
        .reverse()
        .map((e) => (
          <article key={e.id} className="card evidence-card">
            <div className="row">
              <Badge tone={e.source === "Sample student" ? "amber" : "indigo"}>
                {e.source}
              </Badge>
              <time>{new Date(e.at).toLocaleString()}</time>
            </div>
            <h2>
              {e.type === "assessment"
                ? "Assessment evidence"
                : "Practical design review"}
            </h2>
            {e.outcomes ? (
              <>
                <p>
                  {e.outcomes.filter((o) => o.correct).length}/
                  {e.outcomes.length} correct ·{" "}
                  {e.outcomes.filter((o) => o.eligible).length} eligible
                  families
                </p>
                <details>
                  <summary>Inspect question-family evidence</summary>
                  {e.outcomes.map((o) => (
                    <div className="history-row" key={o.questionId}>
                      <div>
                        <strong>
                          {w.competencies.find((c) => c.id === o.skill)?.name}
                        </strong>
                        <small>{o.family}</small>
                        <p>{o.explanation}</p>
                      </div>
                      <Badge tone={o.correct ? "green" : "amber"}>
                        {o.correct ? "Correct" : "Incorrect"} ·{" "}
                        {o.eligible ? "Eligible" : "Repeat excluded"}
                      </Badge>
                    </div>
                  ))}
                </details>
              </>
            ) : (
              <>
                {e.rubric?.map((r) => (
                  <div className="result-item" key={r.criterion}>
                    <Badge tone={r.met ? "green" : "amber"}>
                      {r.met ? "Required terms present" : "Needs revision"}
                    </Badge>
                    <h3>{r.criterion}</h3>
                    <p>{r.explanation}</p>
                    <blockquote>{e.submission?.[r.criterion]}</blockquote>
                  </div>
                ))}
              </>
            )}
          </article>
        ))}
      <section className="card">
        <h2>Roadmap revision trail</h2>
        {w.roadmaps.map((r) => (
          <div className="history-row" key={r.id}>
            <div>
              <strong>{new Date(r.createdAt).toLocaleString()}</strong>
              <p>{r.reasons.join(" ")}</p>
              <small>
                Revision {r.id.slice(0, 8)} · parent{" "}
                {r.parentId?.slice(0, 8) ?? "initial"}
              </small>
            </div>
            <Badge>{r.status}</Badge>
          </div>
        ))}
      </section>
    </>
  );
}
