import { test, expect } from '@playwright/test'

test('分页组件测试', async ({ page }) => {
  await page.goto('/test/design-gallery')

  // 测试页码导航
  await test.step('页码导航', async () => {
    await page.click('button:has-text("2")')
    await expect(page.locator('[data-testid="current-page"]')).toHaveText('2')
  })

  // 测试每页条数
  await test.step('修改每页条数', async () => {
    await page.selectOption('select[data-testid="page-size"]', '24')
    await expect(page.locator('.design-card')).toHaveCount(24)
  })

  // 测试快速跳转
  await test.step('页码跳转', async () => {
    await page.fill('[data-testid="jump-input"]', '3')
    await page.click('button:has-text("跳转")')
    await expect(page.locator('[data-testid="current-page"]')).toHaveText('3')
  })
})