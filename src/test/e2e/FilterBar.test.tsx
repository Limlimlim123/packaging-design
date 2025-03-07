import { test, expect } from '@playwright/test'

test('筛选栏功能测试', async ({ page }) => {
  await page.goto('/test/design-gallery')

  // 测试类型筛选
  await test.step('包装类型筛选', async () => {
    await page.click('button:has-text("筛选")')
    await page.click('text=盒型')
    await expect(page.locator('[data-testid="active-filters"]')).toContainText('盒型')
  })

  // 测试搜索功能
  await test.step('搜索功能', async () => {
    await page.fill('[placeholder="搜索设计..."]', '礼品盒')
    // 等待防抖
    await page.waitForTimeout(500)
    await expect(page.locator('.design-card')).toHaveCount(6)
  })

  // 测试移动端筛选
  await test.step('移动端筛选', async () => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    await page.click('[data-testid="mobile-filter-button"]')
    await expect(page.locator('.filter-sheet')).toBeVisible()
  })

  // 测试重置功能
  await test.step('重置筛选', async () => {
    await page.click('button:has-text("重置")')
    await expect(page.locator('[data-testid="active-filters"]')).toBeEmpty()
  })
})