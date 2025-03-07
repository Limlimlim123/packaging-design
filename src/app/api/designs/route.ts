import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import type { DesignsResponse, ApiError, PackageType, ProductCategory, DesignStyle, DesignPrice, DesignSize } from '@/types/design'
import { Prisma } from '@prisma/client'

// 辅助函数：将字符串转换为 PackageType
function toPackageType(type: string): PackageType {
    switch (type.toLowerCase()) {
        case 'box':
            return 'box' as PackageType
        case 'bag':
            return 'bag' as PackageType
        case 'label':
            return 'label' as PackageType
        case 'wrapper':
            return 'wrapper' as PackageType
        default:
            return 'box' as PackageType // 默认值
    }
}

// 辅助函数：将字符串转换为 ProductCategory
function toProductCategory(category: string): ProductCategory {
    switch (category.toLowerCase()) {
        case 'food':
            return 'food' as ProductCategory
        case 'clothing':
            return 'clothing' as ProductCategory
        case 'electronics':
            return 'electronics' as ProductCategory
        case 'beauty':
            return 'beauty' as ProductCategory
        case 'healthcare':
            return 'healthcare' as ProductCategory
        default:
            return 'other' as ProductCategory
    }
}

// 辅助函数：将字符串数组转换为 DesignStyle
function toDesignStyle(styles: string[]): DesignStyle {
    return styles[0]?.toLowerCase() as DesignStyle || 'modern' as DesignStyle
}

// 辅助函数：将数字转换为 DesignPrice
function toDesignPrice(price: number | null): DesignPrice {
    return {
        base: price || 0,
        unit: 'CNY'
    }
}

// 辅助函数：将 JSON 数据转换为 DesignSize 数组
function toDesignSizes(sizes: any): DesignSize[] {
    if (!sizes || typeof sizes !== 'object') {
        return []
    }
    try {
        // 假设 sizes 是一个对象数组，每个对象包含 width、height、length 属性
        return Array.isArray(sizes) ? sizes : [sizes]
    } catch (error) {
        console.error('解析尺寸数据失败:', error)
        return []
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { code: '401', message: '未登录' },
                { status: 401 }
            )
        }

        // 获取查询参数
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const search = searchParams.get('search')
        const page = Number(searchParams.get('page')) || 1
        const pageSize = Number(searchParams.get('pageSize')) || 10

        // 构建查询条件
        const where: Prisma.DesignWhereInput = {
            userId: session.user.id,
            ...(status && { status }),
            ...(search && {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive
                        }
                    },
                    {
                        description: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive
                        }
                    }
                ]
            })
        }

        // 获取总数
        const total = await prisma.design.count({ where })

        // 计算分页
        const skip = (page - 1) * pageSize
        const totalPages = Math.ceil(total / pageSize)

        // 获取设计列表
        const designs = await prisma.design.findMany({
            where,
            skip,
            take: pageSize,
            select: {
                id: true,
                name: true,
                description: true,
                status: true,
                thumbnail: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                template: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        category: true,
                        style: true,
                        thumbnail: true,
                        preview2D: true,
                        preview3D: true,
                        sizes: true,
                        price: true
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
                        thumbnail: true,
                        content: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        // 转换数据结构以匹配 DesignItem 类型
        const formattedDesigns = designs.map(design => ({
            id: design.id,
            name: design.name,
            description: design.description || '',
            status: design.status,
            type: toPackageType(design.template.type),
            category: toProductCategory(design.template.category),
            style: toDesignStyle(design.template.style),
            thumbnailUrl: design.versions[0]?.thumbnail || design.template.thumbnail || '',
            images: {
                flat: design.template.preview2D || '',
                threeD: design.template.preview3D || '',
                dieline: '' // 添加 dieline 字段
            },
            templateId: design.template.id,
            templateName: design.template.name,
            price: toDesignPrice(Number(design.template.price)),
            sizes: toDesignSizes(design.template.sizes),
            materials: [], // 从 content 中提取或设置默认值
            createdAt: design.createdAt.toISOString(),
            updatedAt: design.updatedAt.toISOString()
        }))

        const response: DesignsResponse = {
            designs: formattedDesigns,
            total,
            page,
            pageSize,
            totalPages
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('获取设计列表失败:', error)
        const apiError: ApiError = {
            code: '500',
            message: '服务器错误'
        }
        return NextResponse.json(apiError, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { code: '401', message: '未登录' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { name, templateId, content } = body

        if (!name || !templateId || !content) {
            return NextResponse.json(
                { code: '400', message: '缺少必要参数' },
                { status: 400 }
            )
        }

        // 创建新设计
        const design = await prisma.design.create({
            data: {
                name,
                templateId,
                content,
                userId: session.user.id,
                versions: {
                    create: {
                        name: 'V1',
                        content,
                        createdBy: session.user.id
                    }
                }
            },
            select: {
                id: true,
                name: true,
                status: true,
                createdAt: true
            }
        })

        return NextResponse.json(design)

    } catch (error) {
        console.error('创建设计失败:', error)
        return NextResponse.json(
            { code: '500', message: '服务器错误' },
            { status: 500 }
        )
    }
}