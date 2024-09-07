import { expect, test } from "@playwright/test";

test("can search and navigate to a search result", async ({ page }) => {
  await page.goto("/HomePage");
  await expect(page.locator("#search-button")).toBeVisible();
  await page.keyboard.press("Meta+k");
  await page.getByPlaceholder("Search for a note…").fill("codespaces x11");
  await page
    .getByRole("link", {
      name: "Run an X11 display server and noVNC on Codespaces",
    })
    .first()
    .click();
  await expect(page).toHaveURL(/CodespacesDisplayServer/);
});
