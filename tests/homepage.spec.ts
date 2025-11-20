import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load without errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    // Navigate to homepage
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that there are no console or page errors
    expect(errors).toHaveLength(0);
  });

  test('should have valid HTML structure', async ({ page }) => {
    await page.goto('/');

    // Check for essential HTML elements
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
  });

  test('should not have failed network requests', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for failed requests
    expect(failedRequests).toHaveLength(0);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for basic meta tags
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
  });
});
