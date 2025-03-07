import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req })

        if (!token) {
            return NextResponse.json(
                { error: '未登录' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { 
                id: token.sub 
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

        if (!user) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt
        })
    } catch (error) {
        console.error('获取用户信息失败:', error)
        return NextResponse.json(
            { error: '会话已过期' },
            { status: 401 }
        )
    }
}