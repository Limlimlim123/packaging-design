import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { DesignItem, PackageType, ProductCategory, DesignStyle } from '@/types/design'

// 辅助函数：获取错误消息
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

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
            return 'box' as PackageType
    }
}

// 辅助函数：将字符串转换为 ProductCategory
function toProductCategory(category: string): ProductCategory {
    switch (category.toLowerCase()) {
        case 'food':
            return 'food' as ProductCategory
        case 'beverage':
            return 'beverage' as ProductCategory
        case 'clothing':
            return 'clothing' as ProductCategory
        case 'electronics':
            return 'electronics' as ProductCategory
        case 'cosmetics':
            return 'cosmetics' as ProductCategory
        case 'healthcare':
            return 'healthcare' as ProductCategory
        case 'toys':
            return 'toys' as ProductCategory
        case 'stationery':
            return 'stationery' as ProductCategory
        case 'other':
            return 'other' as ProductCategory
        default:
            return 'other' as ProductCategory
    }
}

// 辅助函数：将字符串转换为单个 DesignStyle
function toDesignStyle(style: string): DesignStyle {
    switch (style.toLowerCase()) {
        case 'minimal':
            return 'minimal' as DesignStyle
        case 'modern':
            return 'modern' as DesignStyle
        case 'classic':
            return 'classic' as DesignStyle
        case 'luxury':
            return 'luxury' as DesignStyle
        case 'playful':
            return 'playful' as DesignStyle
        case 'natural':
            return 'natural' as DesignStyle
        case 'elegant':
            return 'elegant' as DesignStyle
        case 'bold':
            return 'bold' as DesignStyle
        default:
            return 'minimal' as DesignStyle
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        
        // 获取查询参数
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const sort = searchParams.get('sort') || 'createdAt'
        const order = searchParams.get('order')?.toLowerCase() === 'asc' ? 'asc' : 'desc'
        const type = searchParams.get('type')
        const category = searchParams.get('category')
        const style = searchParams.get('style')
        const search = searchParams.get('search')

        // 构建查询条件
        const where = {
            ...(type && { type }),
            ...(category && { category }),
            ...(style && { style: { has: style } }),
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ]
            })
        }

        // 获取总数
        const total = await prisma.template.count({ where })

        // 获取分页数据
        const templates = await prisma.template.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            include: {
                stats: true
            },
            orderBy: {
                [sort]: order
            }
        })

        // 转换为前端需要的格式
        const items: DesignItem[] = templates.map(template => ({
            id: template.id,
            name: template.name,
            type: toPackageType(template.type),
            category: toProductCategory(template.category),
            style: toDesignStyle(template.style[0] || 'minimal'),
            thumbnailUrl: template.thumbnail || '',
            images: {
                flat: template.preview2D || '',
                threeD: template.preview3D || '',
                dieline: template.dieline || ''
            },
            price: {
                base: Number(template.price),
                unit: 'CNY'
            },
            sizes: template.sizes ? JSON.parse(JSON.stringify(template.sizes)) : [],
            materials: [], // 如果需要材料数据，需要在 schema 中添加相应的关系
            tags: [], // 如果需要标签数据，需要在 schema 中添加相应的关系
            description: template.description || '',
            createdAt: template.createdAt.toISOString(),
            updatedAt: template.updatedAt.toISOString(),
            isFavorited: false // 如果需要收藏功能，需要在 schema 中添加相应的关系
        }))

        return NextResponse.json({
            items,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        })
        
    } catch (error) {
        console.error('获取模板列表失败:', error)
        
        return NextResponse.json(
            {
                error: '获取模板列表失败',
                code: 'INTERNAL_SERVER_ERROR',
                details: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
            },
            { status: 500 }
        )
    }
}