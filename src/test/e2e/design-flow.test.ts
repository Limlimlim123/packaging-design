import { test, expect } from '@playwright/test'
import { mockTemplateData } from '../utils/mocks'

test.describe('设计定制流程', () => {
    test('应该完成完整的设计定制流程', async ({ page }) => {
        // 访问设计详情页
        await page.goto('/designs/test-template-id')
        await expect(page).toHaveTitle(/包装设计定制/)

        // 选择尺寸
        await page.click('button:has-text("选择尺寸")')
        await page.click('text=小号 (100x100x100mm)')

        // 选择材质
        await page.click('button:has-text("选择材质")')
        await page.click('text=标准卡纸')

        // 设置数量
        await page.fill('input[type="number"]', '500')

        // 切换到定制标签页
        await page.click('button:has-text("开始定制")')

        // 添加文字
        await page.fill('input[placeholder="输入文字"]', '测试文本')
        await page.click('button:has-text("添加文字")')

        // 上传Logo
        const fileInput = await page.locator('input[type="file"]')
        await fileInput.setInputFiles('test/fixtures/logo.png')

        // 保存设计
        await page.click('button:has-text("保存设计")')

        // 验证跳转到订单确认页
        await expect(page).toHaveURL(/\/orders\/.*\/confirm/)
    })
})