import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// 验证请求数据的 schema
const registerSchema = z.object({
    phone: z.string().min(11).max(11),
    password: z.string().min(6),
    name: z.string().min(2)
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        
        // 验证请求数据
        const validatedData = registerSchema.parse(body)
        const { phone, password, name } = validatedData

        // 检查手机号是否已注册
        const existingUser = await prisma.user.findUnique({
            where: { phone }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: '手机号已注册' },
                { status: 409 }
            )
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10)

        // 创建新用户
        const user = await prisma.user.create({
            data: {
                phone,
                password: hashedPassword,
                name,
                role: 'USER',
                status: 'ACTIVE'
            },
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true
            }
        })

        return NextResponse.json({
            message: '注册成功',
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt
            }
        })

    } catch (error) {
        console.error('注册失败:', error)
        
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