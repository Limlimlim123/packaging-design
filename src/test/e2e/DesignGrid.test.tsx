import { test, expect } from '@playwright/test'

test('设计列表功能', async ({ page }) => {
  await page.goto('/test/design-grid')
  
  // 测试筛选
  await page.selectOption('select[name="type"]', '盒型')
  await expect(page.locator('.design-card')).toHaveCount(12)
  
  // 测试搜索
  await page.fill('input[placeholder="搜索设计..."]', '礼品盒')
  await expect(page.locator('.design-card')).toHaveCount(6)
  
  // 测试无限滚动
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(page.locator('.design-card')).toHaveCount(18)
})