import { test, expect } from '@playwright/test'

test.describe('模板浏览页面', () => {
  test('基础页面加载', async ({ page }) => {
    await page.goto('/')
    
    // 检查页面标题
    await expect(page).toHaveTitle(/包装设计/)
    
    // 检查筛选器是否存在
    await expect(page.locator('select[name="type"]')).toBeVisible()
    await expect(page.locator('select[name="category"]')).toBeVisible()
    await expect(page.locator('select[name="style"]')).toBeVisible()
    
    // 检查是否有模板展示
    const templates = page.locator('.template-card')
    await expect(templates).toHaveCount(12) // 假设每页12个模板
  })

  test('筛选功能', async ({ page }) => {
    await page.goto('/')
    
    // 测试类型筛选
    await page.selectOption('select[name="type"]', '盒型')
    await expect(page.url()).toContain('type=盒型')
    
    // 测试类别筛选
    await page.selectOption('select[name="category"]', '食品')
    await expect(page.url()).toContain('category=食品')
    
    // 测试风格筛选
    await page.selectOption('select[name="style"]', '简约')
    await expect(page.url()).toContain('style=简约')
  })

  test('搜索功能', async ({ page }) => {
    await page.goto('/')
    
    // 输入搜索关键词
    await page.fill('input[placeholder="搜索设计..."]', '礼品盒')
    await page.press('input[placeholder="搜索设计..."]', 'Enter')
    
    // 检查URL和搜索结果
    await expect(page.url()).toContain('search=礼品盒')
  })

  test('分页加载', async ({ page }) => {
    await page.goto('/')
    
    // 记录初始模板数量
    const initialCount = await page.locator('.template-card').count()
    
    // 点击加载更多
    await page.click('button:has-text("加载更多")')
    
    // 验证模板数量增加
    const newCount = await page.locator('.template-card').count()
    expect(newCount).toBeGreaterThan(initialCount)
  })
})