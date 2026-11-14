import { test, expect } from "@playwright/test";
import { bank } from "../../server/domain/questions";
test("judge completes checkpoint, inspects evidence, accepts revision and restores progress", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Launch Judge Demo" }).click();
  await expect(
    page.getByRole("heading", { name: /Let’s build on what you know/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/overview-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Assessments", exact: true }).click();
  const issued = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/assessments") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Start checkpoint" }).click();
  const attempt = (await (await issued).json()).data;
  for (let i = 0; i < attempt.questions.length; i++) {
    const q = attempt.questions[i];
    const answer = bank.find((b) => b.id === q.id)!.correct;
    await page.getByLabel(q.options[answer], { exact: true }).check();
    if (i < attempt.questions.length - 1)
      await page.getByRole("button", { name: "Next question" }).click();
  }
  await page.getByRole("button", { name: "Review submission" }).click();
  await page
    .getByRole("button", { name: "Submit assessment", exact: true })
    .click();
  await expect(
    page.getByText("Quiz checkpoint passed", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Review my roadmap" }).click();
  await page.getByRole("button", { name: "Accept updated plan" }).click();
  await expect(
    page.getByText("Revision accepted. Your task progress is preserved."),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("Active revision 2")).toBeVisible();
  await page.getByRole("link", { name: "Evidence", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your evidence portfolio." }),
  ).toBeVisible();
  await expect(page.getByText("Server graded", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile navigation and honest failed-save feedback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Launch Judge Demo" }).click();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Profile & preferences." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.route("**/api/profile", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: { message: "Service unavailable. Progress was not saved." },
      }),
    }),
  );
  await page.getByLabel("Display name").fill("Unsaved name");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("alert")).toContainText("Progress was not saved");
  await page.reload();
  await expect(page.getByLabel("Display name")).toHaveValue("Alex Rivera");
});

test("job requirements remain proposed until accepted and practical work does not award scores", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Launch Judge Demo" }).click();
  await expect(
    page.getByRole("heading", { name: /Let’s build on what you know/ }),
  ).toBeVisible();
  const before = await page.request.get("/api/workspace");
  const initial = (await before.json()).data;
  await page.getByRole("link", { name: "My Plan", exact: true }).click();
  await page
    .getByText("Customize this role with a job description", { exact: true })
    .click();
  await page
    .getByLabel("Job description", { exact: true })
    .fill("We build React components. SQL database knowledge is required.");
  await page
    .getByRole("button", { name: "Preview requirement weighting" })
    .click();
  await expect(
    page.getByText("We build React components.", { exact: false }).first(),
  ).toBeVisible();
  const pending = (await (await page.request.get("/api/workspace")).json())
    .data;
  expect(pending.weights["react-state-architecture"]).toBe(1);
  await page.getByRole("button", { name: "Accept updated plan" }).click();
  await expect(
    page.getByText("Revision accepted. Your task progress is preserved."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Assessments", exact: true }).click();
  const fields = [
    ["Input validation", "Validate schema field types and length ranges."],
    ["Authentication", "Verify the session token before handling input."],
    ["Authorization", "Enforce owner permissions on the server."],
    [
      "HTTP errors",
      "Return 400 for invalid requests and 403 for forbidden access.",
    ],
    [
      "Testing",
      "Test unauthorized requests and assert invalid data is rejected.",
    ],
  ];
  for (const [label, value] of fields)
    await page
      .getByRole("textbox", { name: new RegExp(`^${label}`) })
      .fill(value);
  await page
    .getByRole("button", { name: "Submit design for rubric review" })
    .click();
  await page
    .getByRole("link", { name: "Inspect rubric results in Evidence →" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Practical design review" }),
  ).toBeVisible();
  const after = (await (await page.request.get("/api/workspace")).json()).data;
  expect(
    after.summary.skills.map((s: { score: number | null }) => s.score),
  ).toEqual(
    initial.summary.skills.map((s: { score: number | null }) => s.score),
  );
  expect(after.evidence.at(-1).source).toBe("Curated Rubric");
});
