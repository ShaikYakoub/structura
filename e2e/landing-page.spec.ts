import { test, expect } from '@playwright/test';

test.describe('Marketing Landing Page', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page title contains "Structura"
    await expect(page).toHaveTitle(/Structura/);
  });

  test('should display hero section with CTA buttons', async ({ page }) => {
    await page.goto('/');
    
    // Look for the main heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    
    // Check for "Start Building for Free" button
    const ctaButton = page.getByRole('link', { name: /start building for free/i });
    await expect(ctaButton).toBeVisible();
  });

  test('should navigate to features section on anchor click', async ({ page }) => {
    await page.goto('/');
    
    // Click on Features link in navbar (if exists)
    const featuresLink = page.getByRole('link', { name: /features/i }).first();
    if (await featuresLink.isVisible()) {
      await featuresLink.click();
      
      // Wait for smooth scroll
      await page.waitForTimeout(500);
      
      // Check if we're near the features section
      const url = page.url();
      expect(url).toContain('#features');
    }
  });

  test('should display pricing section', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to pricing section
    await page.evaluate(() => {
      const pricingSection = document.querySelector('#pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    // Wait for scroll
    await page.waitForTimeout(500);
    
    // Check for pricing cards
    const freeText = page.getByText(/₹0/);
    const proText = page.getByText(/₹999/);
    
    await expect(freeText.or(proText)).toBeVisible();
  });

  test('should open mobile menu on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Look for hamburger menu button
    const menuButton = page.getByRole('button', { name: /menu/i });
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      // Wait for menu animation
      await page.waitForTimeout(300);
      
      // Check if mobile menu items are visible
      const mobileNav = page.getByRole('navigation');
      await expect(mobileNav).toBeVisible();
    }
  });
});
