import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../server/app";
import { MemoryStore } from "../../server/repositories/store";
import { bank } from "../../server/domain/questions";
import type { Attempt } from "../../shared/types";
const origin = "http://localhost:5173";
async function session(app: ReturnType<typeof createApp>) {
  const agent = request.agent(app);
  await agent
    .post("/api/demo/session")
    .set("Origin", origin)
    .send({})
    .expect(200);
  const view = (await agent.get("/api/workspace").expect(200)).body.data;
  const post = (url: string, body: object) =>
    agent
      .post(url)
      .set("Origin", origin)
      .set("X-CSRF-Token", view.csrf)
      .send(body);
  return { agent, view, post };
}
describe("protected API and learning workflow", () => {
  it("revokes a demo session on logout even if the old cookie is replayed", async () => {
    const app = createApp(new MemoryStore());
    const created = await request(app)
      .post("/api/demo/session")
      .set("Origin", origin)
      .send({});
    const cookie = String(created.headers["set-cookie"][0]).split(";")[0];
    const workspace = (
      await request(app).get("/api/workspace").set("Cookie", cookie)
    ).body.data;
    await request(app)
      .post("/api/session/logout")
      .set("Cookie", cookie)
      .set("Origin", origin)
      .set("X-CSRF-Token", workspace.csrf)
      .send({})
      .expect(200);
    await request(app).get("/api/workspace").set("Cookie", cookie).expect(401);
  });
  it("rejects malformed JSON as a client error", async () => {
    await request(createApp(new MemoryStore()))
      .post("/api/demo/session")
      .set("Origin", origin)
      .set("Content-Type", "application/json")
      .send("{broken")
      .expect(400);
  });
  it("rejects unauthenticated access, forged origins, missing csrf and malformed tokens", async () => {
    const app = createApp(new MemoryStore(), {
      verifyToken: async () => {
        throw Error();
      },
    });
    await request(app).get("/api/workspace").expect(401);
    await request(app)
      .get("/api/workspace")
      .set("Authorization", "Bearer forged")
      .expect(401);
    await request(app)
      .post("/api/demo/session")
      .set("Origin", "https://evil.example")
      .send({})
      .expect(403);
    const { agent } = await session(app);
    await agent
      .post("/api/assessments")
      .set("Origin", origin)
      .send({ kind: "diagnostic" })
      .expect(403);
  });
  it("isolates sessions and enforces server grading/idempotency/plan acceptance", async () => {
    const app = createApp(new MemoryStore());
    const a = await session(app),
      b = await session(app);
    const issued: Attempt = (
      await a
        .post("/api/assessments", {
          kind: "checkpoint",
          skill: "api-design-validation",
        })
        .expect(200)
    ).body.data;
    expect(JSON.stringify(issued)).not.toContain("correctAnswer");
    const answers = issued.questions.map(
      (q) => bank.find((x) => x.id === q.id)!.correct,
    );
    await b
      .post(`/api/assessments/${issued.id}/submit`, { answers })
      .expect(404);
    const results = await Promise.all([
      a.post(`/api/assessments/${issued.id}/submit`, { answers }),
      a.post(`/api/assessments/${issued.id}/submit`, { answers }),
    ]);
    expect(results.every((r) => r.status === 200)).toBe(true);
    const w = (await a.agent.get("/api/workspace")).body.data;
    expect(w.evidence).toHaveLength(a.view.evidence.length + 1);
    expect(w.summary.skills[1].score).toBe(75);
    const p = w.roadmaps.find(
      (r: { status: string }) => r.status === "proposed",
    );
    expect(p).toBeTruthy();
    await a.post(`/api/roadmap/proposals/${p.id}/accept`, {}).expect(200);
    expect(
      (await a.agent.get("/api/workspace")).body.data.activeRoadmapId,
    ).toBe(p.id);
    expect(
      (await b.agent.get("/api/workspace")).body.data.evidence,
    ).toHaveLength(b.view.evidence.length);
  });
  it("rejects forged grades and invalid answer sets", async () => {
    const { post } = await session(createApp(new MemoryStore()));
    await post("/api/assessments", { kind: "checkpoint", score: 100 }).expect(
      400,
    );
    const a = (await post("/api/assessments", { kind: "checkpoint" })).body
      .data;
    await post(`/api/assessments/${a.id}/submit`, { answers: [1] }).expect(400);
  });
  it("verifies bearer identity through injected verifier and separates users", async () => {
    const app = createApp(new MemoryStore(), {
      verifyToken: async (token) => {
        if (token === "valid-a") return "a";
        if (token === "valid-b") return "b";
        throw Error("invalid");
      },
    });
    await request(app)
      .patch("/api/profile")
      .set("Origin", origin)
      .set("Authorization", "Bearer valid-a")
      .send({ name: "Alice" })
      .expect(200);
    const b = (
      await request(app)
        .get("/api/workspace")
        .set("Authorization", "Bearer valid-b")
    ).body.data;
    expect(b.profile.name).toBe("");
  });
  it("returns honest AI failures without changing evidence and enforces shared limits", async () => {
    const store = new MemoryStore();
    const app = createApp(store, {
      mentor: async () => "A bounded advisory response.",
    });
    const a = await session(app);
    for (let i = 0; i < 3; i++)
      await a
        .post("/api/mentor/messages", { message: "Explain validation" })
        .expect(200);
    await a
      .post("/api/mentor/messages", { message: "Explain again" })
      .expect(429);
    expect((await a.agent.get("/api/workspace")).body.data.evidence).toEqual(
      a.view.evidence,
    );
    await a.post("/api/demo/reset", {}).expect(200);
    expect((await a.agent.get("/api/workspace")).body.data.aiUsed).toBe(3);
  });
  it("keeps AI unavailable when credentials are absent", async () => {
    const { post } = await session(createApp(new MemoryStore()));
    const response = await post("/api/mentor/messages", { message: "Help" });
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe("AI_UNAVAILABLE");
  });
  it("records practical coverage independently and exports the portfolio", async () => {
    const { post, agent, view } = await session(createApp(new MemoryStore()));
    await post("/api/challenges/secure-api/submit", {
      validation: "Validate schema types and field length.",
      authentication: "Verify the authentication token on every request.",
      authorization: "Check ownership on the server for this resource.",
      errors: "Return 400 for invalid input and 403 for access denial.",
      testing: "Test unauthorized users and assert invalid input is rejected.",
    }).expect(200);
    const exported = (await agent.get("/api/export").expect(200)).body.data;
    expect(exported.summary).toEqual(view.summary);
    expect(
      exported.evidence.at(-1).rubric.every((r: { met: boolean }) => r.met),
    ).toBe(true);
  });
});
