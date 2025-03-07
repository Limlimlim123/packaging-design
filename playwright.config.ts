import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const config = defineConfig({
    testDir: './src/test/e2e',  // 更新测试目录路径
    timeout: 30000,
    expect: {
        timeout: 5000
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: [
        ['html'],
        ['json', { outputFile: 'test-results.json' }]
    ],
    use: {
        baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        }
    ],
    outputDir: 'test-results',
    preserveOutput: 'failures-only',
    testMatch: '**/*.e2e.ts',
    webServer: {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120000
    }
})

export default config