import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

// 获取设计列表
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { error: '未登录' },
                { status: 401 }
            )
        }

        const designs = await prisma.design.findMany({
            where: {
                userId: session.user.id
            },
            select: {
                id: true,
                name: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                versions: {
                    select: {
                        id: true,
                        name: true,  // 使用 name 替代 version
                        thumbnail: true,
                        createdAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'  // 按创建时间排序
                    },
                    take: 1
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return NextResponse.json(designs)

    } catch (error) {
        console.error('获取设计列表失败:', error)
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        )
    }
}