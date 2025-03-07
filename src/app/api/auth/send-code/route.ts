import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { z } from 'zod'

// 创建 Redis 客户端
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 创建限速器
const rateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'), // 每分钟最多3次
    analytics: true
})

// 验证请求数据的 schema
const sendCodeSchema = z.object({
    phone: z.string().min(11, '手机号必须是11位').max(11, '手机号必须是11位')
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        
        // 验证请求数据
        const validatedData = sendCodeSchema.parse(body)
        const { phone } = validatedData

        // 频率限制检查
        const identifier = `sms:${phone}`
        const result = await rateLimit.limit(identifier)
        
        if (!result.success) {
            return NextResponse.json(
                { error: '发送太频繁，请稍后再试' },
                { status: 429 }
            )
        }

        // 生成验证码
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

        // TODO: 发送验证码到用户手机
        // await sendSMS(phone, verificationCode)

        // 存储验证码到 Redis，5分钟有效
        await redis.set(`code:${phone}`, verificationCode, {
            ex: 300 // 5分钟过期
        })

        return NextResponse.json({
            message: '验证码已发送',
            // 在开发环境中返回验证码方便测试
            code: process.env.NODE_ENV === 'development' ? verificationCode : undefined
        })

    } catch (error) {
        console.error('发送验证码失败:', error)
        
        if (error instanceof z.ZodError) {
            const flattenedErrors = error.flatten()
            const errorMessage = Object.values(flattenedErrors.fieldErrors)[0]?.[0] || '请求数据验证失败'
            
            return NextResponse.json(
                { error: errorMessage },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        )
    }
}