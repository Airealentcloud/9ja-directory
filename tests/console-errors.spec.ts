import { test, expect } from '@playwright/test';

test.describe('Console Errors and Warnings', () => {
  test('should not have React hydration errors', async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Hydration') || text.includes('hydration')) {
        hydrationErrors.push(text);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (hydrationErrors.length > 0) {
      console.log('Hydration errors found:', hydrationErrors);
    }

    expect(hydrationErrors).toHaveLength(0);
  });

  test('should not have unhandled promise rejections', async ({ page }) => {
    const rejections: string[] = [];

    page.on('pageerror', error => {
      if (error.message.includes('Unhandled Promise')) {
        rejections.push(error.message);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

    expect(rejections).toHaveLength(0);
  });

  test('should not have missing image errors', async ({ page }) => {
    const imageErrors: string[] = [];

    page.on('response', response => {
      if (response.url().match(/\.(jpg|jpeg|png|gif|svg|webp)$/i) && response.status() >= 400) {
        imageErrors.push(`Failed to load image: ${response.url()} - Status: ${response.status()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (imageErrors.length > 0) {
      console.log('Image loading errors:', imageErrors);
    }

    expect(imageErrors).toHaveLength(0);
  });

  test('should not have CSS loading errors', async ({ page }) => {
    const cssErrors: string[] = [];

    page.on('response', response => {
      if (response.url().match(/\.css$/i) && response.status() >= 400) {
        cssErrors.push(`Failed to load CSS: ${response.url()} - Status: ${response.status()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(cssErrors).toHaveLength(0);
  });

  test('should not have JavaScript loading errors', async ({ page }) => {
    const jsErrors: string[] = [];

    page.on('response', response => {
      if (response.url().match(/\.js$/i) && response.status() >= 400) {
        jsErrors.push(`Failed to load JS: ${response.url()} - Status: ${response.status()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(jsErrors).toHaveLength(0);
  });

  test('should track all console warnings', async ({ page }) => {
    const warnings: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Log warnings for visibility but don't fail
    if (warnings.length > 0) {
      console.log('Console warnings found:', warnings);
    }
  });
});
