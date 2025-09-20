import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Marketing Site/)
    
    // Check for main content
    await expect(page.locator('main')).toBeVisible()
  })

  test('should have proper SEO meta tags', async ({ page }) => {
    await page.goto('/')
    
    // Check for essential meta tags
    await expect(page.locator('meta[name="description"]')).toBeAttached()
    await expect(page.locator('meta[name="viewport"]')).toBeAttached()
  })

  test('should be accessible', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    await expect(headings.first()).toBeVisible()
    
    // Check for alt text on images
    const images = page.locator('img')
    for (const img of await images.all()) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check that content is visible and accessible on mobile
    await expect(page.locator('main')).toBeVisible()
    
    // Check that navigation is accessible
    const nav = page.locator('nav')
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible()
    }
  })

  test('should have fast loading times', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })
}) 