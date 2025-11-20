import { test, expect } from '@playwright/test';

test.describe('Static Pages', () => {
  const pages = [
    { url: '/', name: 'Homepage' },
    { url: '/about', name: 'About Page' },
    { url: '/categories', name: 'Categories Page' },
    { url: '/states', name: 'States Page' },
  ];

  for (const { url, name } of pages) {
    test(`${name} should load without errors`, async ({ page }) => {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      page.on('pageerror', error => {
        errors.push(error.message);
      });

      const response = await page.goto(url);

      // Check response status
      expect(response?.status()).toBeLessThan(400);

      await page.waitForLoadState('networkidle');

      // Check for errors
      if (errors.length > 0) {
        console.log(`Errors found on ${name}:`, errors);
      }
      expect(errors).toHaveLength(0);
    });

    test(`${name} should not have 404 errors`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).not.toBe(404);
    });

    test(`${name} should not have 500 errors`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).not.toBe(500);
    });
  }
});

test.describe('Error Handling', () => {
  test('should handle non-existent routes gracefully', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    // Should return 404 or redirect
    const status = response?.status();
    expect(status === 404 || status === 301 || status === 302).toBeTruthy();
  });

  test('should not expose sensitive error information', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    const content = await page.content();

    // Check that sensitive info is not exposed
    expect(content.toLowerCase()).not.toContain('database');
    expect(content.toLowerCase()).not.toContain('sql');
    expect(content.toLowerCase()).not.toContain('stack trace');
  });
});

test.describe('Performance', () => {
  test('pages should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });
});
