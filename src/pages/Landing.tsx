import {
  ArrowRight,
  ArrowUpRight,
  Layers3,
  ScanLine,
  Route,
  ShieldCheck,
  Check,
  Code2,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { demo, login } from "../services/api";
import { useWorkspace } from "../app/context";
export default function Landing() {
  const { run, busy } = useWorkspace(),
    navigate = useNavigate();
  async function enter(isDemo: boolean) {
    const success = await run(async () => {
      await (isDemo ? demo() : login());
      return true;
    }, "Workspace ready");
    if (success) navigate(isDemo ? "/app" : "/onboarding");
  }
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Layers3 size={22} />
          </span>
          SkillBridge<span className="ai">AI</span>
        </Link>
        <div>
          <a href="#method">The methodology</a>
          <button
            className="button ghost"
            disabled={busy}
            onClick={() => enter(false)}
          >
            Sign in <ArrowUpRight size={16} />
          </button>
        </div>
      </nav>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="dot" /> A clearer path from learning to doing
            </p>
            <h1>
              Don’t just learn skills.
              <br />
              <em>Prove them.</em>
              <br />
              Improve them.
            </h1>
            <p className="hero-description">
              Know where you stand. Build what matters. Turn your next learning
              step into evidence you can actually explain.
            </p>
            <div className="actions">
              <button
                className="button primary"
                disabled={busy}
                onClick={() => enter(false)}
              >
                Start your assessment <ArrowRight size={18} />
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => enter(true)}
              >
                Launch Judge Demo <ArrowUpRight size={18} />
              </button>
            </div>
            <p className="fine">
              One complete full-stack track. A plan shaped by your evidence.
              <br />
              Judge demo needs no account. All sample data is clearly labeled.
            </p>
          </div>
          <div className="hero-visual">
            <div className="visual-top">
              <span>
                <span className="dot" /> YOUR LEARNING, EXPLAINED
              </span>
              <Code2 size={20} />
            </div>
            <div className="visual-score">
              <span>Assessment snapshot</span>
              <small>Illustrative example</small>
              <div>
                67<span>/100</span>
              </div>
              <p>
                Assessment score <span>·</span> 33% coverage
              </p>
            </div>
            <div className="mini-bars">
              {[
                ["SQL & Data Modeling", 67],
                ["API Design & Validation", 33],
                ["Authentication & Security", 0],
              ].map(([name, value]) => (
                <div key={name}>
                  <span>{name}</span>
                  <small>
                    {value ? `${value}/100` : "Insufficient evidence"}
                  </small>
                  <div>
                    <i style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="visual-task">
              <span className="icon-tile">
                <Route size={22} />
              </span>
              <div>
                <small>YOUR NEXT STEP</small>
                <strong>Build a validated API endpoint</strong>
                <span>Recommended from assessment evidence</span>
              </div>
              <ArrowUpRight size={18} />
            </div>
            <div className="visual-bottom">
              <ShieldCheck size={16} /> Evidence first. Every recommendation has
              a reason.
            </div>
          </div>
        </section>
        <section className="method" id="method">
          <div>
            <p className="eyebrow">A learning loop, not another course list</p>
            <h2>Make progress you can point to.</h2>
          </div>
          <div className="method-grid">
            {[
              [
                ScanLine,
                "01",
                "Find your starting point",
                "A focused diagnostic separates what you feel you know from what you have demonstrated.",
              ],
              [
                Route,
                "02",
                "Practice with purpose",
                "Follow a prerequisite-aware plan that fits your week, with space left for revision.",
              ],
              [
                ShieldCheck,
                "03",
                "Verify. Then adapt.",
                "Take a checkpoint, inspect your evidence, and choose whether to accept your updated plan.",
              ],
            ].map(([Icon, n, title, body]) => {
              const I = Icon as typeof ScanLine;
              return (
                <article key={String(n)}>
                  <div>
                    <I size={24} />
                    <span>{String(n)}</span>
                  </div>
                  <h3>{String(title)}</h3>
                  <p>{String(body)}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section className="track-strip">
          <div>
            <p className="eyebrow">One focused career track</p>
            <h2>Entry-Level Full-Stack Developer</h2>
            <p>
              Six competencies. A documented platform rubric. No promises of
              guaranteed career outcomes.
            </p>
          </div>
          <div>
            {[
              "SQL & data modeling",
              "API design & validation",
              "Authentication & security",
              "React architecture",
              "Async & error handling",
              "Software testing",
            ].map((s) => (
              <span key={s}>
                <Check size={16} />
                {s}
              </span>
            ))}
          </div>
        </section>
      </main>
      <footer>
        <span>SkillBridge AI · Learn. Prove. Improve.</span>
        <span>Built for the next step, backed by evidence.</span>
        <Link to="/privacy">Privacy & methodology</Link>
      </footer>
    </div>
  );
}
