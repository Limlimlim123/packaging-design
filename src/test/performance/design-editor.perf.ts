import { test, expect } from '@playwright/test'

test.describe('设计编辑器性能测试', () => {
    test('加载性能', async ({ page }) => {
        const startTime = Date.now()
        
        await page.goto('/designs/test-id')
        
        // 等待关键元素加载
        await page.waitForSelector('[data-testid="canvas-container"]')
        
        const loadTime = Date.now() - startTime
        expect(loadTime).toBeLessThan(3000) // 3秒内加载完成
    })

    test('画布操作性能', async ({ page }) => {
        await page.goto('/designs/test-id')
        
        // 测试添加100个文本元素的性能
        const startTime = Date.now()
        
        for (let i = 0; i < 100; i++) {
            await page.fill('input[placeholder="输入文字"]', `文本${i}`)
            await page.click('button:has-text("添加文字")')
        }
        
        const operationTime = Date.now() - startTime
        expect(operationTime).toBeLessThan(5000) // 5秒内完成
    })
})