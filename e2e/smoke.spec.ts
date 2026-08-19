import { test, expect } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";

const testUserEmail = process.env.E2E_CLERK_USER_EMAIL;
if (!testUserEmail) {
  throw new Error("E2E_CLERK_USER_EMAIL must be set to run the Playwright smoke test");
}

test("sign in, create a task, and see it in the list", async ({ page }) => {
  await page.goto("/");

  await clerk.signIn({
    page,
    emailAddress: testUserEmail,
  });

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Your tasks" })).toBeVisible();

  const title = `Playwright smoke test ${Date.now()}`;

  await page.getByRole("button", { name: "New task" }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByRole("button", { name: "Create task" }).click();

  const card = page.getByTestId("task-card").filter({ hasText: title });
  await expect(card).toBeVisible();

  // Clean up the task we created so repeated runs don't pile up in the real account.
  await card.getByRole("button", { name: "Task actions" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
  await expect(card).not.toBeVisible();
});
