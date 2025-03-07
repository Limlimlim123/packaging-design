import { test, expect } from '@playwright/test'

test.describe('模板详情页面', () => {
  test('基础页面加载', async ({ page }) => {
    // 使用测试数据中的模板ID
    await page.goto('/templates/1')
    
    // 检查预览区域
    await expect(page.locator('.preview-image')).toBeVisible()
    await expect(page.locator('.preview-3d')).toBeVisible()
    await expect(page.locator('.preview-dieline')).toBeVisible()
    
    // 检查信息区域
    await expect(page.locator('.template-name')).toBeVisible()
    await expect(page.locator('.size-options')).toBeVisible()
    await expect(page.locator('.price-info')).toBeVisible()
  })

  test('预览切换', async ({ page }) => {
    await page.goto('/templates/1')
    
    // 切换到3D预览
    await page.click('button:has-text("3D效果图")')
    await expect(page.locator('.preview-3d')).toBeVisible()
    
    // 切换到刀版图
    await page.click('button:has-text("刀版图")')
    await expect(page.locator('.preview-dieline')).toBeVisible()
  })

  test('尺寸选择', async ({ page }) => {
    await page.goto('/templates/1')
    
    // 选择尺寸
    await page.click('.size-option:first-child')
    
    // 检查价格更新
    await expect(page.locator('.price-info')).toContainText('99') // 测试数据中的价格
  })

  test('开始定制', async ({ page }) => {
    await page.goto('/templates/1')
    
    // 选择尺寸
    await page.click('.size-option:first-child')
    
    // 点击开始定制
    await page.click('button:has-text("开始定制")')
    
    // 验证跳转到编辑器页面
    await expect(page.url()).toContain('/editor')
  })
})