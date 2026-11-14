import { it, expect } from "vitest";
import { fresh, accept } from "../../server/domain/engine";
import { jobProposal } from "../../server/domain/job-description";
it("quotes actual requirements and changes weights only after explicit acceptance", () => {
  const w = fresh(true),
    active = w.activeRoadmapId;
  const text =
    "We use React for our interface. SQL database experience is required.";
  const p = jobProposal(w, text);
  expect(w.activeRoadmapId).toBe(active);
  expect(w.weights["react-state-architecture"]).toBe(1);
  expect(p.requirementQuotes?.every((q) => text.includes(q.quote))).toBe(true);
  accept(w, p.id);
  expect(w.weights["react-state-architecture"]).toBe(2);
  expect(w.weights["auth-security-boundaries"]).toBe(1);
});
it("does not invent requirements when no supported term matches", () => {
  expect(() =>
    jobProposal(fresh(true), "A friendly team with excellent communication."),
  ).toThrow("No supported role requirements");
});
