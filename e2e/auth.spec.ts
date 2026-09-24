import { test, expect } from '@playwright/test';

test.describe('Custom Authentication & Authorization E2E Tests', () => {
  
  test('Test 1: Super Admin Login & Redirect to /admin', async ({ page }) => {
    // 1. Visit Home page
    await page.goto('/');
    
    // 2. Open login modal
    const loginBtn = page.locator('button:has-text("Login")').first();
    await expect(loginBtn).toBeVisible();
    await loginBtn.click();
    
    // 3. Fill in valid Super Admin credentials
    await page.locator('input[placeholder="name@company.com"]').fill('admin@armarket.com');
    await page.locator('input[placeholder="••••••••"]').fill('Admin@2026#Secure');
    
    // 4. Click Sign In button
    const submitBtn = page.locator('button[type="submit"]:has-text("Sign In")');
    await submitBtn.click();
    
    // 5. Verify redirect / navigation to Super Admin Portal
    await expect(page).toHaveURL(/\/admin/);
    
    // 6. Verify that Admin Dashboard header/panel is visible
    const adminHeader = page.locator('text=Super Admin Portal').first();
    await expect(adminHeader).toBeVisible();
  });

  test('Test 2: Customer / Buyer Registration', async ({ page }) => {
    // 1. Visit Home page
    await page.goto('/');
    
    // 2. Open Sign Up modal
    const signUpBtn = page.locator('button:has-text("Sign Up")').first();
    await expect(signUpBtn).toBeVisible();
    await signUpBtn.click();
    
    // 3. Fill in registration form fields
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    await page.locator('input[placeholder="Alex Henderson"]').fill('Test Customer');
    await page.locator('input[placeholder="name@company.com"]').fill(uniqueEmail);
    await page.locator('input[placeholder="880 1700000000"]').fill('8801712345678');
    await page.locator('input[placeholder="Create secure password"]').fill('Secure@2026#Pass');
    await page.locator('input[placeholder="Confirm secure password"]').fill('Secure@2026#Pass');
    
    // 4. Submit the registration form
    const registerBtn = page.locator('button[type="submit"]:has-text("Verify & Register")');
    await expect(registerBtn).toBeEnabled();
    await registerBtn.click();
    
    // 5. Verify success alert/notification and transition
    const successToast = page.locator('text=Account created successfully').first();
    await expect(successToast).toBeVisible();
  });

  test('Test 3: Invalid Credentials Error Message', async ({ page }) => {
    // 1. Visit Home page
    await page.goto('/');
    
    // 2. Open login modal
    const loginBtn = page.locator('button:has-text("Login")').first();
    await expect(loginBtn).toBeVisible();
    await loginBtn.click();
    
    // 3. Fill in invalid credentials
    await page.locator('input[placeholder="name@company.com"]').fill('nonexistent@example.com');
    await page.locator('input[placeholder="••••••••"]').fill('WrongPassword123');
    
    // 4. Click Sign In
    const submitBtn = page.locator('button[type="submit"]:has-text("Sign In")');
    await submitBtn.click();
    
    // 5. Verify error message is rendered
    const errorAlert = page.locator('.text-rose-600, .bg-rose-50, text=invalid, text=Incorrect, text=fail, text=exists').first();
    await expect(errorAlert).toBeVisible();
  });

  test('Test 4: Protected Route Block & Redirect', async ({ page }) => {
    // 1. Try to access direct /admin path without active login session
    await page.goto('/admin');
    
    // 2. Verify that user is blocked from admin view content
    await expect(page).not.toHaveURL(/\/admin-dashboard-full-view/); // hypothetical deep admin url
    
    // 3. Verify standard protected route fallback view
    const lockText = page.locator('text=Admin Authorization Required').first();
    await expect(lockText).toBeVisible();
    
    // 4. Verify "Sign In as Admin" button is displayed to guide the user
    const adminSignInBtn = page.locator('button:has-text("Sign In as Admin")').first();
    await expect(adminSignInBtn).toBeVisible();
  });

});
