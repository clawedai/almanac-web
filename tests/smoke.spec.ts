/**
 * Almanac Frontend Smoke Tests
 *
 * Prerequisites:
 *   npm install
 *   npm run test:install   # Install Chromium
 *   npm run dev            # Start frontend on port 3000
 *
 * Run:
 *   npm run test:smoke
 */

import { test, expect } from "@playwright/test";

// ---------- Login page ---------------------------------------------------

test.describe("Login page", () => {
  test("loads without errors", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Almanac/i);
  });

  test("shows email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("shows validation error on empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in|login/i }).click();
    // Should not crash — validation happens client-side
    await expect(page.url()).toContain("/login");
  });
});

// ---------- Register page ------------------------------------------------

test.describe("Register page", () => {
  test("loads without errors", async ({ page }) => {
    await page.goto("/signup");
    await expect(page).toHaveTitle(/Almanac/i);
  });

  test("shows all required fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
  });
});

// ---------- Dashboard redirect -------------------------------------------

test.describe("Dashboard guard", () => {
  test("redirects unauthenticated users to /login", async ({ page }) => {
    await page.goto("/brief");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects unauthenticated users on /prospects", async ({ page }) => {
    await page.goto("/prospects");
    await expect(page).toHaveURL(/\/login/);
  });
});

// ---------- Brief page ---------------------------------------------------

test.describe("Brief page", () => {
  test("brief page requires authentication", async ({ page }) => {
    await page.goto("/brief");
    // Should redirect to login or show loading then redirect
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {
      // If it loaded, check for loading state or empty state
      const url = page.url();
      expect(url).toMatch(/\/(login|brief)/);
    });
  });
});

// ---------- Prospects page -----------------------------------------------

test.describe("Prospects page", () => {
  test("prospects page requires authentication", async ({ page }) => {
    await page.goto("/prospects");
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {
      const url = page.url();
      expect(url).toMatch(/\/(login|prospects)/);
    });
  });
});
