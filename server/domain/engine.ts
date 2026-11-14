import { randomUUID } from "node:crypto";
import { competencies } from "../../shared/catalog";
import {
  skillIds,
  type Workspace,
  type Summary,
  type Roadmap,
  type Attempt,
  type SkillId,
} from "../../shared/types";
import { bank, publicQuestion } from "./questions";
export class DomainError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export const now = () => new Date().toISOString();
export function summarize(w: Workspace): Summary {
  const skills = competencies.map((c) => {
    const seen = new Set<string>();
    const evidence = w.evidence
      .flatMap((e) => e.outcomes ?? [])
      .filter((o) => o.skill === c.id && o.eligible)
      .filter((o) => {
        if (seen.has(o.family)) return false;
        seen.add(o.family);
        return true;
      })
      .slice(-10);
    return {
      id: c.id,
      count: evidence.length,
      score:
        evidence.length >= 3
          ? Math.round(
              (100 * evidence.filter((o) => o.correct).length) /
                evidence.length,
            )
          : null,
      state:
        evidence.length >= 3
          ? ("Assessed" as const)
          : evidence.length
            ? ("Insufficient evidence" as const)
            : ("Unassessed" as const),
      weight: w.weights[c.id],
    };
  });
  const assessed = skills.filter((s) => s.score !== null),
    weight = assessed.reduce((n, s) => n + s.weight, 0);
  return {
    skills,
    score: weight
      ? Math.round(
          assessed.reduce((n, s) => n + s.score! * s.weight, 0) / weight,
        )
      : null,
    coverage: Math.round(
      (100 * weight) / skills.reduce((n, s) => n + s.weight, 0),
    ),
  };
}
export function plan(w: Workspace, reasons: string[]): Roadmap {
  const summary = summarize(w);
  const ranked = [...competencies].sort((a, b) => {
    const score = (id: SkillId) => {
      const s = summary.skills.find((s) => s.id === id)!;
      return (s.score === null ? 45 : 100 - s.score) * s.weight;
    };
    return score(b.id) - score(a.id);
  });
  const ordered: typeof competencies = [];
  const seen = new Set<string>();
  const visit = (id: SkillId) => {
    if (seen.has(id)) return;
    seen.add(id);
    const c = competencies.find((c) => c.id === id)!;
    c.prerequisites.forEach(visit);
    ordered.push(c);
  };
  ranked.forEach((c) => visit(c.id));
  const capacity = Math.floor(w.profile.weeklyHours * 60 * 0.8);
  let week = 1,
    used = 0;
  const tasks = ordered.map((c) => {
    const minutes = Math.min(90, capacity);
    if (used + minutes > capacity) {
      week++;
      used = 0;
    }
    used += minutes;
    const s = summary.skills.find((s) => s.id === c.id)!;
    return {
      id: `practice-${c.id}`,
      skill: c.id,
      title: `Practice ${c.short}: build, explain, verify`,
      minutes,
      week,
      why:
        s.score === null
          ? `${s.state}: collect evidence before drawing conclusions. Prerequisites are scheduled first.`
          : `Assessed ${s.score}/100 against our ${c.target}/100 rubric target. New evidence can raise or lower this result.`,
      objective: c.objective,
      resource: c.resource,
      practice: `Build a small example demonstrating: ${c.objective} Explain one failure case, then take a checkpoint.`,
      prerequisites: c.prerequisites,
    };
  });
  return {
    id: randomUUID(),
    parentId: w.activeRoadmapId || null,
    createdAt: now(),
    status: "proposed",
    reasons,
    tasks,
    fingerprint: JSON.stringify({
      hours: w.profile.weeklyHours,
      preferences: w.profile.preferences,
      weights: w.weights,
      scores: summary.skills.map((s) => s.score),
    }),
  };
}
export function propose(w: Workspace, reason: string) {
  const p = plan(w, [reason]);
  const active = w.roadmaps.find((r) => r.id === w.activeRoadmapId);
  if (active?.fingerprint === p.fingerprint) return null;
  const existing = w.roadmaps.find(
    (r) =>
      r.status === "proposed" &&
      r.fingerprint === p.fingerprint &&
      r.parentId === p.parentId,
  );
  if (existing) return existing;
  w.roadmaps
    .filter((r) => r.status === "proposed")
    .forEach((r) => (r.status = "rejected"));
  w.roadmaps.push(p);
  return p;
}
export function accept(w: Workspace, id: string) {
  const p = w.roadmaps.find((r) => r.id === id);
  if (!p) throw new DomainError(404, "NOT_FOUND", "Proposal not found.");
  if (w.activeRoadmapId === id) return p;
  if (
    p.status !== "proposed" ||
    p.parentId !== w.activeRoadmapId ||
    p.fingerprint !==
      plan({ ...w, weights: p.targetWeights ?? w.weights }, []).fingerprint
  )
    throw new DomainError(
      409,
      "STALE_PROPOSAL",
      "This proposal is stale. Generate a new proposal.",
    );
  const old = w.roadmaps.find((r) => r.id === w.activeRoadmapId);
  if (old) old.status = "accepted";
  p.status = "active";
  w.activeRoadmapId = p.id;
  if (p.targetWeights) w.weights = p.targetWeights;
  return p;
}
export function issue(
  w: Workspace,
  kind: Attempt["kind"],
  skill: SkillId = "api-design-validation",
) {
  const pending = w.assessments.find(
    (a) =>
      a.status === "issued" &&
      a.kind === kind &&
      (kind === "diagnostic" || a.questions[0].skill === skill),
  );
  if (pending) return pending;
  const seen = new Set(
    w.evidence.flatMap((e) => e.outcomes ?? []).map((o) => o.family),
  );
  const candidates =
    kind === "diagnostic"
      ? [
          ...bank.filter((q) => q.skill === "sql-data-modeling").slice(0, 3),
          ...bank
            .filter((q) => q.skill === "api-design-validation")
            .slice(0, 3),
          ...bank
            .filter((q) => q.skill === "auth-security-boundaries")
            .slice(0, 2),
        ]
      : bank
          .filter((q) => q.skill === skill)
          .sort(
            (a, b) => Number(seen.has(a.family)) - Number(seen.has(b.family)),
          )
          .slice(0, 5);
  const a: Attempt = {
    id: randomUUID(),
    kind,
    questions: candidates.map(publicQuestion),
    status: "issued",
    createdAt: now(),
  };
  w.assessments.push(a);
  return a;
}
export function submit(w: Workspace, id: string, answers: number[]) {
  const a = w.assessments.find((a) => a.id === id);
  if (!a) throw new DomainError(404, "NOT_FOUND", "Assessment not found.");
  if (a.status === "submitted") return a;
  if (
    answers.length !== a.questions.length ||
    answers.some(
      (v, i) =>
        !Number.isInteger(v) || v < 0 || v >= a.questions[i].options.length,
    )
  )
    throw new DomainError(
      400,
      "INVALID_ANSWERS",
      "Answer every question with a valid option.",
    );
  const seen = new Set(
    w.evidence.flatMap((e) => e.outcomes ?? []).map((o) => o.family),
  );
  a.outcomes = a.questions.map((q, i) => {
    const key = bank.find((b) => b.id === q.id)!;
    return {
      questionId: q.id,
      family: q.family,
      skill: q.skill,
      correct: answers[i] === key.correct,
      eligible: !seen.has(q.family),
      answer: answers[i],
      correctAnswer: key.correct,
      explanation: key.explanation,
    };
  });
  a.score = Math.round(
    (100 * a.outcomes.filter((o) => o.correct).length) / a.questions.length,
  );
  a.passed =
    a.kind === "checkpoint" && a.outcomes.filter((o) => o.correct).length >= 4;
  a.status = "submitted";
  a.submittedAt = now();
  w.evidence.push({
    id: randomUUID(),
    at: now(),
    type: "assessment",
    source: "Server graded",
    attemptId: id,
    outcomes: a.outcomes,
  });
  propose(
    w,
    "New eligible assessment evidence changed the score profile. Review priorities before updating your plan.",
  );
  return a;
}
export function fresh(demo: boolean): Workspace {
  const w: Workspace = {
    profile: {
      name: demo ? "Alex Rivera" : "",
      context: demo ? "University student" : "",
      weeklyHours: 6,
      preferences: "Practical projects",
      selfReport: {},
      onboarded: demo,
    },
    assessments: [],
    evidence: [],
    roadmaps: [],
    activeRoadmapId: "",
    taskProgress: {},
    studyLogs: [],
    messages: [],
    weights: Object.fromEntries(skillIds.map((id) => [id, 1])) as Record<
      SkillId,
      number
    >,
    expiresAt: demo ? Date.now() + 4 * 60 * 60 * 1000 : null,
    aiUsed: 0,
    version: 0,
  };
  if (demo) {
    const a = issue(w, "diagnostic");
    submit(w, a.id, [1, 2, 0, 0, 0, 0, 1, 2]);
    w.evidence.forEach((e) => (e.source = "Sample student"));
    w.roadmaps = [];
  }
  const p = plan(w, [
    "Initial plan based on our documented role rubric, prerequisites, and 80% of weekly capacity.",
  ]);
  p.status = "active";
  p.parentId = null;
  w.roadmaps = [p];
  w.activeRoadmapId = p.id;
  return w;
}
