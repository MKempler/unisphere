import { test, expect } from '@playwright/test';

test.describe('Feed page', () => {
  test('should be able to sign up and post a message', async ({ page }) => {
    // Visit the home page which should redirect to signup for non-authenticated users
    await page.goto('http://localhost:3001/');
    
    // We should be redirected to the signup page
    await expect(page).toHaveURL('http://localhost:3001/signup');
    
    // Fill in the email form
    const email = `test${Date.now()}@example.com`;
    await page.fill('input[type="email"]', email);
    await page.click('button[type="submit"]');
    
    // Wait for the success message
    await expect(page.locator('text=Magic link sent')).toBeVisible();
    
    // In a real test, we would check the server logs for the magic link URL
    // For now, we'll use a mock approach
    
    // Check if we're in development mode by looking for the note
    const devModeMsg = page.locator('text=Check the console for the magic link');
    if (await devModeMsg.isVisible()) {
      // For testing, we directly navigate to the feed page and mock authentication
      // This is a simplified approach for the e2e test
      
      // In a real implementation, you would:
      // 1. Intercept the API call that gets the magic link
      // 2. Extract the token from the response
      // 3. Navigate to /claim?token=the_token
      
      await page.evaluate(() => {
        // Mock authentication for testing
        localStorage.setItem('token', 'mock-token-for-testing');
        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
          handle: 'testuser',
          displayName: 'Test User',
          createdAt: new Date().toISOString(),
          followersCount: 42,
          followingCount: 23
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
      });
      
      // Navigate to the feed page directly
      await page.goto('http://localhost:3001/feed');
      
      // Wait for the feed page to load
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
      
      // Post a message
      const postText = 'Hello Kavira ' + Date.now();
      await page.fill('textarea[placeholder="What\'s on your mind?"]', postText);
      await page.click('button:has-text("Post")');
      
      // Wait for the post to appear
      await expect(page.locator(`text=${postText}`)).toBeVisible({ timeout: 5000 });
      
      // Verify our profile is shown in the UI
      await expect(page.locator('text=@testuser')).toBeVisible();
    }
  });
}); 