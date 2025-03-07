import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 辅助函数：获取错误消息
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

// 更新模板使用次数
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { type } = await request.json()
        
        if (!['views', 'uses', 'downloads'].includes(type)) {
            return NextResponse.json(
                {
                    error: '无效的统计类型',
                    code: 'INVALID_STAT_TYPE',
                    details: `支持的类型: views, uses, downloads`
                },
                { status: 400 }
            )
        }

        const stats = await prisma.templateStats.update({
            where: { templateId: params.id },
            data: { [type]: { increment: 1 } }
        })

        return NextResponse.json(stats)
        
    } catch (error) {
        console.error('更新使用次数失败:', error)
        
        return NextResponse.json(
            {
                error: '更新使用次数失败',
                code: 'INTERNAL_SERVER_ERROR',
                details: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
            },
            { status: 500 }
        )
    }
}

// 获取模板统计信息
export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const stats = await prisma.templateStats.findUnique({
            where: { templateId: params.id }
        })

        if (!stats) {
            return NextResponse.json(
                {
                    error: '统计信息不存在',
                    code: 'STATS_NOT_FOUND'
                },
                { status: 404 }
            )
        }

        return NextResponse.json(stats)
        
    } catch (error) {
        console.error('获取统计信息失败:', error)
        
        return NextResponse.json(
            {
                error: '获取统计信息失败',
                code: 'INTERNAL_SERVER_ERROR',
                details: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
            },
            { status: 500 }
        )
    }
}