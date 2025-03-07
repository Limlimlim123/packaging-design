import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

async function deploy() {
  try {
    // 运行数据库迁移
    console.log('Running database migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })

    // 验证数据库连接
    const prisma = new PrismaClient()
    await prisma.$connect()
    console.log('Database connection successful')

    // 初始化必要数据
    console.log('Seeding initial data...')
    await prisma.template.createMany({
      skipDuplicates: true,
      data: [
        // 初始模板数据
      ]
    })

    console.log('Deployment preparation completed')
  } catch (error) {
    console.error('Deployment preparation failed:', error)
    process.exit(1)
  }
}

deploy()