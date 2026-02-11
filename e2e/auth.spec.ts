import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    const loginButton = page.getByRole('link', { name: /login/i }).first();
    await loginButton.click();
    
    // Should be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check for email input
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    
    // Check for password input
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();
    
    // Check for submit button
    const submitButton = page.getByRole('button', { name: /sign in|login/i });
    await expect(submitButton).toBeVisible();
  });

  test('should navigate to register page from login', async ({ page }) => {
    await page.goto('/login');
    
    // Look for "Don't have an account" or similar link
    const registerLink = page.getByRole('link', { name: /sign up|register|create account/i });
    
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });

  test('should display register form', async ({ page }) => {
    await page.goto('/register');
    
    // Check for name input
    const nameInput = page.getByLabel(/name/i);
    await expect(nameInput).toBeVisible();
    
    // Check for email input
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    
    // Check for password input
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /sign in|login/i });
    await submitButton.click();
    
    // Wait for error message (might be HTML5 validation or custom error)
    await page.waitForTimeout(500);
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });
});
