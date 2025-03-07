import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(
    request: Request,
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

        // 获取请求数据
        const body = await request.json()
        const { content } = body

        if (!content) {
            return NextResponse.json(
                { error: '设计内容不能为空' },
                { status: 400 }
            )
        }

        // 检查设计是否存在
        const design = await prisma.design.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                userId: true,
                versions: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
                    select: {
                        name: true
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
                { error: '无权限修改此设计' },
                { status: 403 }
            )
        }

        // 生成新版本名称
        const latestVersion = design.versions[0]?.name || 'V0'
        const newVersionNumber = parseInt(latestVersion.replace('V', '')) + 1
        const newVersionName = `V${newVersionNumber}`

        // 创建新版本
        const newVersion = await prisma.designVersion.create({
            data: {
                name: newVersionName,
                content,
                designId: params.id,
                createdBy: session.user.id
            }
        })

        return NextResponse.json({
            message: '设计已更新',
            version: newVersion
        })

    } catch (error) {
        console.error('更新设计失败:', error)
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        )
    }
}