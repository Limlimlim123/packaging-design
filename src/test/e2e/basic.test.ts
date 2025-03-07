import { test, expect } from '@playwright/test'

test('基础页面访问测试', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/包装设计/)
})