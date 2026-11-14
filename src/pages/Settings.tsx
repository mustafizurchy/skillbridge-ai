import { useState } from "react";
import { useWorkspace } from "../app/context";
import { api } from "../services/api";
import { Heading, Badge } from "../components/ui";
import { downloadEvidence } from "./Evidence";
export default function Settings() {
  const { view: w, run, busy } = useWorkspace();
  const [reset, setReset] = useState(false),
    [dirty, setDirty] = useState(false);
  if (!w) return null;
  return (
    <>
      <Heading eyebrow="MAKE THIS WORK FOR YOU" title="Profile & preferences.">
        <Badge>{dirty ? "Unsaved changes" : "Saved"}</Badge>
      </Heading>
      <div className="two-columns">
        <section className="card">
          <h2>Your learning profile</h2>
          <form
            onChange={() => setDirty(true)}
            onSubmit={async (e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              const result = await run(
                () =>
                  api("/profile", "PATCH", {
                    name: d.get("name"),
                    context: d.get("context"),
                    weeklyHours: Number(d.get("hours")),
                    preferences: d.get("preferences"),
                  }),
                "Profile saved. Capacity changes create a plan proposal.",
              );
              if (result) setDirty(false);
            }}
          >
            <label>
              Display name
              <input
                name="name"
                defaultValue={w.profile.name}
                maxLength={80}
                required
              />
            </label>
            <label>
              Education / experience
              <input
                name="context"
                defaultValue={w.profile.context}
                maxLength={200}
              />
            </label>
            <label>
              Weekly learning hours
              <input
                type="number"
                name="hours"
                min="1"
                max="40"
                defaultValue={w.profile.weeklyHours}
                required
              />
            </label>
            <label>
              Learning preferences
              <textarea
                name="preferences"
                maxLength={300}
                defaultValue={w.profile.preferences}
              />
            </label>
            <p className="small muted">
              Target role: Entry-Level Full-Stack Developer. Changing weekly
              hours proposes a revision; it does not overwrite the current plan.
            </p>
            <button className="button primary" disabled={busy}>
              Save preferences
            </button>
          </form>
        </section>
        <div>
          <section className="card">
            <h2>Log your study time</h2>
            <p>
              Self-reported effort is tracked separately from demonstrated
              competency.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const d = new FormData(form);
                const r = await run(
                  () =>
                    api("/study-logs", "POST", {
                      hours: Number(d.get("hours")),
                      note: d.get("note"),
                    }),
                  "Study time saved. Competency scores are unchanged.",
                );
                if (r) form.reset();
              }}
            >
              <label>
                Hours studied
                <input
                  type="number"
                  name="hours"
                  min="0.25"
                  max="24"
                  step="0.25"
                  required
                />
              </label>
              <label>
                What did you work on?
                <input name="note" maxLength={300} />
              </label>
              <button className="button secondary" disabled={busy}>
                Save study log
              </button>
            </form>
            {w.studyLogs.slice(-4).map((l) => (
              <p key={l.id} className="small">
                {l.hours} hrs · {l.note} · {new Date(l.at).toLocaleDateString()}
              </p>
            ))}
          </section>
          <section className="card">
            <h2>Your data</h2>
            <p>
              Export your profile, assessments, evidence, and revision history.
            </p>
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => run(downloadEvidence, "Data exported.")}
            >
              Export learning data
            </button>
            {w.demo && (
              <>
                <hr />
                <button
                  className="button danger"
                  disabled={busy}
                  onClick={() => setReset(true)}
                >
                  Reset demo data
                </button>
                {reset && (
                  <div role="alert">
                    <p>
                      Replace this session’s progress with the fictional sample
                      student? Your AI allowance will not reset.
                    </p>
                    <div className="actions">
                      <button
                        className="button danger"
                        disabled={busy}
                        onClick={async () => {
                          await run(
                            () => api("/demo/reset", "POST", {}),
                            "Demo progress reset.",
                          );
                          setReset(false);
                        }}
                      >
                        Confirm reset
                      </button>
                      <button
                        className="button ghost"
                        onClick={() => setReset(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
