import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 更新模板统计信息
async function updateStats(templateId: string, type: 'views' | 'downloads' | 'likes' | 'shares') {
    try {
        // 先尝试查找现有的统计记录
        const existingStats = await prisma.templateStats.findUnique({
            where: { templateId }
        })

        if (!existingStats) {
            // 如果不存在，创建新的统计记录
            return await prisma.templateStats.create({
                data: {
                    templateId,
                    [type]: 1
                }
            })
        }

        // 如果存在，更新统计数据
        return await prisma.templateStats.update({
            where: { templateId },
            data: { [type]: { increment: 1 } }
        })
    } catch (error) {
        console.error(`[TEMPLATE_STATS_UPDATE_${type.toUpperCase()}]`, error)
        throw error
    }
}

// 获取模板统计信息
export async function GET(
    _request: Request,  // 添加下划线前缀表示这个参数是有意未使用的
    { params }: { params: { id: string } }
) {
    try {
        // 更新浏览次数
        await updateStats(params.id, 'views')

        // 获取模板信息
        const template = await prisma.template.findUnique({
            where: { id: params.id },
            include: {
                stats: true
            }
        })

        if (!template) {
            return new NextResponse('Template not found', { status: 404 })
        }

        return NextResponse.json(template)

    } catch (error) {
        console.error('[TEMPLATE_PREVIEW]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

// 更新模板统计数据（如点赞、分享等）
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { type } = await request.json()

        if (!type || !['likes', 'shares', 'downloads'].includes(type)) {
            return new NextResponse('Invalid type', { status: 400 })
        }

        const stats = await updateStats(params.id, type as 'likes' | 'shares' | 'downloads')
        return NextResponse.json(stats)

    } catch (error) {
        console.error('[TEMPLATE_STATS_UPDATE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}