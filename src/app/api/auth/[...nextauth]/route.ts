import NextAuth, { User as NextAuthUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { type NextAuthOptions } from 'next-auth'
import { Role } from '@prisma/client'

// 扩展 NextAuth 类型
declare module 'next-auth' {
    interface User {
        id: string
        name: string
        phone: string
        role: Role
    }
    
    interface Session {
        user: {
            id: string
            name: string
            phone: string
            role: Role
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role: Role
        phone: string
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                phone: { label: "手机号", type: "text" },
                password: { label: "密码", type: "password" }
            },
            async authorize(credentials): Promise<NextAuthUser | null> {
                if (!credentials?.phone || !credentials?.password) {
                    throw new Error('请输入手机号和密码')
                }

                const user = await prisma.user.findUnique({
                    where: { phone: credentials.phone },
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        password: true,
                        role: true,
                        status: true
                    }
                })

                if (!user || !user.password || !user.phone) {
                    throw new Error('用户不存在')
                }

                if (user.status !== 'ACTIVE') {
                    throw new Error('账号已被禁用')
                }

                const isValid = await bcrypt.compare(credentials.password, user.password)

                if (!isValid) {
                    throw new Error('密码错误')
                }

                return {
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                    role: user.role
                }
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30天
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.phone = user.phone
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!
                session.user.role = token.role
                session.user.phone = token.phone
            }
            return session
        }
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }