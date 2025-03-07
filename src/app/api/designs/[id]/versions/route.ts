import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// 获取版本列表
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

        // 检查设计是否存在并验证权限
        const design = await prisma.design.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                userId: true
            }
        })

        if (!design) {
            return NextResponse.json(
                { error: '设计不存在' },
                { status: 404 }
            )
        }

        if (design.userId !== session.user.id) {
            return NextResponse.json(
                { error: '无权限查看此设计' },
                { status: 403 }
            )
        }

        // 获取所有版本
        const versions = await prisma.designVersion.findMany({
            where: {
                designId: params.id
            },
            select: {
                id: true,
                name: true,
                content: true,
                thumbnail: true,
                createdAt: true,
                createdBy: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(versions)

    } catch (error) {
        console.error('获取版本列表失败:', error)
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        )
    }
}