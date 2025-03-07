import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// 辅助函数：获取错误消息
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

// 辅助函数：验证文件类型
function validateFileType(file: File, type: string): boolean {
    if (type === 'image' || type === 'logo') {
        return file.type.startsWith('image/')
    }
    return false
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { 
                    error: '未授权访问',
                    code: 'UNAUTHORIZED'
                }, 
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const type = formData.get('type') as string // 'image' | 'logo'
        
        if (!file) {
            return NextResponse.json(
                { 
                    error: '未提供文件',
                    code: 'FILE_NOT_FOUND'
                }, 
                { status: 400 }
            )
        }

        // 验证文件类型
        if (!validateFileType(file, type)) {
            return NextResponse.json(
                { 
                    error: '不支持的文件类型',
                    code: 'INVALID_FILE_TYPE',
                    details: `仅支持图片文件`
                }, 
                { status: 400 }
            )
        }

        // 文件大小限制 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { 
                    error: '文件太大',
                    code: 'FILE_TOO_LARGE',
                    details: '文件大小不能超过 5MB'
                }, 
                { status: 400 }
            )
        }

        // 上传到blob存储
        const blob = await put(`${type}/${nanoid()}-${file.name}`, file, {
            access: 'public',
            addRandomSuffix: false
        })

        // 保存到数据库
        const asset = await prisma.asset.create({
            data: {
                userId: session.user.id,
                type,
                name: file.name,
                url: blob.url,
                size: file.size,
                mimeType: file.type
            }
        })

        return NextResponse.json({
            id: asset.id,
            url: asset.url,
            name: asset.name,
            type: asset.type
        })
        
    } catch (error) {
        console.error('[UPLOAD]', error)
        
        return NextResponse.json(
            { 
                error: '文件上传失败',
                code: 'INTERNAL_SERVER_ERROR',
                details: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined 
            }, 
            { status: 500 }
        )
    }
}