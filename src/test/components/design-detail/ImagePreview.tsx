import { test, expect } from '@playwright/test'

test('图片预览组件测试', async ({ page }) => {
  await page.goto('/designs/1')  // 假设ID为1的设计

  // 测试标签切换
  await expect(page.locator('[data-testid="flat-image"]')).toBeVisible()
  await page.click('text=3D效果图')
  await expect(page.locator('[data-testid="3d-preview"]')).toBeVisible()
  await page.click('text=刀版图')
  await expect(page.locator('[data-testid="dieline-image"]')).toBeVisible()

  // 测试图片加载
  await expect(page.locator('img[alt="平面效果图"]')).toHaveAttribute('src')
  await expect(page.locator('img[alt="刀版图"]')).toHaveAttribute('src')
})