import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// 验证请求数据的 schema
const loginSchema = z.object({
    phone: z.string().min(11).max(11),
    password: z.string().min(6)
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        
        // 验证请求数据
        const validatedData = loginSchema.parse(body)
        
        // 查找用户
        const user = await prisma.user.findUnique({
            where: {
                phone: validatedData.phone
            },
            select: {
                id: true,
                phone: true,
                password: true,
                status: true
            }
        })

        if (!user || !user.password) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            )
        }

        if (user.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: '账号已被禁用' },
                { status: 403 }
            )
        }

        const isValid = await bcrypt.compare(validatedData.password, user.password)

        if (!isValid) {
            return NextResponse.json(
                { error: '密码错误' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            message: '登录成功',
            userId: user.id
        })

    } catch (error) {
        console.error('登录失败:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: '无效的请求数据' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        )
    }
}