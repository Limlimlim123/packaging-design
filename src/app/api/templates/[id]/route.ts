import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { DesignItem, PackageType, ProductCategory, DesignStyle } from '@/types/design'

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

// 辅助函数：获取错误消息
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const template = await prisma.template.findUnique({
            where: { id: params.id },
            include: {
                stats: true
            }
        })

        if (!template) {
            return NextResponse.json(
                { 
                    error: '模板不存在',
                    code: 'TEMPLATE_NOT_FOUND'
                }, 
                { status: 404 }
            )
        }

        // 转换为前端需要的格式
        const designItem: DesignItem = {
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
        }

        // 将统计数据作为单独的字段返回
        return NextResponse.json({
            ...designItem,
            stats: template.stats ? {
                views: template.stats.views,
                downloads: template.stats.downloads,
                likes: template.stats.likes,
                shares: template.stats.shares
            } : {
                views: 0,
                downloads: 0,
                likes: 0,
                shares: 0
            }
        })
        
    } catch (error) {
        console.error('获取模板详情失败:', error)
        
        return NextResponse.json(
            { 
                error: '获取模板详情失败',
                code: 'INTERNAL_SERVER_ERROR',
                details: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined 
            }, 
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json(
                { 
                    error: '未授权访问',
                    code: 'UNAUTHORIZED'
                }, 
                { status: 401 }
            )
        }

        // 检查用户权限（只有管理员可以更新模板）
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { 
                    error: '没有权限执行此操作',
                    code: 'FORBIDDEN'
                }, 
                { status: 403 }
            )
        }

        const body = await request.json()
        const template = await prisma.template.update({
            where: { id: params.id },
            data: body,
            include: {
                stats: true
            }
        })

        return NextResponse.json(template)
        
    } catch (error) {
        console.error('更新模板失败:', error)
        
        return NextResponse.json(
            { 
                error: '更新模板失败',
                code: 'INTERNAL_SERVER_ERROR',
                details: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined 
            }, 
            { status: 500 }
        )
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json(
                { 
                    error: '未授权访问',
                    code: 'UNAUTHORIZED'
                }, 
                { status: 401 }
            )
        }

        // 检查用户权限（只有管理员可以删除模板）
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { 
                    error: '没有权限执行此操作',
                    code: 'FORBIDDEN'
                }, 
                { status: 403 }
            )
        }

        await prisma.template.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: '删除成功' })
        
    } catch (error) {
        console.error('删除模板失败:', error)
        
        return NextResponse.json(
            { 
                error: '删除模板失败',
                code: 'INTERNAL_SERVER_ERROR',
                details: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined 
            }, 
            { status: 500 }
        )
    }
}