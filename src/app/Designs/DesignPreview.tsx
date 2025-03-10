import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DefaultSession } from 'next-auth'

interface CustomSession extends DefaultSession {
  user?: {
    email?: string | null
  } & DefaultSession['user']
}

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const template = await prisma.template.findUnique({
            where: {
                id: params.id,
                status: 'active'
            },
            select: {
                id: true,
                name: true,
                description: true,
                type: true,
                category: true,
                style: true,
                thumbnail: true,
                preview2D: true,
                preview3D: true,
                dieline: true,
                sizes: true,
                price: true,
                createdAt: true,
                updatedAt: true
            }
        })

        if (!template) {
            return new NextResponse('Template not found', { status: 404 })
        }

        return NextResponse.json(template)
    } catch (error) {
        console.error('[TEMPLATE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth() as CustomSession | null
        const userEmail = session?.user?.email

        if (!userEmail?.endsWith('@admin.com')) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        const json = await request.json()
        const template = await prisma.template.update({
            where: {
                id: params.id
            },
            data: {
                name: json.name,
                description: json.description,
                type: json.type,
                category: json.category,
                style: json.style,
                thumbnail: json.thumbnail,
                preview2D: json.preview2D,
                preview3D: json.preview3D,
                dieline: json.dieline,
                sizes: json.sizes,
                price: json.price,
                featured: json.featured,
                status: json.status
            }
        })

        return NextResponse.json(template)
    } catch (error) {
        console.error('[TEMPLATE_UPDATE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function DELETE(
    _request: Request,  // 添加下划线前缀表示这个参数未使用
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth() as CustomSession | null
        const userEmail = session?.user?.email

        if (!userEmail?.endsWith('@admin.com')) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        await prisma.template.update({
            where: {
                id: params.id
            },
            data: {
                status: 'inactive'
            }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[TEMPLATE_DELETE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}