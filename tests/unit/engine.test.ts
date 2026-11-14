import { describe, it, expect } from "vitest";
import {
  fresh,
  issue,
  submit,
  summarize,
  plan,
  propose,
  accept,
} from "../../server/domain/engine";
import { bank } from "../../server/domain/questions";
import { competencies } from "../../shared/catalog";
const correct = (a: ReturnType<typeof issue>) =>
  a.questions.map((q) => bank.find((b) => b.id === q.id)!.correct);
describe("evidence engine", () => {
  it("leaves missing competency null and excludes self reports", () => {
    const w = fresh(false);
    w.profile.selfReport["sql-data-modeling"] = 5;
    expect(summarize(w).coverage).toBe(0);
    expect(summarize(w).skills.every((s) => s.score === null)).toBe(true);
  });
  it("uses a narrow 8-question diagnostic with insufficient evidence for two-question security", () => {
    const w = fresh(false),
      a = issue(w, "diagnostic");
    expect(a.questions).toHaveLength(8);
    submit(w, a.id, correct(a));
    const s = summarize(w);
    expect(s.score).toBe(100);
    expect(s.coverage).toBe(33);
    expect(s.skills[2].state).toBe("Insufficient evidence");
    expect(s.skills[2].score).toBeNull();
  });
  it("grades checkpoints at four of five and never leaks answer keys", () => {
    for (const count of [3, 4]) {
      const w = fresh(false),
        a = issue(w, "checkpoint");
      expect(
        a.questions.every((q) => !("correct" in q) && !("explanation" in q)),
      ).toBe(true);
      const answers = correct(a).map((v, i) => (i < count ? v : (v + 1) % 4));
      expect(submit(w, a.id, answers).passed).toBe(count === 4);
    }
  });
  it("idempotently submits an attempt and ignores repeats of question families", () => {
    const w = fresh(false),
      a = issue(w, "checkpoint", "react-state-architecture");
    submit(w, a.id, correct(a));
    submit(w, a.id, [0, 0, 0, 0, 0]);
    expect(w.evidence).toHaveLength(1);
    const b = issue(w, "checkpoint", "react-state-architecture");
    submit(w, b.id, correct(b));
    expect(w.evidence[1].outcomes?.every((o) => !o.eligible)).toBe(true);
    expect(summarize(w).skills[3].count).toBe(5);
  });
  it("can decrease scores when new eligible answers are wrong", () => {
    const w = fresh(false),
      a = issue(w, "diagnostic");
    submit(w, a.id, correct(a));
    const b = issue(w, "checkpoint", "sql-data-modeling");
    submit(
      w,
      b.id,
      correct(b).map((v) => (v + 1) % 4),
    );
    expect(summarize(w).skills[0].score).toBe(38);
  });
  it("uses a rolling window of ten distinct families", () => {
    const w = fresh(false);
    w.evidence.push({
      id: "window",
      at: new Date().toISOString(),
      type: "assessment",
      source: "Server graded",
      outcomes: Array.from({ length: 12 }, (_, i) => ({
        questionId: String(i),
        family: String(i),
        skill: "sql-data-modeling",
        correct: i >= 2,
        eligible: true,
        answer: 1,
        correctAnswer: 1,
        explanation: "",
      })),
    });
    expect(summarize(w).skills[0]).toMatchObject({ score: 100, count: 10 });
  });
  it("weights assessed coverage separately from score", () => {
    const w = fresh(false),
      a = issue(w, "checkpoint", "sql-data-modeling");
    w.weights["sql-data-modeling"] = 5;
    submit(w, a.id, correct(a));
    expect(summarize(w).coverage).toBe(50);
  });
  it("does not give competency for task completion or study hours", () => {
    const w = fresh(false);
    w.taskProgress["practice-sql-data-modeling"] = true;
    w.studyLogs.push({ id: "log", at: "", hours: 4, note: "Practice" });
    expect(summarize(w).score).toBeNull();
  });
});
describe("adaptive planning", () => {
  it("orders all prerequisites before dependents and respects 80% weekly capacity", () => {
    for (const hours of [1, 2, 6, 40]) {
      const w = fresh(true);
      w.profile.weeklyHours = hours;
      const p = plan(w, []);
      for (const t of p.tasks) {
        const c = competencies.find((c) => c.id === t.skill)!;
        for (const pre of c.prerequisites)
          expect(p.tasks.findIndex((t) => t.skill === pre)).toBeLessThan(
            p.tasks.indexOf(t),
          );
      }
      for (const week of new Set(p.tasks.map((t) => t.week)))
        expect(
          p.tasks
            .filter((t) => t.week === week)
            .reduce((n, t) => n + t.minutes, 0),
        ).toBeLessThanOrEqual(hours * 60 * 0.8);
    }
  });
  it("does not silently replace active plans; accepts a version and preserves completion", () => {
    const w = fresh(true),
      id = w.activeRoadmapId;
    w.profile.weeklyHours = 1;
    w.taskProgress["practice-sql-data-modeling"] = true;
    const p = propose(w, "Capacity changed")!;
    expect(w.activeRoadmapId).toBe(id);
    accept(w, p.id);
    expect(w.activeRoadmapId).toBe(p.id);
    expect(w.taskProgress["practice-sql-data-modeling"]).toBe(true);
    expect(w.roadmaps.find((r) => r.id === id)?.status).toBe("accepted");
    expect(accept(w, p.id).id).toBe(p.id);
  });
  it("rejects stale proposals and avoids meaningless duplicates", () => {
    const w = fresh(true);
    expect(propose(w, "No change")).toBeNull();
    w.profile.weeklyHours = 1;
    const p = propose(w, "Capacity")!;
    expect(propose(w, "Duplicate")!.id).toBe(p.id);
    w.profile.weeklyHours = 2;
    expect(() => accept(w, p.id)).toThrow("stale");
  });
});
