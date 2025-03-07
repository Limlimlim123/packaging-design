import pino from 'pino'
import { createPinoBrowserSend, createWriteStream } from 'pino-logflare'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

// 定义请求日志接口
interface RequestLog {
  requestId: string
  method: string
  url: string
  status: number
  duration: number
  userAgent?: string
  ip?: string
  referer?: string
}

// 定义错误日志接口
interface ErrorLog {
  message: string
  stack?: string
}

// 创建 Logflare 流
const stream = createWriteStream({
  apiKey: process.env.LOGFLARE_API_KEY,
  sourceToken: process.env.LOGFLARE_SOURCE_ID
})

// 创建 logger 实例
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  browser: {
    transmit: createPinoBrowserSend({
      apiKey: process.env.LOGFLARE_API_KEY,
      sourceToken: process.env.LOGFLARE_SOURCE_ID
    })
  },
  // 添加额外的默认字段
  base: {
    env: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0'
  },
  // 时间格式化
  timestamp: pino.stdTimeFunctions.isoTime
}, process.env.NODE_ENV === 'production' ? stream : undefined)

// 请求日志中间件 (适配 Next.js Edge Runtime)
export async function requestLogger(
  req: NextRequest,
  res: NextResponse,
  next: () => Promise<void>
) {
  const start = Date.now()
  
  // 为每个请求生成唯一ID
  const requestId = req.headers.get('x-request-id') || randomUUID()
  
  try {
    await next()
    
    // 记录请求日志
    const log: RequestLog = {
      requestId,
      method: req.method,
      url: req.url,
      status: res.status,
      duration: Date.now() - start,
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.ip || req.headers.get('x-forwarded-for') || undefined,
      referer: req.headers.get('referer') || undefined
    }
    
    logger.info(log)
  } catch (error) {
    // 记录错误日志
    const errorLog: ErrorLog = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }
    
    logger.error({
      requestId,
      method: req.method,
      url: req.url,
      error: errorLog
    })
    
    throw error
  }
}

// 导出错误日志助手函数
export function logError(error: Error, context: Record<string, unknown> = {}) {
  const errorLog: ErrorLog = {
    message: error.message,
    stack: error.stack
  }
  
  logger.error({
    error: errorLog,
    ...context
  })
}

// 导出类型定义
export type { RequestLog, ErrorLog }