import { test, expect } from "@playwright/test";

test("homepage loads without hydration errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  const res = await page.goto("/", { waitUntil: "networkidle" });
  expect(res?.status()).toBeLessThan(500);

  // Wait for hydration to settle
  await page.waitForTimeout(2000);

  // Fail on React hydration errors (#418, #419, #422, #423, #425)
  const hydrationErrors = errors.filter((e) =>
    /Minified React error #(418|419|422|423|425|310|130)|hydration|did not match/i.test(e)
  );
  expect(hydrationErrors, `Found hydration errors: ${hydrationErrors.join("\n")}`).toHaveLength(0);
});

test("login page renders form", async ({ page }) => {
  const res = await page.goto("/login", { waitUntil: "domcontentloaded" });
  if (res?.status() === 404) test.skip(true, "no /login route");
  await expect(
    page.getByRole("textbox", { name: /email/i }).or(page.getByRole("textbox").first())
  ).toBeVisible({ timeout: 10_000 });
});
