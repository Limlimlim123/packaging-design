import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  }).$extends({
    query: {
      $allOperations({ operation, args, query }) {
        const startTime = Date.now()
        
        return query(args).then((result) => {
          if (process.env.NODE_ENV === 'development') {
            const duration = Date.now() - startTime
            console.log(`[Prisma Query] ${operation} - ${duration}ms`)
            if (duration > 1000) {
              console.warn(`[Prisma Slow Query] ${operation} took ${duration}ms`)
            }
          }
          return result
        }).catch((error) => {
          console.error(`[Prisma Error] ${operation}:`, error)
          throw error
        })
      },
    },
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// 初始化数据库连接
const initDatabase = async () => {
  try {
    await prisma.$connect()
    console.log('✅ 数据库连接成功')
    
    // 验证数据库连接
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ 数据库查询测试成功')
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    process.exit(1) // 如果数据库连接失败，终止应用
  }
}

// 优雅关闭数据库连接
process.on('beforeExit', async () => {
  await prisma.$disconnect()
  console.log('数据库连接已关闭')
})

// 处理未捕获的异常
process.on('uncaughtException', async (error) => {
  console.error('未捕获的异常:', error)
  await prisma.$disconnect()
  process.exit(1)
})

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', async (error) => {
  console.error('未处理的 Promise 拒绝:', error)
  await prisma.$disconnect()
  process.exit(1)
})

// 初始化数据库
initDatabase()

export { prisma }