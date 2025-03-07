import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sign } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// 辅助函数：获取错误消息
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('收到登录请求:', body)

        const { phone, password } = body

        // 验证请求数据
        if (!phone || !password) {
            return NextResponse.json(
                {
                    error: '手机号和密码不能为空',
                    code: 'MISSING_FIELDS'
                },
                { status: 400 }
            )
        }

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { phone }
        })

        if (!user || !user.password) {
            return NextResponse.json(
                {
                    error: '手机号或密码错误',
                    code: 'INVALID_CREDENTIALS'
                },
                { status: 401 }
            )
        }

        // 验证密码
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return NextResponse.json(
                {
                    error: '手机号或密码错误',
                    code: 'INVALID_CREDENTIALS'
                },
                { status: 401 }
            )
        }

        // 检查用户状态
        if (user.status === 'INACTIVE') {
            return NextResponse.json(
                {
                    error: '账号已被禁用',
                    code: 'ACCOUNT_DISABLED'
                },
                { status: 403 }
            )
        }

        // 生成 token
        const token = sign(
            {
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '7d' }
        )

        // 创建响应并设置 cookie
        const response = NextResponse.json(
            {
                message: '登录成功',
                user: {
                    id: user.id,
                    phone: user.phone,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role
                },
                token
            },
            { status: 200 }
        )

        // 直接使用 response.cookies 设置 cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        return response

    } catch (error) {
        console.error('登录失败:', error)
        
        return NextResponse.json(
            {
                error: '登录失败',
                code: 'INTERNAL_SERVER_ERROR',
                details: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
            },
            { status: 500 }
        )
    }
}