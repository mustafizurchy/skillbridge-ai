import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getAuth } from "firebase-admin/auth";
import { z } from "zod";
import path from "node:path";
import { competencies } from "../shared/catalog";
import { skillIds, type Profile, type Workspace } from "../shared/types";
import {
  DomainError,
  fresh,
  issue,
  submit,
  summarize,
  propose,
  accept,
  now,
} from "./domain/engine";
import { type Store, firebaseApp } from "./repositories/store";
import { mentor } from "./services/gemini";
import { jobProposal } from "./domain/job-description";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const profileSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    context: z.string().max(200),
    weeklyHours: z.number().int().min(1).max(40),
    preferences: z.string().max(300),
    selfReport: z.partialRecord(
      z.enum(skillIds),
      z.number().int().min(1).max(5),
    ),
  })
  .strict();
const idSchema = z.string().uuid();
const safeAttempt = (a: Workspace["assessments"][number]) => a;
export function createApp(
  store: Store,
  options: {
    verifyToken?: (token: string) => Promise<string>;
    storage?: string;
    mentor?: (w: Workspace, m: string) => Promise<string>;
  } = {},
) {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "script-src": ["'self'"],
          "connect-src": [
            "'self'",
            "https://*.googleapis.com",
            "https://*.firebaseapp.com",
            "https://*.firebaseio.com",
            "https://securetoken.googleapis.com",
          ],
          "frame-src": [
            "https://*.firebaseapp.com",
            "https://accounts.google.com",
          ],
          "img-src": ["'self'", "data:", "https://*.googleusercontent.com"],
          "style-src": ["'self'", "'unsafe-inline'"],
        },
      },
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    }),
  );
  app.use(express.json({ limit: "48kb" }), cookieParser());
  app.use((req, res, next) => {
    res.locals.requestId = randomUUID();
    res.setHeader("X-Request-ID", res.locals.requestId);
    if (req.path.startsWith("/api/"))
      res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.get("/api/health", (_req, res) =>
    res.json({ ok: true, data: { status: "ok" } }),
  );
  app.use(
    "/api",
    rateLimit({
      windowMs: 60000,
      limit: 120,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use("/api", (req, _res, next) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const origin = req.get("origin");
      if (
        !origin ||
        origin !== (process.env.APP_ORIGIN ?? "http://localhost:5173")
      )
        throw new DomainError(403, "ORIGIN", "Request origin is not allowed.");
      if (req.get("content-type")?.split(";")[0] !== "application/json")
        throw new DomainError(415, "CONTENT_TYPE", "Use application/json.");
    }
    next();
  });
  const ok = (res: express.Response, data: unknown) =>
    res.json({ ok: true, data });
  app.post(
    "/api/demo/session",
    rateLimit({ windowMs: 3600000, limit: 10 }),
    async (_req, res) => {
      const token = randomBytes(32).toString("hex");
      await store.create(`demo:${hash(token)}`, fresh(true));
      res.cookie("sb_demo", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 4 * 3600000,
        path: "/api",
      });
      ok(res, { created: true });
    },
  );
  app.use("/api", async (req, res, next) => {
    let key: string,
      csrf = "";
    const bearer = req.get("authorization");
    if (bearer?.startsWith("Bearer ")) {
      try {
        const token = bearer.slice(7);
        const uid = options.verifyToken
          ? await options.verifyToken(token)
          : (await getAuth(firebaseApp()).verifyIdToken(token, true)).uid;
        key = `user:${uid}`;
      } catch {
        throw new DomainError(401, "AUTH", "Please sign in again.");
      }
    } else {
      const token = req.cookies.sb_demo;
      if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token))
        throw new DomainError(401, "AUTH", "Sign in or launch the judge demo.");
      key = `demo:${hash(token)}`;
      csrf = hash(`csrf:${token}`);
      if (
        !["GET", "HEAD"].includes(req.method) &&
        req.get("x-csrf-token") !== csrf
      )
        throw new DomainError(
          403,
          "CSRF",
          "Session verification failed. Reload and try again.",
        );
    }
    let w = await store.read(key);
    if (!w && key.startsWith("user:")) {
      try {
        await store.create(key, fresh(false));
      } catch (error) {
        if (!(error instanceof DomainError && error.code === "EXISTS"))
          throw error;
      }
      w = await store.read(key);
    }
    if (!w || (w.expiresAt !== null && w.expiresAt <= Date.now()))
      throw new DomainError(
        401,
        "SESSION_EXPIRED",
        "Session expired. Start a new session.",
      );
    res.locals.key = key;
    res.locals.csrf = csrf;
    res.locals.workspace = w;
    next();
  });
  app.get("/api/workspace", (_req, res) => {
    const w = res.locals.workspace as Workspace;
    ok(res, {
      ...w,
      summary: summarize(w),
      demo: String(res.locals.key).startsWith("demo:"),
      storage: options.storage ?? "memory",
      competencies,
      csrf: res.locals.csrf,
      aiConfigured: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL,
      ),
    });
  });
  app.post("/api/session/logout", async (_req, res) => {
    if (String(res.locals.key).startsWith("demo:")) {
      await store.mutate(res.locals.key, (w) => {
        w.expiresAt = Date.now();
        return true;
      });
    }
    res.clearCookie("sb_demo", { path: "/api" });
    ok(res, { signedOut: true });
  });
  app.post("/api/demo/reset", async (_req, res) => {
    if (!String(res.locals.key).startsWith("demo:"))
      throw new DomainError(
        403,
        "DEMO_ONLY",
        "Only demo data can be reset here.",
      );
    ok(
      res,
      await store.mutate(res.locals.key, (w) => {
        const replacement = fresh(true);
        replacement.aiUsed = w.aiUsed;
        replacement.expiresAt = w.expiresAt;
        Object.assign(w, replacement);
        return { reset: true };
      }),
    );
  });
  app.patch("/api/profile", async (req, res) => {
    const p = profileSchema.partial().parse(req.body);
    ok(
      res,
      await store.mutate(res.locals.key, (w) => {
        const hours = w.profile.weeklyHours,
          preferences = w.profile.preferences;
        Object.assign(w.profile, p);
        if (
          hours !== w.profile.weeklyHours ||
          preferences !== w.profile.preferences
        )
          propose(
            w,
            "Weekly study capacity changed. The proposed plan reserves 20% for revision.",
          );
        return w.profile;
      }),
    );
  });
  app.post("/api/onboarding/complete", async (req, res) => {
    const p = profileSchema.parse(req.body);
    ok(
      res,
      await store.mutate(res.locals.key, (w) => {
        w.profile = { ...p, onboarded: true } as Profile;
        propose(w, "Onboarding preferences and weekly capacity updated.");
        return issue(w, "diagnostic");
      }),
    );
  });
  app.post("/api/assessments", async (req, res) => {
    const p = z
      .object({
        kind: z.enum(["diagnostic", "checkpoint"]),
        skill: z.enum(skillIds).optional(),
      })
      .strict()
      .parse(req.body);
    ok(
      res,
      await store.mutate(res.locals.key, (w) =>
        safeAttempt(issue(w, p.kind, p.skill)),
      ),
    );
  });
  app.post("/api/assessments/:id/submit", async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const { answers } = z
      .object({ answers: z.array(z.number().int().min(0).max(3)).max(10) })
      .strict()
      .parse(req.body);
    ok(res, await store.mutate(res.locals.key, (w) => submit(w, id, answers)));
  });
  app.get("/api/assessments/:id/result", (req, res) => {
    const a = (res.locals.workspace as Workspace).assessments.find(
      (a) => a.id === req.params.id && a.status === "submitted",
    );
    if (!a) throw new DomainError(404, "NOT_FOUND", "Result not found.");
    ok(res, a);
  });
  app.post("/api/roadmap/proposals", async (req, res) => {
    const data = z
      .object({
        jobDescription: z.string().trim().min(20).max(12000).optional(),
      })
      .strict()
      .parse(req.body);
    ok(
      res,
      await store.mutate(res.locals.key, (w) =>
        data.jobDescription
          ? jobProposal(w, data.jobDescription)
          : propose(
              w,
              "Review requested using current evidence and available study time.",
            ),
      ),
    );
  });
  app.post("/api/roadmap/proposals/:id/accept", async (req, res) =>
    ok(
      res,
      await store.mutate(res.locals.key, (w) =>
        accept(w, idSchema.parse(req.params.id)),
      ),
    ),
  );
  app.post("/api/roadmap/proposals/:id/reject", async (req, res) =>
    ok(
      res,
      await store.mutate(res.locals.key, (w) => {
        const p = w.roadmaps.find((p) => p.id === req.params.id);
        if (!p || p.status !== "proposed")
          throw new DomainError(409, "STATE", "No pending proposal found.");
        p.status = "rejected";
        return p;
      }),
    ),
  );
  app.post("/api/tasks/:id/complete", async (req, res) => {
    const { complete } = z
      .object({ complete: z.boolean() })
      .strict()
      .parse(req.body);
    ok(
      res,
      await store.mutate(res.locals.key, (w) => {
        if (
          !w.roadmaps
            .find((r) => r.id === w.activeRoadmapId)
            ?.tasks.some((t) => t.id === req.params.id)
        )
          throw new DomainError(404, "NOT_FOUND", "Task not found.");
        w.taskProgress[String(req.params.id)] = complete;
        return w.taskProgress;
      }),
    );
  });
  app.post("/api/study-logs", async (req, res) => {
    const p = z
      .object({
        hours: z.number().positive().max(24),
        note: z.string().max(300),
      })
      .strict()
      .parse(req.body);
    ok(
      res,
      await store.mutate(res.locals.key, (w) => {
        const entry = { id: randomUUID(), at: now(), ...p };
        w.studyLogs.push(entry);
        return entry;
      }),
    );
  });
  app.post("/api/challenges/:id/submit", async (req, res) => {
    if (req.params.id !== "secure-api")
      throw new DomainError(404, "NOT_FOUND", "Challenge not found.");
    const p = z
      .object({
        validation: z.string().min(20).max(2000),
        authentication: z.string().min(20).max(2000),
        authorization: z.string().min(20).max(2000),
        errors: z.string().min(20).max(2000),
        testing: z.string().min(20).max(2000),
      })
      .strict()
      .parse(req.body);
    const checks = [
      ["validation", /schema|validat/i, /type|length|range|allowlist/i],
      ["authentication", /token|session/i, /verif|valid/i],
      ["authorization", /owner|permission|role/i, /server|backend/i],
      ["errors", /400|422/i, /401|403/i],
      ["testing", /test|assert/i, /unauthor|invalid|other user/i],
    ] as const;
    ok(
      res,
      await store.mutate(res.locals.key, (w) => {
        const event = {
          id: randomUUID(),
          at: now(),
          type: "practical" as const,
          source: "Curated Rubric" as const,
          submission: p,
          rubric: checks.map(([criterion, a, b]) => ({
            criterion,
            met: a.test(p[criterion]) && b.test(p[criterion]),
            explanation:
              "Static keyword coverage check only: confirms required design terms are present, not implementation correctness. No code is executed and no competency score is changed.",
          })),
        };
        w.evidence.push(event);
        return event;
      }),
    );
  });
  app.post(
    "/api/mentor/messages",
    rateLimit({ windowMs: 60000, limit: 5 }),
    async (req, res) => {
      const { message } = z
        .object({ message: z.string().trim().min(1).max(2000) })
        .strict()
        .parse(req.body);
      if (
        !options.mentor &&
        (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL)
      )
        throw new DomainError(
          503,
          "AI_UNAVAILABLE",
          "Live AI is not configured. Use the curated resources in My Plan.",
        );
      await store.reserveAI(
        res.locals.key,
        String(res.locals.key).startsWith("demo:"),
        Number(process.env.AI_GLOBAL_DAILY_LIMIT ?? 100),
      );
      const answer = await (options.mentor ?? mentor)(
        res.locals.workspace,
        message,
      );
      ok(
        res,
        await store.mutate(res.locals.key, (w) => {
          const m = {
            id: randomUUID(),
            at: now(),
            question: message,
            answer,
            source: "Live AI · advisory",
          };
          w.messages.push(m);
          return m;
        }),
      );
    },
  );
  app.get("/api/evidence", (req, res) => {
    const offset = z.coerce
      .number()
      .int()
      .min(0)
      .default(0)
      .parse(req.query.offset);
    const all = [...(res.locals.workspace as Workspace).evidence].reverse();
    ok(res, {
      items: all.slice(offset, offset + 20),
      next: offset + 20 < all.length ? offset + 20 : null,
    });
  });
  app.get("/api/export", (_req, res) => {
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="skillbridge-evidence.json"',
    );
    ok(res, {
      exportedAt: now(),
      ...res.locals.workspace,
      summary: summarize(res.locals.workspace),
    });
  });
  app.use("/api", () => {
    throw new DomainError(404, "NOT_FOUND", "API route not found.");
  });
  if (process.env.NODE_ENV === "production") {
    const dir = path.resolve("dist/client");
    app.use(express.static(dir));
    app.get("/{*path}", (_req, res) =>
      res.sendFile(path.join(dir, "index.html")),
    );
  }
  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      const invalid =
        err instanceof z.ZodError ||
        (err instanceof SyntaxError && "body" in err);
      const status =
        err instanceof DomainError ? err.status : invalid ? 400 : 500;
      const code =
        err instanceof DomainError
          ? err.code
          : invalid
            ? "VALIDATION"
            : "INTERNAL";
      if (status === 500)
        console.error(
          JSON.stringify({
            level: "error",
            requestId: res.locals.requestId,
            code,
          }),
        );
      res.status(status).json({
        ok: false,
        error: {
          code,
          message:
            err instanceof DomainError
              ? err.message
              : invalid
                ? "Check the form fields and try again."
                : "The request could not be completed.",
          requestId: res.locals.requestId,
        },
      });
    },
  );
  return app;
}
