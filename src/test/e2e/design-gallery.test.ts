import { test, expect } from '@playwright/test'

test('设计图库完整流程', async ({ page }) => {
    // 访问设计图库页面
    await page.goto('/designs')

    // 检查页面标题
    await expect(page).toHaveTitle(/设计图库/)

    // 筛选设计
    await page.selectOption('select[name="category"]', '包装盒')
    await page.click('button:text("应用筛选")')

    // 等待筛选结果加载
    await page.waitForSelector('.design-card')

    // 点击第一个设计
    await page.click('.design-card:first-child')

    // 检查设计详情页
    await expect(page).toHaveURL(/\/designs\/\d+/)
    await expect(page.locator('h1')).toContainText('设计详情')
})