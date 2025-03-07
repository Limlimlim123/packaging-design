import { test, expect } from '@playwright/test'

test('设计卡片基础功能', async ({ page }) => {
  await page.goto('/test/design-card')
  
  // 测试图片加载
  await expect(page.locator('.design-card img')).toBeVisible()
  
  // 测试信息显示
  await expect(page.locator('.design-card .name')).toHaveText('测试设计')
  await expect(page.locator('.design-card .type')).toHaveText('盒型')
  
  // 测试快速预览
  await page.click('button:has-text("快速预览")')
  await expect(page.locator('.preview-modal')).toBeVisible()
})