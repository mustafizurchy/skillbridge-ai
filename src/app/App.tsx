import {
  useEffect,
  useState,
  lazy,
  Suspense,
  Component,
  type ReactNode,
  type ErrorInfo,
} from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import {
  Layers3,
  LayoutDashboard,
  Route as RouteIcon,
  FlaskConical,
  FolderCheck,
  Sparkles,
  Settings as SettingsIcon,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  PanelLeftClose,
} from "lucide-react";
import { useWorkspace } from "./context";
import { logout } from "../services/api";
import Landing from "../pages/Landing";
const Overview = lazy(() => import("../pages/Overview")),
  Plan = lazy(() => import("../pages/Plan")),
  Assessments = lazy(() => import("../pages/Assessments")),
  Evidence = lazy(() => import("../pages/Evidence")),
  Mentor = lazy(() => import("../pages/Mentor")),
  Settings = lazy(() => import("../pages/Settings")),
  Onboarding = lazy(() => import("../pages/Onboarding"));
function Protected() {
  const { view, loading } = useWorkspace();
  return loading ? (
    <div className="loading">Restoring your workspace…</div>
  ) : view ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
}
function Layout() {
  const { view: w, run, clear, busy } = useWorkspace();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [dark, setDark] = useState(localStorage.getItem("sb-theme") === "dark");
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("sb-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  if (!w) return null;
  const nav = [
    ["/app", "Overview", LayoutDashboard],
    ["/app/plan", "My Plan", RouteIcon],
    ["/app/assessments", "Assessments", FlaskConical],
    ["/app/evidence", "Evidence", FolderCheck],
    ["/app/mentor", "AI Mentor", Sparkles],
    ["/app/settings", "Settings", SettingsIcon],
  ] as const;
  return (
    <div className={`workspace ${collapsed ? "collapsed" : ""}`}>
      {open && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link className="brand" to="/">
          <span className="brand-icon">
            <Layers3 size={22} />
          </span>
          <span className="sidebar-label">
            SkillBridge <span className="ai">AI</span>
          </span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <p className="nav-label sidebar-label">YOUR WORKSPACE</p>
        <nav aria-label="Workspace">
          {nav.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app"}
              title={label}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              <span className="sidebar-label">{label}</span>
              {label === "My Plan" &&
                w.roadmaps.some((r) => r.status === "proposed") && (
                  <span className="nav-dot" />
                )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note sidebar-label">
            <span className="eyebrow">THE SMALL STEPS ADD UP</span>
            <p>
              Learn something.
              <br />
              Build something.
              <br />
              Show your thinking.
            </p>
          </div>
          <div className="profile-mini">
            <div className="avatar">{w.profile.name.slice(0, 1) || "S"}</div>
            <div className="sidebar-label">
              <strong>{w.profile.name || "New learner"}</strong>
              <small>{w.demo ? "Sample student" : "Student workspace"}</small>
            </div>
          </div>
          <button
            className="button ghost sidebar-label"
            disabled={busy}
            onClick={async () => {
              const result = await run(async () => {
                await logout();
                return true;
              }, "Signed out");
              if (result) {
                clear();
                navigate("/");
              }
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="row">
            <button
              className="icon-button desktop-collapse"
              aria-label="Toggle sidebar"
              onClick={() => setCollapsed(!collapsed)}
            >
              <PanelLeftClose size={20} />
            </button>
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu size={22} />
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span> Full-Stack Developer
            </span>
          </div>
          <div className="row">
            {w.demo && (
              <span className="demo-badge">
                <span className="dot" /> Judge Demo Mode
              </span>
            )}
            <button
              className="icon-button"
              aria-label={dark ? "Use light theme" : "Use dark theme"}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>
        {w.storage === "memory" && (
          <div className="storage-notice">
            Local demo storage · progress survives page reloads, but resets when
            the server restarts. Configure Firestore for durable persistence.
          </div>
        )}
        <main className="workspace-main">
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>SkillBridge AI · Evidence over assumptions.</span>
          <Link to="/privacy">Privacy & rubric</Link>
        </footer>
      </div>
    </div>
  );
}
function Status() {
  const { busy, error, notice, refresh } = useWorkspace();
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(!navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  if (!busy && !error && !notice && !offline) return null;
  return (
    <div
      className={`status-toast ${error || offline ? "error" : ""}`}
      role={error || offline ? "alert" : "status"}
      aria-live="polite"
    >
      {offline
        ? "Offline. Changes cannot be saved."
        : busy
          ? "Saving / loading…"
          : error || notice}
      {error && (
        <button onClick={() => refresh().catch(() => undefined)}>
          Reload workspace
        </button>
      )}
    </div>
  );
}
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* Error text is deliberately not logged to avoid user data. */
  }
  render() {
    return this.state.failed ? (
      <main className="onboarding">
        <h1>This view could not load.</h1>
        <p>Your server-saved progress is preserved.</p>
        <button className="button primary" onClick={() => location.reload()}>
          Reload application
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const { refresh, run } = useWorkspace();
  useEffect(() => {
    void run(async () => undefined, "");
  }, [refresh]);
  return (
    <>
      <Status />
      <Suspense
        fallback={<div className="loading">Loading your workspace…</div>}
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/privacy"
            element={
              <main className="onboarding card">
                <Link to="/">← Home</Link>
                <h1>Privacy & methodology</h1>
                <p>
                  SkillBridge stores your learning profile, assessments,
                  evidence, study logs, and plan revisions to support your
                  learning. Self-report and task completion are not verified
                  competency.
                </p>
                <p>
                  Our six-competency rubric is a platform learning framework,
                  not a universal industry standard or employment certification.
                  Scores require three eligible distinct question families and
                  use up to ten recent distinct families. Repeated families
                  never earn new evidence.
                </p>
                <p>
                  Gemini receives your mentor message, role, assessed summary
                  and current task when you choose to send a message. Avoid
                  sensitive personal information. AI feedback is advisory. Data
                  can be exported from Settings. Account deletion is not yet
                  self-service; production operators must provide a contact and
                  retention policy before public launch.
                </p>
                <p>
                  Demo sessions expire after four hours. Sample student evidence
                  is fictional. Local memory mode is temporary; Firestore is
                  required for production.
                </p>
              </main>
            }
          />
          <Route element={<Protected />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/app" element={<Layout />}>
              <Route index element={<Overview />} />
              <Route path="plan" element={<Plan />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="evidence" element={<Evidence />} />
              <Route path="mentor" element={<Mentor />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <main className="onboarding">
                <h1>Page not found</h1>
                <Link to="/">Return home</Link>
              </main>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
