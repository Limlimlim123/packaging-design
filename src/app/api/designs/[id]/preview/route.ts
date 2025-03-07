import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
    _request: Request,  // 添加下划线前缀表示这个参数是有意未使用的
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { error: '未登录' },
                { status: 401 }
            )
        }

        // 获取设计及其最新版本
        const design = await prisma.design.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                name: true,
                description: true,
                status: true,
                userId: true,
                template: {
                    select: {
                        id: true,
                        name: true,
                        preview2D: true,
                        preview3D: true,
                        dieline: true,
                        sizes: true
                    }
                },
                versions: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
                    select: {
                        id: true,
                        name: true,
                        content: true,
                        thumbnail: true,
                        createdAt: true
                    }
                }
            }
        })

        if (!design) {
            return NextResponse.json(
                { error: '设计不存在' },
                { status: 404 }
            )
        }

        // 检查权限
        if (design.userId !== session.user.id) {
            return NextResponse.json(
                { error: '无权限查看此设计' },
                { status: 403 }
            )
        }

        return NextResponse.json(design)

    } catch (error) {
        console.error('获取设计预览失败:', error)
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        )
    }
}