import type { Competency } from "./types";
export const competencies: Competency[] = [
  {
    id: "sql-data-modeling",
    name: "SQL & Data Modeling",
    short: "SQL",
    target: 80,
    prerequisites: [],
    objective:
      "Model related records and query them safely using joins, constraints, and parameters.",
    resource: "https://www.postgresql.org/docs/current/tutorial.html",
  },
  {
    id: "api-design-validation",
    name: "API Design & Input Validation",
    short: "APIs",
    target: 80,
    prerequisites: ["sql-data-modeling"],
    objective:
      "Design predictable endpoints with explicit contracts and validated input.",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status",
  },
  {
    id: "auth-security-boundaries",
    name: "Authentication & Security",
    short: "Security",
    target: 80,
    prerequisites: ["api-design-validation"],
    objective:
      "Separate identity verification from resource authorization on the server.",
    resource:
      "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
  },
  {
    id: "react-state-architecture",
    name: "React State & Architecture",
    short: "React",
    target: 80,
    prerequisites: [],
    objective:
      "Design components with one source of truth and predictable state transitions.",
    resource: "https://react.dev/learn/managing-state",
  },
  {
    id: "async-error-handling",
    name: "Async & Error Handling",
    short: "Async",
    target: 80,
    prerequisites: ["api-design-validation"],
    objective:
      "Handle promise failures, cancellation, and concurrent operations deliberately.",
    resource:
      "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS",
  },
  {
    id: "testing-verification",
    name: "Testing & Verification",
    short: "Testing",
    target: 80,
    prerequisites: ["auth-security-boundaries", "async-error-handling"],
    objective: "Verify boundaries and failure paths with reproducible tests.",
    resource: "https://playwright.dev/docs/intro",
  },
];
