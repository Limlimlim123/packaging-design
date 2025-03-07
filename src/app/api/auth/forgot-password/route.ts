import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 验证请求数据的 schema
const forgotPasswordSchema = z.object({
    phone: z.string().min(11, '手机号必须是11位').max(11, '手机号必须是11位')
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        
        // 验证请求数据
        const validatedData = forgotPasswordSchema.parse(body)
        const { phone } = validatedData

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { phone }
        })

        if (!user) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            )
        }

        // TODO: 生成验证码
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

        // TODO: 发送验证码到用户手机
        // await sendSMS(phone, verificationCode)

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