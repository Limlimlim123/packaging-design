import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
    _request: Request,
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

        // 先检查设计是否存在
        const design = await prisma.design.findUnique({
            where: { id: params.id },
            select: { id: true }
        })

        if (!design) {
            return NextResponse.json(
                { error: '设计不存在' },
                { status: 404 }
            )
        }

        // 获取设计的评论
        const comments = await prisma.design.findUnique({
            where: { id: params.id }
        }).comments({
            select: {
                id: true,
                content: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(comments)

    } catch (error) {
        console.error('获取评论列表失败:', error)
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        )
    }
}

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

        const body = await request.json()
        const { content } = body

        if (!content?.trim()) {
            return NextResponse.json(
                { error: '评论内容不能为空' },
                { status: 400 }
            )
        }

        // 先检查设计是否存在
        const design = await prisma.design.findUnique({
            where: { id: params.id },
            select: { id: true }
        })

        if (!design) {
            return NextResponse.json(
                { error: '设计不存在' },
                { status: 404 }
            )
        }

        // 创建评论
        const comment = await prisma.design.update({
            where: { id: params.id },
            data: {
                comments: {
                    create: {
                        content,
                        userId: session.user.id
                    }
                }
            },
            select: {
                comments: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        }).then(result => result.comments[0])

        return NextResponse.json(comment)

    } catch (error) {
        console.error('创建评论失败:', error)
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        )
    }
}