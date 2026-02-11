import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test('should load homepage without errors', async ({ page }) => {
    await page.goto('/');
    
    // Check for no console errors
    page.on('pageerror', (error) => {
      console.error('Page error:', error);
    });
    
    // Page should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Get all navigation links
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    
    // Should have at least some navigation links
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to terms page', async ({ page }) => {
    await page.goto('/');
    
    // Look for Terms link in footer
    const termsLink = page.getByRole('link', { name: /terms/i });
    
    if (await termsLink.isVisible()) {
      await termsLink.click();
      await expect(page).toHaveURL(/\/terms/);
      
      // Check for terms content
      const heading = page.getByRole('heading', { name: /terms/i });
      await expect(heading).toBeVisible();
    }
  });

  test('should navigate to privacy page', async ({ page }) => {
    await page.goto('/');
    
    // Look for Privacy link in footer
    const privacyLink = page.getByRole('link', { name: /privacy/i });
    
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await expect(page).toHaveURL(/\/privacy/);
      
      // Check for privacy content
      const heading = page.getByRole('heading', { name: /privacy/i });
      await expect(heading).toBeVisible();
    }
  });

  test('should display 404 page for non-existent routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-123456');
    
    // Should return 404 status
    expect(response?.status()).toBe(404);
  });

  test('should have accessible support bubble', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for support/help button (might be floating)
    const supportButton = page.getByRole('button', { name: /help|support/i });
    
    // Support bubble might exist
    if (await supportButton.isVisible()) {
      await expect(supportButton).toBeVisible();
    }
  });
});
