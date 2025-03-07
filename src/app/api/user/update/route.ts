import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const token = cookies().get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
    const { name } = await request.json()

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { name }
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('更新用户资料失败:', error)
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 }
    )
  }
}