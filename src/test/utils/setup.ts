import { expect, test as base } from '@playwright/test'
import { mockTemplateData } from './mocks'

// 扩展测试上下文
const test = base.extend({
    // 添加自定义夹具
    context: async ({ context }, use) => {
        // 设置模拟响应
        await context.route('**/api/templates/*', (route) => {
            return route.fulfill({
                status: 200,
                body: JSON.stringify(mockTemplateData)
            })
        })

        await use(context)
    }
})

export { test, expect }