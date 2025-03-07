import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// 验证请求数据的 schema
const resetPasswordSchema = z.object({
    phone: z.string().min(11, '手机号必须是11位').max(11, '手机号必须是11位'),
    code: z.string().min(6, '验证码必须是6位').max(6, '验证码必须是6位'),
    newPassword: z.string().min(6, '密码至少6位')
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        
        // 验证请求数据
        const validatedData = resetPasswordSchema.parse(body)
        const { phone, code, newPassword } = validatedData

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

        // TODO: 验证验证码
        if (process.env.NODE_ENV !== 'development' && code !== '123456') {
            return NextResponse.json(
                { error: '验证码错误' },
                { status: 400 }
            )
        }

        // 加密新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // 更新密码
        await prisma.user.update({
            where: { phone },
            data: { password: hashedPassword }
        })

        return NextResponse.json({
            message: '密码重置成功'
        })

    } catch (error) {
        console.error('重置密码失败:', error)
        
        if (error instanceof z.ZodError) {
            // 使用 flatten() 获取所有错误信息
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