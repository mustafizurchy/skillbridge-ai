import { it, expect, vi, afterEach } from "vitest";
import { fresh } from "../../server/domain/engine";
const { generate } = vi.hoisted(() => ({ generate: vi.fn() }));
vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: generate };
  },
}));
import { mentor } from "../../server/services/gemini";
afterEach(() => {
  vi.unstubAllEnvs();
  generate.mockReset();
});
it("validates structured output and omits the student name from prompts", async () => {
  vi.stubEnv("GEMINI_API_KEY", "test-secret");
  vi.stubEnv("GEMINI_MODEL", "test-model");
  generate.mockResolvedValue({
    text: JSON.stringify({ answer: "Validate input on the server." }),
  });
  expect(await mentor(fresh(true), "Help with validation")).toContain(
    "Validate input",
  );
  expect(generate.mock.calls[0][0].contents).not.toContain("Alex Rivera");
  expect(generate.mock.calls[0][0].config.httpOptions.timeout).toBe(15000);
});
it("rejects malformed AI output without fabricating success", async () => {
  vi.stubEnv("GEMINI_API_KEY", "test-secret");
  vi.stubEnv("GEMINI_MODEL", "test-model");
  generate.mockResolvedValue({ text: "not json" });
  await expect(mentor(fresh(true), "Help")).rejects.toMatchObject({
    code: "AI_UNAVAILABLE",
    status: 503,
  });
});
it("turns provider errors into safe unavailable responses", async () => {
  vi.stubEnv("GEMINI_API_KEY", "test-secret");
  vi.stubEnv("GEMINI_MODEL", "test-model");
  generate.mockRejectedValue(new Error("private upstream detail"));
  await expect(mentor(fresh(true), "Help")).rejects.toThrow(
    "progress is preserved",
  );
});
