import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // 检查用户是否是团队成员
        const membership = await prisma.member.findFirst({
            where: {
                teamId: params.id,
                userId: session.user.id
            }
        })

        if (!membership) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        const members = await prisma.member.findMany({
            where: {
                teamId: params.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            orderBy: [
                { role: 'asc' },
                { createdAt: 'asc' }
            ]
        })

        return NextResponse.json(members)
    } catch (error) {
        console.error('[TEAM_MEMBERS]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // 检查用户权限
        const membership = await prisma.member.findFirst({
            where: {
                teamId: params.id,
                userId: session.user.id,
                role: {
                    in: ['owner', 'admin']
                }
            }
        })

        if (!membership) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        const json = await request.json()
        const member = await prisma.member.create({
            data: {
                teamId: params.id,
                userId: json.userId,
                role: 'member'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        })

        return NextResponse.json(member)
    } catch (error) {
        console.error('[TEAM_MEMBER_CREATE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const memberId = searchParams.get('memberId')

        if (!memberId) {
            return new NextResponse('Missing memberId', { status: 400 })
        }

        // 检查用户权限
        const membership = await prisma.member.findFirst({
            where: {
                teamId: params.id,
                userId: session.user.id,
                role: {
                    in: ['owner', 'admin']
                }
            }
        })

        if (!membership) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        // 不允许删除团队所有者
        const targetMember = await prisma.member.findUnique({
            where: { id: memberId }
        })

        if (targetMember?.role === 'owner') {
            return new NextResponse('Cannot remove owner', { status: 400 })
        }

        // 删除成员
        await prisma.member.delete({
            where: { id: memberId }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[TEAM_MEMBER_DELETE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}