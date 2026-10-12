import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function api(
  page: Page,
  roles = ["INFRASTRUCTURE_INTERNAL"],
  authenticated = true,
) {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/v1/session")
      return route.fulfill({
        json: { authenticated, username: "operator", roles },
      });
    if (url.pathname === "/api/v1/security/csrf")
      return route.fulfill({
        json: { headerName: "X-XSRF-TOKEN", token: "csrf-test" },
      });
    if (url.pathname.endsWith("/roles"))
      return route.fulfill({ json: ["USER", "INFRASTRUCTURE_INTERNAL"] });
    return route.fulfill({ json: { items: [], total: 0, page: 0, size: 20 } });
  });
}

test("unauthenticated admin navigation goes to login", async ({ page }) => {
  await api(page, [], false);
  await page.goto("/admin/clients");
  await expect(page).toHaveURL(/\/login\?continue=/);
});

test("non-admin receives access denied without login loop", async ({
  page,
}) => {
  await api(page, ["USER"]);
  await page.goto("/admin/identities");
  await expect(
    page.getByRole("heading", { name: "Access denied" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/identities/);
});

test("bad credentials stay on login and show failure", async ({ page }) => {
  await api(page);
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      status: 401,
      json: { authenticated: false, message: "Invalid username or password" },
    }),
  );
  await page.goto("/login");
  await page.getByLabel("Username or email").fill("missing");
  await page.getByLabel("Password", { exact: true }).fill("incorrect");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Invalid username or password",
  );
  await expect(page).toHaveURL(/\/login$/);
});

test("operator login follows server recognized role", async ({ page }) => {
  await api(page);
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({ json: { authenticated: true, redirectUrl: "/admin" } }),
  );
  await page.goto("/login");
  await page.getByLabel("Username or email").fill("operator");
  await page
    .getByLabel("Password", { exact: true })
    .fill("correct-password-123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Security administration" }),
  ).toBeVisible();
});

test("create PKCE client submits exact API contract", async ({ page }) => {
  await api(page);
  let body: Record<string, unknown> | undefined;
  await page.route("**/api/v1/infrastructure/clients", (route) => {
    body = route.request().postDataJSON();
    return route.fulfill({
      json: { clientId: "mobile-client", clientSecret: null },
    });
  });
  await page.goto("/admin/clients");
  await page
    .getByRole("button", { name: "Create client", exact: true })
    .click();
  await page.getByLabel("Client ID").fill("mobile-client");
  await page.getByLabel("Display name").fill("Mobile Client");
  await page
    .getByLabel("Exact redirect URIs (one per line)")
    .fill("https://mobile.example/callback");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Changes saved");
  expect(body).toMatchObject({
    clientId: "mobile-client",
    publicClient: true,
    machine: false,
    redirectUris: ["https://mobile.example/callback"],
  });
});

test("role form persists custom role", async ({ page }) => {
  await api(page);
  let created: unknown;
  await page.route("**/api/v1/infrastructure/roles", (route) => {
    created = route.request().postDataJSON();
    return route.fulfill({ json: { id: "role-1", name: "READER" } });
  });
  await page.goto("/admin/roles");
  await page.getByRole("button", { name: "Create role", exact: true }).click();
  await page.getByLabel("Role name").fill("READER");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Changes saved");
  expect(created).toEqual({ name: "READER" });
});

test("invitation token is forwarded through registration", async ({ page }) => {
  await api(page);
  let body: Record<string, unknown> | undefined;
  await page.route("**/api/v1/accounts/registrations", (route) => {
    body = route.request().postDataJSON();
    return route.fulfill({ status: 202, body: "" });
  });
  await page.goto("/register?invitation=invitation-value");
  await page.getByLabel("Username", { exact: true }).fill("invited-user");
  await page.getByLabel("Email", { exact: true }).fill("invited@example.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("correct-password-123");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Check your inbox" }),
  ).toBeVisible();
  expect(body?.invitationToken).toEqual("invitation-value");
});

test("destructive operation requires explicit confirmation", async ({
  page,
}) => {
  await api(page);
  await page.route(
    "**/api/v1/infrastructure/records/authorizations?**",
    (route) =>
      route.fulfill({
        json: {
          items: [
            { id: "grant-1", principal_name: "alice", client_id: "client" },
          ],
          total: 1,
        },
      }),
  );
  let deleted = false;
  await page.route("**/api/v1/infrastructure/sessions/grant-1", (route) => {
    deleted = true;
    return route.fulfill({ status: 204 });
  });
  await page.goto("/admin/authorizations");
  await page.getByRole("button", { name: "Revoke", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(deleted).toBe(false);
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Revoke completed");
  expect(deleted).toBe(true);
});
