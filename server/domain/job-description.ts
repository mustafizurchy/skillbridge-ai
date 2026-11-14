import { randomUUID } from "node:crypto";
import { skillIds, type Workspace, type SkillId } from "../../shared/types";
import { plan, DomainError } from "./engine";
const terms: Record<SkillId, RegExp> = {
  "sql-data-modeling": /\b(sql|database|data model|postgresql)\b/i,
  "api-design-validation": /\b(api|rest|validation|endpoint)\b/i,
  "auth-security-boundaries":
    /\b(auth|authentication|authorization|security|oauth)\b/i,
  "react-state-architecture": /\b(react|component|state management)\b/i,
  "async-error-handling": /\b(async|asynchronous|promise|error handling)\b/i,
  "testing-verification":
    /\b(test|tests|testing|verification|quality assurance)\b/i,
};
export function jobProposal(w: Workspace, text: string) {
  const lines = text
    .split(/\n|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const quotes = skillIds.flatMap((skill) => {
    const quote = lines.find((line) => terms[skill].test(line));
    return quote ? [{ skill, quote: quote.slice(0, 500) }] : [];
  });
  if (!quotes.length)
    throw new DomainError(
      400,
      "NO_REQUIREMENTS",
      "No supported role requirements matched. Try a description mentioning one of the six competencies.",
    );
  const weights = Object.fromEntries(
    skillIds.map((id) => [id, quotes.some((q) => q.skill === id) ? 2 : 1]),
  ) as Record<SkillId, number>;
  const p = plan({ ...w, weights }, [
    "Job description customization: exact quoted keyword matches double the weight of existing competencies. This is deterministic matching, not AI interpretation or an industry standard.",
  ]);
  p.id = randomUUID();
  p.targetWeights = weights;
  p.requirementQuotes = quotes;
  w.roadmaps
    .filter((r) => r.status === "proposed")
    .forEach((r) => (r.status = "rejected"));
  w.roadmaps.push(p);
  return p;
}
